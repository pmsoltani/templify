// function to determine the MIME type of a file
import { fileTypeFromBuffer, fileTypeFromFile } from "file-type";
import path from "path";
import { allowedFileTypes } from "../config/constants.js";

const getMime = async (filePath, fileBuffer, fileName) => {
  let mime = "";

  try {
    if (filePath) mime = (await fileTypeFromFile(filePath))?.mime;
    if (!mime && fileBuffer) mime = (await fileTypeFromBuffer(fileBuffer))?.mime;
    const fileExtension = path.extname(fileName).toLowerCase();
    if (!mime) mime = allowedFileTypes[fileExtension]?.[0];
    return mime || "application/octet-stream";
  } catch (error) {
    console.error(`Error getting MIME type for ${fileName}:`, error);
    return "application/octet-stream";
  }
};

export default getMime;
