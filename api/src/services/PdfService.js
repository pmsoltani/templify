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
    const logData = { userPublicId: userPublicId, action: "PDF_URL_GENERATE" };
    const pdfDb = await pdfRepo.getByPublicIdAndUserPublicID(publicId, userPublicId);
    if (!pdfDb) throw new AppError("PDF record not found.", 404, { logData });

    pdfDb.temp_url = await storageService.getPresignedUrl(pdfDb.storage_object_key);
    await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
    return pdfDb;
  }

  async generatePdf(templatePublicId, jsonData) {
    let publicId;
    let tempDir = null;
    let page = null;
    const userPublicId = this.context.user.id;
    const logData = { userPublicId: userPublicId, action: "PDF_GENERATE" };

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

      // Inject JSON data into HTML template
      const htmlPath = path.join(tempDir, templateDb.html_entrypoint);
      const htmlContent = fs.readFileSync(htmlPath, "utf-8");
      const finalHtml = mustache.render(htmlContent, jsonData);

      // Generate PDF with Puppeteer
      const browser = await getBrowserInstance();
      const page = await browser.newPage();

      // Tell puppeteer to treat the temp dir as the base for linked assets (CSS, images)
      const fileUrl = pathToFileURL(htmlPath).href;
      await page.goto(fileUrl, { waitUntil: "networkidle0" });
      await page.setContent(finalHtml, { waitUntil: "networkidle0" }); // Final HTML file
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

      // Upload PDF to storage and return the public URL
      publicId = secretService.generatePublicId("pdf");
      const key = await storageService.uploadPdf(publicId, userPublicId, pdfBuffer);

      // Create the PDF record and log the event
      const pdfDb = await pdfRepo.create(userPublicId, templatePublicId, key, publicId);
      pdfDb.temp_url = await storageService.getPresignedUrl(key);
      await log(logData.userPublicId, logData.action, "SUCCESS", this.context);
      return pdfDb;
    } finally {
      if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
      if (page) await page.close();
    }
  }
}
