import fs from "fs";
import * as fileRepo from "../repositories/fileRepository.js";
import * as templateRepo from "../repositories/templateRepository.js";
import AppError from "../utils/AppError.js";
import { log } from "./eventService.js";
import * as secretService from "./secretService.js";
import * as storageService from "./storageService.js";

export default class FileService {
  constructor(context = {}) {
    this.context = context;
  }

  async getAllByTemplatePublicId(templatePublicId) {
    // TODO: add logic for pagination, etc.
    return await fileRepo.getAllByTemplatePublicId(templatePublicId);
  }

  async getContent(publicId, templatePublicId) {
    const userPublicId = this.context.user.id;
    const fileDb = await fileRepo.getByPublicId(publicId);
    if (!fileDb) throw new AppError("File not found.", 404);

    const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);
    const objectKey = `${bucketPath}${fileDb.name}`;
    const fileContent = await storageService.getFile(objectKey);

    return await fileContent.Body.transformToString();
  }

  async create(templatePublicId, name, tempPath) {
    let publicId;
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "FILE_CREATE" };

    try {
      if (!tempPath) throw new AppError("Missing template file.", 400, { logData });
      const size = fs.statSync(tempPath).size;
      const filesDb = await fileRepo.getAllByTemplatePublicId(templatePublicId);
      if (filesDb.some((fileDb) => fileDb.name === name)) {
        throw new AppError("File with this name already exists.", 409, { logData });
      }
      if (size === 0) throw new AppError("Empty template file.", 400, { logData });
      const mime = ""; // TODO

      publicId = secretService.generatePublicId("file");

      const fileDb = await fileRepo.create(
        publicId,
        templatePublicId,
        name,
        size,
        mime
      );
      fileDb.template_public_id = fileDb.template_public_id || templatePublicId;

      const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);
      await storageService.uploadFile(name, tempPath, bucketPath);

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return fileDb;
    } catch (err) {
      if (publicId) await fileRepo.remove(publicId);
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to create file: ${err.message}`, 500, { logData });
    } finally {
      fs.unlinkSync(tempPath); // Clean up the temp file
    }
  }

  async remove(publicId, templatePublicId) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "FILE_REMOVE" };

    try {
      const fileDb = await fileRepo.getByPublicId(publicId);
      if (!fileDb) throw new AppError("File not found.", 404, { logData });

      // Remove all PDFs associated with this template
      const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);
      await storageService.removeFiles([`${bucketPath}${fileDb.name}`]);

      // Remove the file record from the database
      await fileRepo.remove(publicId);
      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return { id: publicId };
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to remove file: ${err.message}`, 500, { logData });
    }
  }

  async update(publicId, templatePublicId, name, tempPath) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "FILE_UPDATE" };
    try {
      if (!tempPath) throw new AppError("Missing template file.", 400, { logData });
      const size = fs.statSync(tempPath).size;
      if (size === 0) throw new AppError("Empty template file.", 400, { logData });
      const mime = ""; // TODO

      let fileDb = await fileRepo.getByPublicId(publicId);
      if (!fileDb) throw new AppError("File not found.", 404, { logData });
      const previousName = fileDb.name;

      const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);
      await storageService.removeFiles([`${bucketPath}${fileDb.name}`]);

      // Upload the new file
      await storageService.uploadFile(name || fileDb.name, tempPath, bucketPath);

      fileDb = await fileRepo.update(publicId, name || fileDb.name, size, mime);
      fileDb.template_public_id = fileDb.template_public_id || templatePublicId;

      if (name.endsWith(".html")) {
        const templateDb = await templateRepo.getByPublicIdAndUserPublicId(
          templatePublicId,
          userPublicId
        );
        if (!templateDb) throw new AppError("Template not found.", 404, { logData });

        // Update the template entrypoint if it matches the file name
        if (templateDb.html_entrypoint === previousName) {
          await templateRepo.update(
            templatePublicId,
            templateDb.name,
            name,
            templateDb.description
          );
        }
      }

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return fileDb;
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to update template: ${err.message}`, 500, { logData });
    } finally {
      fs.unlinkSync(tempPath); // Clean up the temp file
    }
  }
}
