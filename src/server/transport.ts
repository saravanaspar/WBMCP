import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { type IncomingMessage, type Server as HttpServer, type ServerResponse } from "node:http";
import { createServer as createHttpsServer, type Server as HttpsServer } from "node:https";
import process from "node:process";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { AppConfig, HttpsTransportConfig } from "../config/env.js";
import { redactSensitive } from "../security/redact.js";
import {
  isBearerTokenAuthorized,
  isContentLengthTooLarge,
  isInitializeRequest,
  parseRequestPath
} from "./httpGuards.js";

interface HttpsSession {
  readonly server: McpServer;
  readonly transport: StreamableHTTPServerTransport;
  idleTimer: NodeJS.Timeout;
  closed: boolean;
}

type McpServerFactory = () => McpServer;

export async function connectStdioTransport(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stdin.resume();
  await waitForStdioShutdown(server);
}

export async function connectConfiguredTransport(
  config: AppConfig,
  serverFactory: McpServerFactory
): Promise<void> {
  if (config.transport.mode === "stdio") {
    await connectStdioTransport(serverFactory());
    return;
  }

  await connectHttpsTransport(serverFactory, config.transport, config.logLevel);
}

export async function connectHttpsTransport(
  serverFactory: McpServerFactory,
  config: HttpsTransportConfig,
  logLevel: AppConfig["logLevel"]
): Promise<void> {
  const sessions = new Map<string, HttpsSession>();
  const handler = createHttpsRequestHandler(config, sessions, serverFactory);
  const httpsServer = createHttpsServer(await loadTlsOptions(config), handler);

  await listen(httpsServer, config);
  logHttpsStartup(config, logLevel);
  await waitForHttpsShutdown(httpsServer, sessions);
}

function createHttpsRequestHandler(
  config: HttpsTransportConfig,
  sessions: Map<string, HttpsSession>,
  serverFactory: McpServerFactory
): (request: IncomingMessage, response: ServerResponse) => void {
  return (request, response) => {
    handleHttpsRequest(config, sessions, serverFactory, request, response).catch((error: unknown) => {
      if (!response.headersSent) {
        sendJson(response, 500, {
          ok: false,
          error: {
            type: "InternalError",
            message: "MCP HTTPS transport failed without exposing sensitive details."
          }
        });
      }
      console.error(JSON.stringify({ component: "mcp-https-transport", error: redactSensitive(error) }));
    });
  };
}

async function handleHttpsRequest(
  config: HttpsTransportConfig,
  sessions: Map<string, HttpsSession>,
  serverFactory: McpServerFactory,
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  const path = parseRequestPath(request.url);
  if (!path) {
    sendJson(response, 400, { ok: false, error: { type: "BadRequest", message: "Invalid request URL." } });
    return;
  }

  if (path !== config.path) {
    sendJson(response, 404, {
      ok: false,
      error: {
        type: "NotFound",
        message: "This server exposes only the configured MCP endpoint."
      }
    });
    return;
  }

  if (!isBearerTokenAuthorized(getHeader(request, "authorization"), config.authToken)) {
    response.setHeader("www-authenticate", "Bearer");
    sendJson(response, 401, { ok: false, error: { type: "Unauthorized", message: "Unauthorized." } });
    return;
  }

  const parsedBody = request.method === "POST" ? await readJsonBody(request, response, config.maxBodyBytes) : undefined;
  if (response.writableEnded) {
    return;
  }

  if (isNewSessionRequest(request, parsedBody) && sessions.size >= config.maxSessions) {
    sendJson(response, 429, {
      ok: false,
      error: {
        type: "TooManySessions",
        message: "Maximum active MCP sessions reached. Close an existing session or retry after idle sessions expire."
      }
    });
    return;
  }

  const session = await getHttpsSession(request, parsedBody, sessions, serverFactory, config);
  if (!session) {
    sendJson(response, 400, {
      ok: false,
      error: {
        type: "BadRequest",
        message: "Missing or invalid MCP session."
      }
    });
    return;
  }

  await session.transport.handleRequest(request, response, parsedBody);
}

async function getHttpsSession(
  request: IncomingMessage,
  parsedBody: unknown,
  sessions: Map<string, HttpsSession>,
  serverFactory: McpServerFactory,
  config: HttpsTransportConfig
): Promise<HttpsSession | undefined> {
  const sessionId = getHeader(request, "mcp-session-id");
  if (sessionId) {
    const session = sessions.get(sessionId);
    if (session) {
      refreshIdleTimer(sessionId, session, sessions, config.sessionIdleTimeoutMs);
    }
    return session;
  }

  if (!isNewSessionRequest(request, parsedBody)) {
    return undefined;
  }

  const session = createSession(serverFactory, sessions, config.sessionIdleTimeoutMs);
  await session.server.connect(session.transport as unknown as Transport);
  return session;
}

function isNewSessionRequest(request: IncomingMessage, parsedBody: unknown): boolean {
  return request.method === "POST" && isInitializeRequest(parsedBody);
}

function createSession(
  serverFactory: McpServerFactory,
  sessions: Map<string, HttpsSession>,
  idleTimeoutMs: number
): HttpsSession {
  const server = serverFactory();
  let currentSessionId: string | undefined;
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      currentSessionId = sessionId;
      markPendingSessionResolved(pendingSession);
      const session = createTrackedSession(
        server,
        transport,
        () => {
          void closeSession(sessionId, sessions);
        },
        idleTimeoutMs
      );
      sessions.set(sessionId, session);
    },
    onsessionclosed: (sessionId) => {
      void closeSession(sessionId, sessions);
    }
  });

  const pendingSession = createTrackedSession(server, transport, () => {
    void closePendingSession(pendingSession);
  }, idleTimeoutMs);
  transport.onclose = () => {
    if (currentSessionId) {
      void closeSession(currentSessionId, sessions);
    } else {
      void closePendingSession(pendingSession);
    }
  };

  return pendingSession;
}

function markPendingSessionResolved(session: HttpsSession): void {
  session.closed = true;
  clearTimeout(session.idleTimer);
}

function createTrackedSession(
  server: McpServer,
  transport: StreamableHTTPServerTransport,
  onIdle: () => void,
  idleTimeoutMs: number
): HttpsSession {
  const session: HttpsSession = {
    server,
    transport,
    idleTimer: setIdleTimer(onIdle, idleTimeoutMs),
    closed: false
  };
  session.idleTimer.unref();
  return session;
}

function refreshIdleTimer(
  sessionId: string,
  session: HttpsSession,
  sessions: Map<string, HttpsSession>,
  idleTimeoutMs: number
): void {
  clearTimeout(session.idleTimer);
  session.idleTimer = setIdleTimer(() => {
    void closeSession(sessionId, sessions);
  }, idleTimeoutMs);
  session.idleTimer.unref();
}

function setIdleTimer(onIdle: () => void, idleTimeoutMs: number): NodeJS.Timeout {
  return setTimeout(() => {
    onIdle();
  }, idleTimeoutMs);
}

async function closeSession(sessionId: string, sessions: Map<string, HttpsSession>): Promise<void> {
  const session = sessions.get(sessionId);
  if (!session) {
    return;
  }

  sessions.delete(sessionId);
  await closeTrackedSession(session);
}

async function closePendingSession(session: HttpsSession): Promise<void> {
  await closeTrackedSession(session);
}

async function closeTrackedSession(session: HttpsSession): Promise<void> {
  if (session.closed) {
    return;
  }

  session.closed = true;
  clearTimeout(session.idleTimer);
  await Promise.allSettled([session.transport.close(), session.server.close()]);
}

async function readJsonBody(
  request: IncomingMessage,
  response: ServerResponse,
  maxBodyBytes: number
): Promise<unknown> {
  const contentLength = getHeader(request, "content-length");
  if (isContentLengthTooLarge(contentLength, maxBodyBytes)) {
    sendJson(response, 413, { ok: false, error: { type: "PayloadTooLarge", message: "Request body is too large." } });
    return undefined;
  }

  const text = await readLimitedBody(request, maxBodyBytes);
  if (text === undefined) {
    sendJson(response, 413, { ok: false, error: { type: "PayloadTooLarge", message: "Request body is too large." } });
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    sendJson(response, 400, { ok: false, error: { type: "BadRequest", message: "Request body must be JSON." } });
    return undefined;
  }
}

async function readLimitedBody(request: IncomingMessage, maxBodyBytes: number): Promise<string | undefined> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    totalBytes += buffer.byteLength;
    if (totalBytes > maxBodyBytes) {
      return undefined;
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function loadTlsOptions(config: HttpsTransportConfig): Promise<{
  cert: Buffer;
  key: Buffer;
}> {
  const [cert, key] = await Promise.all([
    readFile(config.tlsCertFile),
    readFile(config.tlsKeyFile)
  ]);
  return { cert, key };
}

function getHeader(request: IncomingMessage, name: string): string | undefined {
  const value = request.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

async function listen(server: HttpsServer, config: HttpsTransportConfig): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, config.host, () => {
      server.off("error", reject);
      resolve();
    });
  });
}

function logHttpsStartup(config: HttpsTransportConfig, logLevel: AppConfig["logLevel"]): void {
  if (logLevel === "silent") {
    return;
  }

  console.error(
    JSON.stringify({
      component: "WBMCP",
      transport: "https",
      endpoint: `https://${config.host}:${config.port}${config.path}`,
      maxSessions: config.maxSessions,
      sessionIdleTimeoutMs: config.sessionIdleTimeoutMs
    })
  );
}

async function waitForStdioShutdown(server: McpServer): Promise<void> {
  await new Promise<void>((resolve) => {
    const keepAlive = setInterval(() => {
      process.stdin.read(0);
    }, 60_000);
    let finished = false;
    const finish = (): void => {
      if (finished) {
        return;
      }
      finished = true;
      clearInterval(keepAlive);
      process.stdin.off("end", finish);
      process.off("SIGINT", finish);
      process.off("SIGTERM", finish);
      void server.close().then(resolve, resolve);
    };
    process.stdin.once("end", finish);
    process.once("SIGINT", finish);
    process.once("SIGTERM", finish);
  });
}

async function waitForHttpsShutdown(
  server: HttpServer | HttpsServer,
  sessions: Map<string, HttpsSession>
): Promise<void> {
  await new Promise<void>((resolve) => {
    let shuttingDown = false;
    const shutdown = (): void => {
      if (shuttingDown) {
        return;
      }
      shuttingDown = true;
      process.off("SIGINT", shutdown);
      process.off("SIGTERM", shutdown);
      void closeSessions(sessions)
        .then(() => closeHttpServer(server))
        .then(resolve, resolve);
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  });
}

async function closeHttpServer(server: HttpServer | HttpsServer): Promise<void> {
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
}

async function closeSessions(sessions: Map<string, HttpsSession>): Promise<void> {
  const sessionIds = [...sessions.keys()];
  await Promise.all(sessionIds.map((sessionId) => closeSession(sessionId, sessions)));
}
