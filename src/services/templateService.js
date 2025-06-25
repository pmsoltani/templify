import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import mustache from "mustache";
import { getBrowserInstance } from "../config/puppeteer.js";
import * as fileService from "./fileService.js";
import * as templateRepo from "../repositories/templateRepository.js";

const getAllByUserId = async (userId) => {
  // TODO: add logic for pagination, etc.
  return await templateRepo.getAllByUser(userId);
};

const create = async (userId, templateName, htmlEntrypoint, tempZipPath) => {
  const templateDb = await templateRepo.create(userId, templateName, htmlEntrypoint);
  await fileService.unzipAndUpload(tempZipPath, `userFiles/${userId}/${templateDb.id}`);
  fs.unlinkSync(tempZipPath); // Clean up the temp file
  return templateDb;
};

const generatePdf = async (userId, templateId, jsonData) => {
  let tempDir = null;
  let page = null;

  try {
    // Authenticate and fetch template record
    const templateDb = await templateRepo.getByIdAndUser(templateId, userId);
    if (!templateDb) throw new Error("Template not found.");

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
    return await fileService.uploadPdf(userId, pdfBuffer);
  } finally {
    if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
    if (page) await page.close();
  }
};

export { getAllByUserId, create, generatePdf };
