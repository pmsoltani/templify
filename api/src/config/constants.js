const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const allowedFileTypes = {
  ".zip": ["application/zip", "application/x-zip-compressed"],
  ".html": ["text/html"],
  ".css": ["text/css"],
  ".png": ["image/png"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".svg": ["image/svg+xml"],
};
const allowedExtensions = Object.keys(allowedFileTypes);
const allowedMimeTypes = Object.values(allowedFileTypes).flat();

const NANO_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const ENTITIES = {
  user: { prefix: "usr" },
  template: { prefix: "tpl" },
  pdf: { prefix: "pdf" },
  event: { prefix: "evt" },
  file: { prefix: "fil" },
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
  "TEMPLATE_UPDATE",
  "TEMPLATE_REMOVE",
  "FILE_CREATE",
  "FILE_UPDATE",
  "FILE_REMOVE",
  "FILE_GET_CONTENT",
  "PDF_GENERATE",
  "PDF_URL_GENERATE",
];

export {
  ALLOWED_ACTIONS,
  allowedExtensions,
  allowedFileTypes,
  allowedMimeTypes,
  ENTITIES,
  MAX_FILE_SIZE,
  NANO_ALPHABET,
};
