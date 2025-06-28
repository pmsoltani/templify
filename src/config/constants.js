const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const allowedFileTypes = {
  ".zip": ["application/zip", "application/x-zip-compressed"],
};
const allowedExtensions = Object.keys(allowedFileTypes);
const allowedMimeTypes = Object.values(allowedFileTypes).flat();

export { MAX_FILE_SIZE, allowedFileTypes, allowedExtensions, allowedMimeTypes };
