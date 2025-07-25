import fs from "fs";
import { DEFAULT_PDF_SETTINGS } from "../config/pdfSettings.js";
import { BUCKETS } from "../config/s3Client.js";
import * as templateRepo from "../repositories/templateRepository.js";
import AppError from "../utils/AppError.js";
import getMime from "../utils/getMime.js";
import * as storageService from "./storageService.js";
import TemplateService from "./TemplateService.js";

export default class HubService {
  constructor(context = {}) {
    this.context = context;
  }

  async copyStarterTemplates() {
    const userPublicId = this.context.user.id;
    const userTemplatePublicIds = [];
    const hubBucketPrefix = "starterTemplates/";

    try {
      const hubTemplates = await storageService.listDirs(BUCKETS.hub, hubBucketPrefix);

      for (const templateName of hubTemplates) {
        const tempDir = await storageService.downloadTemplate(
          BUCKETS.hub,
          `${hubBucketPrefix}${templateName}/`
        );

        const files = await Promise.all(
          fs.readdirSync(tempDir).map(async (fileName) => {
            const filePath = `${tempDir}/${fileName}`;
            return {
              originalname: fileName,
              path: filePath,
              mimetype: await getMime(filePath, undefined, fileName),
              size: fs.statSync(filePath).size,
            };
          })
        );

        const templateDb = await new TemplateService(this.context).create(
          templateName,
          null,
          "template.html",
          DEFAULT_PDF_SETTINGS,
          files
        );

        userTemplatePublicIds.push(templateDb.public_id);
      }
    } catch (err) {
      console.error("@copyStarterTemplates Error:", err);
      for (const templatePublicId of userTemplatePublicIds) {
        const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);
        await storageService.removeTemplate(bucketPath);
        await templateRepo.remove(templatePublicId);
      }
      if (err instanceof AppError) throw err;
      throw new AppError(`Failed to copy starter templates: ${err.message}`, 500);
    }
  }
}
