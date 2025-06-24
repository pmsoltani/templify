import AdmZip from "adm-zip";
import fs from "fs";
import os from "os";
import path from "path";
import mustache from "mustache";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import * as db from "../services/databaseService.js";

// --- S3/R2 CLIENT CONFIGURATION ---
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const uploadTemplate = async (req, res) => {
  try {
    const userId = req.user.userId;
    const templateName = req.body.name;
    const htmlEntrypoint = req.body.html_entrypoint || "template.html";

    if (!templateName || !req.file) {
      return res.status(400).json({ error: "Missing template name or zip file." });
    }

    const templateDb = await db.createTemplate(userId, templateName, htmlEntrypoint);
    const templateId = templateDb.id;

    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();

    const uploadPromises = zipEntries.map((zipEntry) => {
      if (zipEntry.isDirectory) return null; // Skip directories

      const filePathInBucket = `user_files/${userId}/${templateId}/${zipEntry.entryName}`;

      const uploadParams = {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: filePathInBucket,
        Body: zipEntry.getData(), // Get file content directly from zip entry
        ContentType: zipEntry.mimeType,
      };

      return s3Client.send(new PutObjectCommand(uploadParams));
    });

    await Promise.all(uploadPromises);

    fs.unlinkSync(req.file.path); // Clean up the temporary zip file

    res.status(201).json({
      message: "Template uploaded and processed successfully!",
      template: { id: templateId, name: templateName },
    });
  } catch (err) {
    console.error("Template Upload Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generatePdf = async (req, res) => {
  const templateId = req.params.id;
  const userId = req.user.id;
  const jsonData = req.body;

  let browser = null;

  try {
    const template = await db.getTemplateByIdAndUser(templateId, userId);
    if (!template) return res.status(404).json({ error: "Template not found" });

    // Create a temporary local directory for processing
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `templify-${templateId}-`));
    const bucketPath = `user_files/${userId}/${templateId}/`;

    // Download all template files from R2 to the temporary directory
    const listObjectsResult = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        Prefix: bucketPath,
      })
    );

    if (!listObjectsResult.Contents) throw new Error("Template is empty.");

    for (const object of listObjectsResult.Contents) {
      const getObjectResult = await s3Client.send(
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: object.Key,
        })
      );
      const localPath = path.join(tempDir, path.basename(object.Key));
      fs.writeFileSync(localPath, await getObjectResult.Body.transformToByteArray());
    }

    // Read HTML & merge data with Mustache
    const htmlPath = path.join(tempDir, template.html_entrypoint);
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");
    const finalHtml = mustache.render(htmlContent, jsonData);

    // GENERATE PDF with Puppeteer
    console.log("Launching Puppeteer with @sparticuz/chromium...");
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    // Tell puppeteer to treat the temp dir as the base for linked assets (CSS, images)
    await page.goto(`file://${tempDir}/${template.html_entrypoint}`, {
      waitUntil: "networkidle0",
    });
    await page.setContent(finalHtml, { waitUntil: "networkidle0" }); // Final HTML file
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    // UPLOAD PDF back to R2
    const pdfFileName = `generated-${userId}-${templateId}-${Date.now()}.pdf`;
    const pdfKey = `generated_pdfs/${userId}/${pdfFileName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: pdfKey,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      })
    );

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${pdfKey}`;
    res.status(201).json({ message: "PDF generated successfully!", url: publicUrl });
  } catch (err) {
    console.error(`[PDF Generation Error for TPL_ID:${templateId}]`, err);
    res.status(500).json({ error: "Internal Server Error while generating PDF." });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("Error closing Puppeteer browser:", closeErr);
      }
    }
    fs.rmSync(tempDir, { recursive: true, force: true }); // Clean up temporary dir
  }
};

export { uploadTemplate, generatePdf };
