export const SERVER_NAME = "WBMCP";
export const SERVER_VERSION = "0.1.0";

export const GRAPH_API_BASE_URL = "https://graph.facebook.com";
export const DEFAULT_GRAPH_API_VERSION = "v24.0";
export const SUPPORTED_GRAPH_API_VERSIONS = ["v24.0", "v23.0", "v22.0"] as const;

export const DEFAULT_HTTP_TIMEOUT_MS = 15_000;
export const DEFAULT_MAX_RETRIES = 2;

export const DEFAULT_MCP_HTTPS_HOST = "127.0.0.1";
export const DEFAULT_MCP_HTTPS_PORT = 3443;
export const DEFAULT_MCP_HTTPS_PATH = "/mcp";
export const DEFAULT_MCP_HTTPS_MAX_BODY_BYTES = 1_048_576;
export const DEFAULT_MCP_HTTPS_MAX_SESSIONS = 100;
export const DEFAULT_MCP_HTTPS_SESSION_IDLE_TIMEOUT_MS = 900_000;

export const MAX_TEXT_MESSAGE_LENGTH = 4096;
export const MAX_CAPTION_LENGTH = 1024;
export const MAX_TEMPLATE_PARAMETER_LENGTH = 1024;
export const MAX_CLIENT_MESSAGE_ID_LENGTH = 128;
export const MAX_INTERACTIVE_BODY_LENGTH = 1024;
export const MAX_INTERACTIVE_TITLE_LENGTH = 60;
export const MAX_BUTTON_TITLE_LENGTH = 20;
export const MAX_LIST_ROWS = 10;
export const MAX_TEMPLATE_COMPONENTS = 10;
export const MAX_TEMPLATE_PARAMETERS = 20;
