import fs from "fs";
import * as fileService from "./fileService.js";
import * as templateRepo from "../repositories/templateRepository.js";

const getAllByUserId = async (userId) => {
  // TODO: add logic for pagination, etc.
  return await templateRepo.getAllByUserId(userId);
};

const create = async (
  userId,
  templateName,
  htmlEntrypoint,
  description,
  tempZipPath
) => {
  const templateDb = await templateRepo.create(
    userId,
    templateName,
    htmlEntrypoint,
    description
  );
  await fileService.unzipAndUpload(tempZipPath, `userFiles/${userId}/${templateDb.id}`);
  fs.unlinkSync(tempZipPath); // Clean up the temp file
  return templateDb;
};

const remove = async (userId, templateId) => {
  const templateDb = await templateRepo.getByIdAndUserId(templateId, userId);
  if (!templateDb) throw new Error("Template not found.");

  const bucketPath = `userFiles/${userId}/${templateId}/`;
  await fileService.removeTemplate(bucketPath);
  await templateRepo.remove(templateId);
  return { id: templateId };
};

const update = async (userId, templateId, updateData, tempZipPath) => {
  const templateDb = await templateRepo.getByIdAndUserId(templateId, userId);
  if (!templateDb) throw new Error("Template not found.");
  const bucketPath = `userFiles/${userId}/${templateId}/`;
  await fileService.removeTemplate(bucketPath);
  await fileService.unzipAndUpload(tempZipPath, bucketPath);
  fs.unlinkSync(tempZipPath); // Clean up the temp file
  return await templateRepo.update(
    userId,
    templateId,
    updateData.name || templateDb.name,
    updateData.htmlEntrypoint || templateDb.html_entrypoint,
    updateData.description || templateDb.description
  );
};

export { getAllByUserId, create, remove, update };
