import fs from "fs";
import * as fileRepo from "../repositories/fileRepository.js";
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
    const logData = { userPublicId: userPublicId, action: "FILE_GET_CONTENT" };

    try {
      const fileDb = await fileRepo.getByPublicId(publicId);
      if (!fileDb) throw new AppError("File not found.", 404, { logData });

      const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);
      const objectKey = `${bucketPath}${fileDb.name}`;
      const fileContent = await storageService.getFile(objectKey);

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return await fileContent.Body.transformToString();
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError("Failed to retrieve file content.", 500, { logData });
    }
  }
  async create(templatePublicId, file) {
    let publicId;
    let isUploaded = false;
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "FILE_CREATE" };
    const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);

    try {
      if (!file || !file.path) throw new AppError("Missing file.", 400, { logData });
      const size = file.size ? file.size : fs.statSync(file.path).size;
      // if (size === 0) throw new AppError("Empty template file.", 400, { logData });
      const filesDb = await fileRepo.getAllByTemplatePublicId(templatePublicId);
      if (filesDb.some((fileDb) => fileDb.name === file.originalname)) {
        throw new AppError("Template already has this file.", 409, { logData });
      }

      publicId = secretService.generatePublicId("file");

      const fileDb = await fileRepo.create(
        publicId,
        templatePublicId,
        file.originalname,
        size,
        file.mimetype || ""
      );
      fileDb.template_public_id = fileDb.template_public_id || templatePublicId;

      await storageService.uploadFiles(bucketPath, [file]);
      isUploaded = true;

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return fileDb;
    } catch (err) {
      if (isUploaded) {
        await storageService.removeFiles([`${bucketPath}${file.originalname}`]);
      }
      if (publicId) await fileRepo.remove(publicId);
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to create file: ${err.message}`, 500, { logData });
    } finally {
      if (file.path) fs.unlinkSync(file.path); // Clean up the temp file
    }
  }

  async remove(publicId, templatePublicId) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "FILE_REMOVE" };
    const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);

    try {
      const fileDb = await fileRepo.getByPublicId(publicId);
      if (!fileDb) throw new AppError("File not found.", 404, { logData });

      // Remove the file from the storage
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

  async updateContent(publicId, templatePublicId, content) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "FILE_UPDATE_CONTENT" };

    try {
      let fileDb = await fileRepo.getByPublicId(publicId);
      if (!fileDb) throw new AppError("File not found.", 404, { logData });

      // Upload new content to storage
      const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);
      const buffer = Buffer.from(content, "utf8");
      await storageService.uploadBuffer(bucketPath, fileDb.name, buffer);

      // Update file size in database
      const updateData = { name: file.originalname, size: buffer.length };
      fileDb = await fileRepo.update(publicId, updateData);

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return fileDb;
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to update content: ${err.message}`, 500, { logData });
    }
  }
}
