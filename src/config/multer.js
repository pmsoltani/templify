import multer from "multer";

// Configure where to temporarily store uploaded files.
// TODO: add file size limits and other options in the future.
const upload = multer({ dest: "storage/temp/" });

export default upload;
