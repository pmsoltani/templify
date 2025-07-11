import fs from "fs";
import mustache from "mustache";
import path from "path";
import { pathToFileURL } from "url";
import { getBrowserInstance } from "../config/puppeteer.js";
import * as pdfRepo from "../repositories/pdfRepository.js";
import * as templateRepo from "../repositories/templateRepository.js";
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

    pdfDb.temp_url = await storageService.getPresignedUrl(pdfDb.storage_object_key);
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

      // Fetch template files from storage
      const bucketPath = storageService.getBucketPath(userPublicId, templatePublicId);
      tempDir = await storageService.downloadTemplate(bucketPath);

      await this.applyMustache(tempDir, jsonData);

      // Generate PDF with Puppeteer
      const browser = await getBrowserInstance();
      page = await browser.newPage();

      // Tell puppeteer to treat the temp dir as the base for linked assets (CSS, images)
      const htmlPath = path.join(tempDir, templateDb.html_entrypoint);
      const fileUrl = pathToFileURL(htmlPath).href;
      await page.goto(fileUrl, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

      // Upload PDF to storage and return the public URL
      if (preview) {
        const key = await storageService.uploadPreviewPdf(templatePublicId, pdfBuffer);
        const tempUrl = await storageService.getPresignedUrl(key);
        await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
        return tempUrl;
      }
      publicId = secretService.generatePublicId("pdf");
      const key = await storageService.uploadPdf(publicId, userPublicId, pdfBuffer);

      // Create the PDF record and log the event
      const pdfDb = await pdfRepo.create(userPublicId, templatePublicId, key, publicId);
      pdfDb.temp_url = await storageService.getPresignedUrl(key);
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

  async applyMustache(tempDir, jsonData) {
    if (!jsonData || Object.keys(jsonData).length === 0) return;
    const textExtensions = [".html", ".htm", ".css"];
    const files = await fs.promises.readdir(tempDir);
    files
      .filter((file) => textExtensions.includes(path.extname(file).toLowerCase()))
      .forEach(async (file) => {
        const filePath = path.join(tempDir, file);
        try {
          const content = await fs.promises.readFile(filePath, "utf-8");
          const processedContent = mustache.render(content, jsonData);
          await fs.promises.writeFile(filePath, processedContent, "utf-8");
        } catch (err) {
          console.warn(`Skipping file ${filePath}: ${err.message}`);
        }
      });
  }
}
