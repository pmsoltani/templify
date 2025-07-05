import fs from "fs";
import * as pdfRepo from "../repositories/pdfRepository.js";
import * as templateRepo from "../repositories/templateRepository.js";
import AppError from "../utils/AppError.js";
import { log } from "./eventService.js";
import * as secretService from "./secretService.js";
import * as storageService from "./storageService.js";

export default class TemplateService {
  constructor(context = {}) {
    this.context = context;
  }

  async getAllByUserPublicId() {
    // TODO: add logic for pagination, etc.
    return await templateRepo.getAllByUserPublicId(this.context.user.id);
  }

  async create(templateName, htmlEntrypoint, description, tempZipPath) {
    let publicId;
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_CREATE" };

    try {
      if (!tempZipPath) throw new AppError("Missing template file.", 400, { logData });

      publicId = secretService.generatePublicId("template");

      const templateDb = await templateRepo.create(
        userPublicId,
        templateName,
        htmlEntrypoint || "template.html",
        description || null,
        publicId
      );
      const bucketPath = storageService.getBucketPath(userPublicId, publicId);
      await storageService.unzipAndUpload(tempZipPath, bucketPath);

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      templateDb.user_public_id = templateDb.user_public_id || userPublicId;
      return templateDb;
    } catch (err) {
      if (publicId) await templateRepo.remove(publicId);
      throw new AppError(`Failed to create template: ${err.message}`, 500, { logData });
    } finally {
      fs.unlinkSync(tempZipPath); // Clean up the temp file
    }
  }

  async remove(publicId) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_REMOVE" };
    const templateDb = await templateRepo.getByPublicIdAndUserPublicId(
      publicId,
      userPublicId
    );
    if (!templateDb) throw new AppError("Template not found.", 404, { logData });

    // Remove all PDFs associated with this template
    const pdfsDb = await pdfRepo.getAllByTemplatePublicId(publicId);
    const pdfKeys = pdfsDb.map((pdf) => pdf.storage_object_key);
    await storageService.removeFiles(pdfKeys);

    // Remove the template files from storage
    const bucketPath = storageService.getBucketPath(userPublicId, publicId);
    await storageService.removeTemplate(bucketPath);

    // Remove the template record from the database
    await templateRepo.remove(publicId);
    await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
    return { id: publicId };
  }

  async update(publicId, updateData, tempZipPath) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_UPDATE" };
    try {
      if (!tempZipPath) throw new AppError("Missing template file.", 400, { logData });

      let templateDb = await templateRepo.getByPublicIdAndUserPublicId(
        publicId,
        userPublicId
      );
      if (!templateDb) throw new AppError("Template not found.", 404, { logData });

      const bucketPath = storageService.getBucketPath(userPublicId, publicId);
      await storageService.removeTemplate(bucketPath);
      await storageService.unzipAndUpload(tempZipPath, bucketPath);

      templateDb = await templateRepo.update(
        publicId,
        updateData.name || templateDb.name,
        updateData.htmlEntrypoint || templateDb.html_entrypoint,
        updateData.description || templateDb.description
      );
      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      templateDb.user_public_id = templateDb.user_public_id || userPublicId;
      return templateDb;
    } catch (err) {
      throw new AppError(`Failed to update template: ${err.message}`, 500, { logData });
    } finally {
      fs.unlinkSync(tempZipPath); // Clean up the temp file
    }
  }
}
