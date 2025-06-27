import fs from "fs";
import * as templateService from "../services/templateService.js";

const listUserTemplates = async (req, res) => {
  try {
    const templates = await templateService.getAllByUserId(req.user.userId);
    res.json(templates);
  } catch (err) {
    console.error("Error fetching user templates:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  try {
    const { name, htmlEntrypoint, description = null } = req.body;
    if (!name || !req.file) {
      return res.status(400).json({ error: "Missing template name or zip file." });
    }

    const templateDb = await templateService.create(
      req.user.userId,
      name,
      htmlEntrypoint || "template.html",
      description,
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
  const templateId = req.params.id;
  try {
    const userId = req.user.id;
    const jsonData = req.body;
    const pdfUrl = await templateService.generatePdf(userId, templateId, jsonData);
    res.status(200).json({ message: "PDF generated successfully!", url: pdfUrl });
  } catch (err) {
    console.error(`[PDF Generation Error for TPL_ID:${templateId}]`, err);
    res.status(500).json({ error: "Internal Server Error while generating PDF." });
  }
};

const remove = async (req, res) => {
  const templateId = req.params.id;
  try {
    const userId = req.user.userId;
    await templateService.remove(userId, templateId);
    res.status(204).send();
  } catch (err) {
    console.error(`[Template Deletion Error for TPL_ID:${templateId}]`, err);
    res.status(500).json({ error: "Internal Server Error while deleting template." });
  }
};

const update = async (req, res) => {
  const templateId = req.params.id;
  try {
    if (!req.file) return res.status(400).json({ error: "Missing template zip file." });
    const updatedTemplateDb = await templateService.update(
      req.user.userId,
      templateId,
      req.body,
      req.file.path
    );
    res.status(200).json({
      message: "Template updated successfully!",
      template: updatedTemplateDb,
    });
  } catch (err) {
    console.error(`[Template Update Error for TPL_ID:${templateId}]`, err);
    if (req.file) fs.unlinkSync(req.file.path); // Clean up the temp file
    res.status(500).json({ error: "Internal Server Error while updating template." });
  }
};

export { listUserTemplates, create, generatePdf, remove, update };
