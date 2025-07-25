import fs from "fs";
import DOMPurify from "isomorphic-dompurify";
import mustache from "mustache";
import path from "path";
import { pathToFileURL } from "url";
import { TEXT_FILE_EXTENSIONS } from "../config/constants.js";
import { PURIFY_EXTENSIONS, PURIFY_OPTIONS } from "../config/domPurify.js";
import { getBrowserInstance } from "../config/puppeteer.js";
import { BUCKETS } from "../config/s3Client.js";
import * as pdfRepo from "../repositories/pdfRepository.js";
import * as templateRepo from "../repositories/templateRepository.js";
import { publicTemplate } from "../schemas/templateSchema.js";
import AppError from "../utils/AppError.js";
import { log } from "./eventService.js";
import * as secretService from "./secretService.js";
import * as storageService from "./storageService.js";

export default class PdfService {
  constructor(context = {}) {
    this.context = context;
  }

  async getAllByUserPublicId() {
    // TODO: add logic for pagination, etc.
    return await pdfRepo.getAllByUserPublicId(this.context.user.id);
  }

  async getDownloadLink(publicId) {
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "PDF_GENERATE_URL" };
    const pdfDb = await pdfRepo.getByPublicIdAndUserPublicID(publicId, userPublicId);
    if (!pdfDb) throw new AppError("PDF record not found.", 404, { logData });

    pdfDb.temp_url = await storageService.getPresignedUrl(
      BUCKETS.pdfs,
      pdfDb.storage_object_key
    );
    await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
    return pdfDb;
  }

  async generatePdf(templatePublicId, jsonData = {}, preview = false) {
    let publicId;
    let tempDir = null;
    let page = null;
    const userPublicId = this.context.user.id;
    const action = preview ? "PDF_GENERATE_PREVIEW" : "PDF_GENERATE";
    const logData = { userPublicId: userPublicId, action: action };

    try {
      // Authenticate and fetch template record
      const templateDb = await templateRepo.getByPublicIdAndUserPublicId(
        templatePublicId,
        userPublicId
      );
      if (!templateDb) throw new AppError("Template not found.", 404, { logData });
      if (!templateDb.entrypoint) {
        throw new AppError("Template entrypoint is not set.", 400, { logData });
      }
      const templateSettings = publicTemplate.parse(templateDb).settings;

      // Fetch template files from storage
      const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);
      tempDir = await storageService.downloadTemplate(BUCKETS.templates, bucketPath);

      await this.applyMustacheAndSanitize(tempDir, jsonData);

      // Generate PDF with Puppeteer
      const browser = await getBrowserInstance();
      page = await browser.newPage();

      // Disable JavaScript
      await page.setJavaScriptEnabled(false);

      // Tell puppeteer to treat the temp dir as the base for linked assets (CSS, images)
      const fileUrl = pathToFileURL(path.join(tempDir, templateDb.entrypoint)).href;
      await page.goto(fileUrl, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf(templateSettings);

      // Upload PDF to storage and return the public URL
      if (preview) {
        const pdfBucketPath = `previews/${userPublicId}/${templatePublicId}/`;
        const name = `${Date.now()}.pdf`;
        await storageService.uploadBuffer(
          BUCKETS.previews,
          pdfBucketPath,
          name,
          pdfBuffer
        );
        const tempUrl = await storageService.getPresignedUrl(
          BUCKETS.previews,
          `${pdfBucketPath}${name}`
        );
        await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
        return tempUrl;
      }
      publicId = secretService.generatePublicId("pdf");
      const pdfBucketPath = `pdfs/${userPublicId}/${templatePublicId}/`;
      const name = `${publicId}.pdf`;
      const key = `${pdfBucketPath}${name}`;
      await storageService.uploadBuffer(BUCKETS.pdfs, pdfBucketPath, name, pdfBuffer);

      // Create the PDF record and log the event
      const pdfDb = await pdfRepo.create(userPublicId, templatePublicId, key, publicId);
      pdfDb.temp_url = await storageService.getPresignedUrl(BUCKETS.pdfs, key);
      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return pdfDb;
    } catch (err) {
      if (err instanceof AppError && err.logData) throw err;
      throw new AppError(`Failed to generate pdf: ${err.message}`, 500, { logData });
    } finally {
      if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
      if (page) await page.close();
    }
  }

  async applyMustacheAndSanitize(tempDir, jsonData) {
    if (!jsonData || Object.keys(jsonData).length === 0) return;
    const files = await fs.promises.readdir(tempDir);
    for (const file of files) {
      const fileExtension = path.extname(file).toLowerCase();
      if (!TEXT_FILE_EXTENSIONS.includes(fileExtension)) continue;
      const filePath = path.join(tempDir, file);
      try {
        const content = await fs.promises.readFile(filePath, "utf-8");
        const processedContent = mustache.render(content, jsonData);
        let sanitizedContent = processedContent;
        if (PURIFY_EXTENSIONS.includes(fileExtension)) {
          sanitizedContent = DOMPurify.sanitize(processedContent, PURIFY_OPTIONS);
        }
        await fs.promises.writeFile(filePath, sanitizedContent, "utf-8");
      } catch (err) {
        console.warn(`Skipping file ${filePath}: ${err.message}`);
      }
    }
  }
}
