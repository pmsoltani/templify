const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const allowedFileTypes = {
  ".zip": ["application/zip", "application/x-zip-compressed"],
};
const allowedExtensions = Object.keys(allowedFileTypes);
const allowedMimeTypes = Object.values(allowedFileTypes).flat();

const NANO_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const ENTITIES = {
  user: { prefix: "usr" },
  template: { prefix: "tpl" },
  pdf: { prefix: "pdf" },
  event: { prefix: "evt" },
};

const ALLOWED_ACTIONS = [
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
  "PDF_GENERATE",
  "PDF_URL_GENERATE",
];

export {
  MAX_FILE_SIZE,
  allowedFileTypes,
  allowedExtensions,
  allowedMimeTypes,
  NANO_ALPHABET,
  ENTITIES,
  ALLOWED_ACTIONS,
};
