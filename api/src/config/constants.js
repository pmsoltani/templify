const APP_INFO = {
  name: process.env.APP_NAME || "Templify",
  tagline: process.env.APP_TAGLINE || "Automated PDF Generation Made Simple",
  description:
    process.env.APP_DESCRIPTION ||
    "Generate custom PDFs from data using your own HTML/CSS templates.",
  version: process.env.APP_VERSION || "0.1.0",
  author: {
    name: process.env.APP_AUTHOR || "Pooria Soltani",
    url: process.env.APP_AUTHOR_URL || "https://github.com/pmsoltani",
  },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const allowedFileTypes = {
  ".html": ["text/html"],
  ".htm": ["text/html"],
  ".css": ["text/css"],
  ".png": ["image/png"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".svg": ["image/svg+xml"],
};
const allowedExtensions = Object.keys(allowedFileTypes);
const allowedMimeTypes = Object.values(allowedFileTypes).flat();

const TEXT_FILE_EXTENSIONS = [".html", ".htm", ".css"];

const NANO_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const ENTITIES = {
  user: { prefix: "usr" },
  template: { prefix: "tpl" },
  pdf: { prefix: "pdf" },
  event: { prefix: "evt" },
  file: { prefix: "fil" },
  hubTemplate: { prefix: "hub" },
};

const ALLOWED_ACTIONS = [
  "SCHEMA_VALIDATION",
  "USER_LOGIN",
  "USER_LOGOUT",
  "USER_REGISTER",
  "USER_CONFIRM_EMAIL",
  "USER_RESEND_CONFIRM_EMAIL",
  "USER_PASSWORD_FORGOT",
  "USER_PASSWORD_RESET",
  "USER_EMAIL_UPDATE",
  "USER_PASSWORD_UPDATE",
  "USER_APIKEY_GENERATE",
  "USER_ACCOUNT_REMOVE",
  "TEMPLATE_CREATE",
  "TEMPLATE_DOWNLOAD",
  "TEMPLATE_UPDATE",
  "TEMPLATE_REMOVE",
  "TEMPLATE_PREVIEW",
  "TEMPLATE_GET",
  "TEMPLATE_GET_VARIABLES",
  "FILE_CREATE",
  "FILE_UPDATE",
  "FILE_UPDATE_CONTENT",
  "FILE_REMOVE",
  "FILE_GET_CONTENT",
  "PDF_GENERATE",
  "PDF_GENERATE_PREVIEW",
  "PDF_GENERATE_URL",
  "HUB_TEMPLATE_CREATE",
  "HUB_TEMPLATE_GET",
  "HUB_TEMPLATE_IMPORT",
  "HUB_TEMPLATE_REMOVE",
  "HUB_TEMPLATE_UPDATE",
];

export {
  ALLOWED_ACTIONS,
  allowedExtensions,
  allowedFileTypes,
  allowedMimeTypes,
  APP_INFO,
  ENTITIES,
  MAX_FILE_SIZE,
  NANO_ALPHABET,
  TEXT_FILE_EXTENSIONS,
};
