import multer from "multer";
import AppError from "../utils/AppError.js";
import { MAX_FILE_SIZE, allowedExtensions, allowedMimeTypes } from "./constants.js";

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new AppError(`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`, 400),
      false
    );
  }
};

// Configure where to temporarily store uploaded files.
const upload = multer({
  dest: "storage/temp/",
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
});

export default upload;
