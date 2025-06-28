import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import mustache from "mustache";
import { getBrowserInstance } from "../config/puppeteer.js";
import * as pdfRepo from "../repositories/pdfRepository.js";
import * as templateRepo from "../repositories/templateRepository.js";
import AppError from "../utils/AppError.js";
import * as fileService from "./fileService.js";

const generatePdf = async (userId, templateId, jsonData) => {
  let tempDir = null;
  let page = null;

  try {
    // Authenticate and fetch template record
    const templateDb = await templateRepo.getByIdAndUserId(templateId, userId);
    if (!templateDb) throw new AppError("Template not found.", 404);

    // Fetch template files from storage
    const bucketPath = `userFiles/${userId}/${templateId}/`;
    tempDir = await fileService.downloadTemplate(bucketPath);

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
    const storageObjectKey = await fileService.uploadPdf(userId, pdfBuffer);

    // Log the usage
    await pdfRepo.create(userId, templateId, storageObjectKey);

    // Return a presigned URL for the PDF
    return await fileService.getPresignedUrl(storageObjectKey);
  } finally {
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
    if (page) await page.close();
  }
};

export { generatePdf };
