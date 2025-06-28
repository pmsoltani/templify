import fs from "fs";
import * as templateService from "../services/templateService.js";
import * as pdfService from "../services/pdfService.js";
import AppError from "../utils/AppError.js";
import { publicTemplate, publicTemplates } from "../schemas/templateSchema.js";

const getAllByUserId = async (req, res) => {
  const templatesDb = await templateService.getAllByUserId(req.user.userId);
  res.json(publicTemplates.parse(templatesDb));
};

const create = async (req, res, next) => {
  try {
    const { name, htmlEntrypoint, description = null } = req.body;
    if (!req.file) throw new AppError("Missing template file.", 400);

    const templateDb = await templateService.create(
      req.user.userId,
      name,
      htmlEntrypoint || "template.html",
      description,
      req.file.path
    );

    res.status(201).json({
      message: "Template created successfully!",
      template: publicTemplate.parse(templateDb),
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path); // Clean up the temp file
    next(err); // Pass error to the error handler
  }
};

const generatePdf = async (req, res) => {
  const templateId = req.params.id;
  const userId = req.user.id;
  const jsonData = req.body;
  const pdfUrl = await pdfService.generatePdf(userId, templateId, jsonData);
  res.json({ message: "PDF generated successfully!", url: pdfUrl });
};

const remove = async (req, res) => {
  const templateId = req.params.id;
  const userId = req.user.userId;
  await templateService.remove(userId, templateId);
  res.status(204).send();
};

const update = async (req, res, next) => {
  const templateId = req.params.id;
  try {
    if (!req.file) throw new AppError("Missing template file.", 400);
    const templateDb = await templateService.update(
      req.user.userId,
      templateId,
      req.body,
      req.file.path
    );
    res.json({
      message: "Template update successful!",
      template: publicTemplate.parse(templateDb),
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path); // Clean up the temp file
    next(err); // Pass error to the error handler
  }
};

export { getAllByUserId, create, generatePdf, remove, update };
