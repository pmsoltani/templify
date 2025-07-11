import fs from "fs";
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
      const unzippedFiles = await storageService.unzip(tempZipPath);
      unzippedFiles.forEach(async (fileObj) => {
        await new FileService(this.context).create(publicId, fileObj.name, "", fileObj);
      });

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

  async createSlim(
    templateName,
    description = null,
    htmlEntrypoint = "template.html",
    files = []
  ) {
    let publicId = secretService.generatePublicId("template");
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_CREATE" };

    try {
      const templateDb = await templateRepo.create(
        userPublicId,
        templateName,
        htmlEntrypoint,
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

      templateDb = await templateRepo.update(publicId, updateData);
      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      templateDb.user_public_id = templateDb.user_public_id || userPublicId;
      return templateDb;
    } catch (err) {
      throw new AppError(`Failed to update template: ${err.message}`, 500, { logData });
    } finally {
      fs.unlinkSync(tempZipPath); // Clean up the temp file
    }
  }

  async updateInfo(publicId, updateData) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_UPDATE" };
    try {
      let templateDb = await templateRepo.getByPublicIdAndUserPublicId(
        publicId,
        userPublicId
      );
      if (!templateDb) throw new AppError("Template not found.", 404, { logData });

      templateDb = await templateRepo.update(publicId, updateData);
      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      templateDb.user_public_id = templateDb.user_public_id || userPublicId;
      return templateDb;
    } catch (err) {
      throw new AppError(`Failed to update template: ${err.message}`, 500, { logData });
    }
  }

  async getVariables(publicId) {
    // function to get all mustache variables from a template
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_GET_VARIABLES" };
    const templateDb = await templateRepo.getByPublicIdAndUserPublicId(
      publicId,
      userPublicId
    );
    if (!templateDb) throw new AppError("Template not found.", 404, { logData });
  }

  async getVariables(publicId) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "TEMPLATE_GET_VARIABLES" };

    try {
      const templateDb = await templateRepo.getByPublicIdAndUserPublicId(
        publicId,
        userPublicId
      );
      if (!templateDb) throw new AppError("Template not found.", 404, { logData });

      // Get all HTML files for this template
      const filesDb = await fileRepo.getAllByTemplatePublicId(publicId);
      const htmlFiles = filesDb.filter((f) => f.name.toLowerCase().endsWith(".html"));

      if (htmlFiles.length === 0) {
        throw new AppError("No HTML files found in template.", 404, { logData });
      }

      const bucketPath = storageService.getBucketPath(userPublicId, publicId);
      const allVariables = new Set();

      // Process each HTML file
      for (const file of htmlFiles) {
        const objectKey = `${bucketPath}${file.name}`;
        const fileContent = await storageService.getFile(objectKey);
        const htmlContent = await fileContent.Body.transformToString();

        // Extract variables using regex (mustache format: {{variable}})
        const variables = this.extractMustacheVariables(htmlContent);
        variables.forEach((variable) => allVariables.add(variable));
      }

      // Convert Set to Array and create variable objects
      const variableList = Array.from(allVariables).map((variable) => ({
        name: variable,
        required: true, // Default to required
        defaultValue: null,
      }));

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return variableList;
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
   * @param {String} htmlContent
   */
  extractMustacheVariables(htmlContent) {
    const variables = new Set();

    // Regex to match mustache variables: {{variable}} or {{user.name}}
    // Excludes sections/partials: {{#section}}, {{/section}}, {{>partial}}
    const mustacheRegex = /\{\{(?!\#|\/|\>)\s*([^}]+?)\s*\}\}/g;

    for (const match of htmlContent.matchAll(mustacheRegex)) {
      const variable = match[1].trim();

      // Skip mustache helpers/conditionals
      if (!variable.includes("&") && !variable.includes("{")) variables.add(variable);
      // For nested objects like 'user.name', we might want just 'user'
      // or keep the full path - let's keep the full path for now
    }
    return Array.from(variables);
  }
}
