import * as hubRepo from "../repositories/hubRepository.js";
import * as templateRepo from "../repositories/templateRepository.js";
import AppError from "../utils/AppError.js";
import { log } from "./eventService.js";
import * as secretService from "./secretService.js";
import * as storageService from "./storageService.js";

export default class HubService {
  constructor(context = {}) {
    this.context = context;
  }

  async getAll(filters = {}) {
    const userPublicId = this.context.user?.id;
    const logData = { userPublicId, action: "HUB_TEMPLATE_GET" };

    try {
      const hubTemplatesDb = await hubRepo.getAll(filters);
      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return hubTemplatesDb;
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to get hub templates: ${err.message}`, 500, {
        logData,
      });
    }
  }

  async getByPublicId(publicId) {
    const userPublicId = this.context.user?.id;
    const logData = { userPublicId, action: "HUB_TEMPLATE_GET" };

    try {
      const hubTemplateDb = await hubRepo.getByPublicId(publicId);
      if (!hubTemplateDb) {
        throw new AppError("Hub template not found.", 404, { logData });
      }

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return hubTemplateDb;
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to get hub template: ${err.message}`, 500, {
        logData,
      });
    }
  }

  async publish(templatePublicId, publishData) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId, action: "HUB_TEMPLATE_CREATE" };

    try {
      // Check if template exists and belongs to user
      const templateDb = await templateRepo.getByPublicIdAndUserPublicId(
        templatePublicId,
        userPublicId
      );
      if (!templateDb) throw new AppError("Template not found.", 404, { logData });

      // Check if template is already published
      const existingHubTemplate = await hubRepo.getByTemplateId(templateDb.id);
      if (existingHubTemplate) {
        throw new AppError("Hub template already exists.", 409, { logData });
      }

      // Generate public ID for hub template
      const publicId = secretService.generatePublicId("hubTemplate");

      // Copy template files from user bucket to hub bucket
      const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);
      const hubBucketPath = `hub/${publicId}/`;

      await storageService.copyTemplate(bucketPath, hubBucketPath);

      // Create hub template record
      const hubTemplateDb = await hubRepo.create(
        templateDb.user_id,
        templateDb.id,
        publishData.name,
        templateDb.entrypoint,
        publishData.description,
        publishData.category,
        publishData.tags,
        publicId
      );

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return hubTemplateDb;
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to publish template: ${err.message}`, 500, {
        logData,
      });
    }
  }

  async update(publicId, updateData) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId, action: "HUB_TEMPLATE_UPDATE" };

    try {
      // Check if hub template exists and belongs to user
      const hubTemplateDb = await hubRepo.getByPublicIdAndAuthorId(
        publicId,
        this.context.user.dbId
      );
      if (!hubTemplateDb) {
        throw new AppError("Hub template not found.", 404, { logData });
      }

      const updatedTemplateDb = await hubRepo.update(publicId, updateData);
      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return updatedTemplateDb;
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to update hub template: ${err.message}`, 500, {
        logData,
      });
    }
  }

  async remove(publicId) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId, action: "HUB_TEMPLATE_REMOVE" };

    try {
      // Check if hub template exists and belongs to user
      const hubTemplateDb = await hubRepo.getByPublicIdAndAuthorId(
        publicId,
        this.context.user.dbId
      );
      if (!hubTemplateDb) {
        throw new AppError("Hub template not found.", 404, { logData });
      }

      // Remove files from hub bucket
      const hubBucketPath = `hub/${publicId}/`;
      await storageService.removeTemplate(hubBucketPath);

      // Remove hub template record
      await hubRepo.remove(publicId);

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to remove hub template: ${err.message}`, 500, {
        logData,
      });
    }
  }

  async import(publicId) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId, action: "HUB_TEMPLATE_IMPORT" };

    try {
      // Get hub template
      const hubTemplateDb = await hubRepo.getByPublicId(publicId);
      if (!hubTemplateDb) {
        throw new AppError("Hub template not found.", 404, { logData });
      }

      // Generate new template ID for user
      const newTemplateId = secretService.generatePublicId("template");

      // Copy files from hub bucket to user bucket
      const hubBucketPath = `hub/${publicId}/`;
      const userBucketPath = storageService.getBucketPath(userPublicId, newTemplateId);

      await storageService.copyTemplate(hubBucketPath, userBucketPath);

      // Create new template record for user
      const newTemplateDb = await templateRepo.create(
        userPublicId,
        hubTemplateDb.name,
        hubTemplateDb.entrypoint,
        hubTemplateDb.description,
        {}, // Default settings
        newTemplateId
      );

      // Increment download counter
      await hubRepo.incrementDownloads(publicId);

      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return newTemplateDb;
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to import hub template: ${err.message}`, 500, {
        logData,
      });
    }
  }
}
