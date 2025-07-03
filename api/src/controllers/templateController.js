import fs from "fs";
import * as templateService from "../services/templateService.js";
import * as pdfService from "../services/pdfService.js";
import AppError from "../utils/AppError.js";
import { publicTemplate, publicTemplates } from "../schemas/templateSchema.js";

const getAllByUserId = async (req, res) => {
  const templatesDb = await templateService.getAllByUserPublicId(req.user.id);
  res.json({
    message: "Templates retrieved successfully!",
    data: { templates: publicTemplates.parse(templatesDb) },
  });
};

const create = async (req, res, next) => {
  const userPublicId = req.user.id;
  try {
    const { name, htmlEntrypoint, description = null } = req.body;
    if (!req.file) throw new AppError("Missing template file.", 400);

    const templateDb = await templateService.create(
      userPublicId,
      name,
      htmlEntrypoint || "template.html",
      description,
      req.file.path
    );
    templateDb.user_public_id = templateDb.user_public_id || userPublicId;
    res.status(201).json({
      message: "Template created successfully!",
      data: { template: publicTemplate.parse(templateDb) },
    });
  } catch (err) {
    try {
      fs.unlinkSync(req.file.path); // Clean up the temp file
    } catch (err) {}
    next(err); // Pass error to the error handler
  }
};

const generatePdf = async (req, res) => {
  const pdfUrl = await pdfService.generatePdf(req.user.id, req.params.id, req.body);
  res.json({ message: "PDF generated successfully!", data: { url: pdfUrl } });
};

const remove = async (req, res) => {
  await templateService.remove(req.user.id, req.params.id);
  res.status(204).send();
};

const update = async (req, res, next) => {
  const publicId = req.params.id;
  const userPublicId = req.user.id;
  try {
    if (!req.file) throw new AppError("Missing template file.", 400);
    const templateDb = await templateService.update(
      userPublicId,
      publicId,
      req.body,
      req.file.path
    );
    templateDb.user_public_id = templateDb.user_public_id || userPublicId;
    res.json({
      message: "Template update successful!",
      data: { template: publicTemplate.parse(templateDb) },
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path); // Clean up the temp file
    next(err); // Pass error to the error handler
  }
};

export { getAllByUserId, create, generatePdf, remove, update };
