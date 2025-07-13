import path from "path";
import { TEXT_FILE_EXTENSIONS } from "../config/constants.js";
import * as fileRepo from "../repositories/fileRepository.js";
import * as pdfRepo from "../repositories/pdfRepository.js";
import * as templateRepo from "../repositories/templateRepository.js";
import AppError from "../utils/AppError.js";
import { log } from "./eventService.js";
import FileService from "./FileService.js";
import * as secretService from "./secretService.js";
import * as storageService from "./storageService.js";

export default class TemplateService {
  constructor(context = {}) {
    this.context = context;
  }

  async get(publicId) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_GET" };

    try {
      const templateDb = await templateRepo.getByPublicIdAndUserPublicId(
        publicId,
        userPublicId
      );
      if (!templateDb) throw new AppError("Template not found.", 404, { logData });
      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return templateDb;
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to get template: ${err.message}`, 500, { logData });
    }
  }

  async getAllByUserPublicId() {
    // TODO: add logic for pagination, etc.
    return await templateRepo.getAllByUserPublicId(this.context.user.id);
  }

  async create(
    templateName,
    description = null,
    entrypoint = "template.html",
    files = []
  ) {
    let publicId = secretService.generatePublicId("template");
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_CREATE" };

    try {
      const templateDb = await templateRepo.create(
        userPublicId,
        templateName,
        entrypoint || "template.html",
        description,
        publicId
      );

      if (files.length > 0) {
        const fileService = new FileService(this.context);
        files.forEach(async (file) => await fileService.create(publicId, file));
      }

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      templateDb.user_public_id = templateDb.user_public_id || userPublicId;
      return templateDb;
    } catch (err) {
      if (publicId) await templateRepo.remove(publicId);
      throw new AppError(`Failed to create template: ${err.message}`, 500, { logData });
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

  async update(publicId, updateData, files = []) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_UPDATE" };
    try {
      let templateDb = await templateRepo.getByPublicIdAndUserPublicId(
        publicId,
        userPublicId
      );
      if (!templateDb) throw new AppError("Template not found.", 404, { logData });

      if (files.length > 0) {
        const fileService = new FileService(this.context);
        files.forEach(async (file) => await fileService.create(publicId, file));
      }

      templateDb = await templateRepo.update(publicId, updateData);
      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      templateDb.user_public_id = templateDb.user_public_id || userPublicId;
      return templateDb;
    } catch (err) {
      throw new AppError(`Failed to update template: ${err.message}`, 500, { logData });
    }
  }

  async getVariables(publicId) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_GET_VARIABLES" };
    const bucketPath = storageService.getBucketPath(userPublicId, publicId);

    try {
      const templateDb = await templateRepo.getByPublicIdAndUserPublicId(
        publicId,
        userPublicId
      );
      if (!templateDb) throw new AppError("Template not found.", 404, { logData });

      const filesDb = await fileRepo.getAllByTemplatePublicId(publicId);
      if (filesDb.length === 0) {
        throw new AppError("No HTML files found in template.", 404, { logData });
      }

      const allVariables = new Set();
      for (const file of filesDb) {
        const fileExt = path.extname(file.name).toLowerCase();
        if (!TEXT_FILE_EXTENSIONS.includes(fileExt)) continue;
        const fileObj = await storageService.getFileObject(`${bucketPath}${file.name}`);
        const fileContent = await fileObj.Body.transformToString();

        const variables = this.extractMustacheVariables(fileContent);
        variables.forEach((variable) => allVariables.add(variable));
      }

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return Array.from(allVariables);
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to get template variables: ${err.message}`, 500, {
        logData,
      });
    }
  }

  /**
   * Extract mustache variables from HTML content
   * Supports: {{variable}}, {{user.name}}, {{#section}}{{/section}}
   * @param {String} textContent
   */
  extractMustacheVariables(textContent) {
    const variables = new Set();

    // Regex to match mustache variables: {{variable}} or {{user.name}}
    // Excludes sections/partials: {{#section}}, {{/section}}, {{>partial}}
    const mustacheRegex = /\{{2,3}(?!\#|\/|\>)\s*([^}]+?)\s*\}{2,3}/g;

    for (const match of textContent.matchAll(mustacheRegex)) {
      const variable = match[1].trim();

      // Skip mustache helpers/conditionals
      if (!variable.includes("&") && !variable.includes("{")) variables.add(variable);
      // For nested objects like 'user.name', we might want just 'user'
      // or keep the full path - let's keep the full path for now
    }
    return Array.from(variables).sort((a, b) => a.localeCompare(b));
  }
}
