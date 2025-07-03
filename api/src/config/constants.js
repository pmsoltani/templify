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
};

export {
  MAX_FILE_SIZE,
  allowedFileTypes,
  allowedExtensions,
  allowedMimeTypes,
  NANO_ALPHABET,
  ENTITIES,
};
