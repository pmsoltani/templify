// function to determine the MIME type of a file
import { fileTypeFromBuffer, fileTypeFromFile } from "file-type";
import path from "path";
import { allowedFileTypes } from "../config/constants.js";

const getMime = async (file) => {
  let mimeType;

  try {
    mimeType = file.path
      ? await fileTypeFromFile(file.path)
      : await fileTypeFromBuffer(file.buffer);
    if (mimeType) return mimeType.mime;
    mimeType = allowedFileTypes[path.extname(file.originalname).toLowerCase()]?.[0];
    return mimeType || "application/octet-stream";
  } catch (error) {
    console.error(`Error getting MIME type for ${file.path}:`, error);
    return null;
  }
};

export default getMime;
