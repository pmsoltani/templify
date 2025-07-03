import fs from "fs";
import * as fileService from "./fileService.js";
import * as secretService from "./secretService.js";
import * as pdfRepo from "../repositories/pdfRepository.js";
import * as templateRepo from "../repositories/templateRepository.js";
import AppError from "../utils/AppError.js";

const getAllByUserPublicId = async (userPublicId) => {
  // TODO: add logic for pagination, etc.
  return await templateRepo.getAllByUserPublicId(userPublicId);
};

const create = async (
  userPublicId,
  templateName,
  htmlEntrypoint,
  description,
  tempZipPath
) => {
  const publicId = secretService.generatePublicId("template");
  const templateDb = await templateRepo.create(
    userPublicId,
    templateName,
    htmlEntrypoint,
    description,
    publicId
  );
  const bucketPath = `userFiles/${userPublicId}/${publicId}`;
  await fileService.unzipAndUpload(tempZipPath, bucketPath);
  fs.unlinkSync(tempZipPath); // Clean up the temp file
  return templateDb;
};

const remove = async (userPublicId, publicId) => {
  const templateDb = await templateRepo.getByPublicIdAndUserPublicId(
    publicId,
    userPublicId
  );
  if (!templateDb) throw new AppError("Template not found.", 404);

  // Remove all PDFs associated with this template
  const pdfsDb = await pdfRepo.getAllByTemplatePublicId(publicId);
  const pdfKeys = pdfsDb.map((pdf) => pdf.storage_object_key);
  await fileService.removePdfs(pdfKeys);

  // Remove the template files from storage
  const bucketPath = `userFiles/${userPublicId}/${publicId}/`;
  await fileService.removeTemplate(bucketPath);

  // Remove the template record from the database
  await templateRepo.remove(publicId);
  return { id: publicId };
};

const update = async (userPublicId, publicId, updateData, tempZipPath) => {
  const templateDb = await templateRepo.getByPublicIdAndUserPublicId(
    publicId,
    userPublicId
  );
  if (!templateDb) throw new AppError("Template not found.", 404);

  const bucketPath = `userFiles/${userPublicId}/${publicId}/`;
  await fileService.removeTemplate(bucketPath);
  await fileService.unzipAndUpload(tempZipPath, bucketPath);
  fs.unlinkSync(tempZipPath); // Clean up the temp file
  return await templateRepo.update(
    publicId,
    updateData.name || templateDb.name,
    updateData.htmlEntrypoint || templateDb.html_entrypoint,
    updateData.description || templateDb.description
  );
};

export { getAllByUserPublicId as getAllByUserId, create, remove, update };
