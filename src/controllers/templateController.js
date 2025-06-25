import fs from "fs";
import * as templateService from "../services/templateService.js";

const uploadTemplate = async (req, res) => {
  try {
    const { name, htmlEntrypoint } = req.body;
    if (!name || !req.file) {
      return res.status(400).json({ error: "Missing template name or zip file." });
    }

    const templateDb = await templateService.create(
      req.user.userId,
      name,
      htmlEntrypoint || "template.html",
      req.file.path
    );

    res.status(201).json({
      message: "Template uploaded successfully!",
      template: templateDb,
    });
  } catch (err) {
    console.error("Template Upload Error:", err);
    if (req.file) fs.unlinkSync(req.file.path); // Clean up the temp file
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generatePdf = async (req, res) => {
  try {
    const templateId = req.params.id;
    const userId = req.user.id;
    const jsonData = req.body;

    const pdfUrl = await templateService.generatePdf(userId, templateId, jsonData);
    res.status(200).json({ message: "PDF generated successfully!", url: pdfUrl });
  } catch (err) {
    console.error(`[PDF Generation Error for TPL_ID:${templateId}]`, err);
    res.status(500).json({ error: "Internal Server Error while generating PDF." });
  }
};

export { uploadTemplate, generatePdf };
