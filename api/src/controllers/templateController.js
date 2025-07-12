import { publicPdf } from "../schemas/pdfSchema.js";
import { publicTemplate, publicTemplates } from "../schemas/templateSchema.js";
import PdfService from "../services/PdfService.js";
import TemplateService from "../services/TemplateService.js";
import getContext from "../utils/getContext.js";

const get = async (req, res) => {
  const { templateId } = req.params;
  const templateDb = await new TemplateService(getContext(req)).get(templateId);
  res.json({
    message: "Template retrieved successfully!",
    data: { template: publicTemplate.parse(templateDb) },
  });
};

const getAllByUserId = async (req, res) => {
  const templatesDb = await new TemplateService(getContext(req)).getAllByUserPublicId();
  res.json({
    message: "Templates retrieved successfully!",
    data: { templates: publicTemplates.parse(templatesDb) },
  });
};

const createSlim = async (req, res) => {
  const templateDb = await new TemplateService(getContext(req)).createSlim(
    req.body.name,
    req.body.description,
    req.body.htmlEntrypoint,
    req.files
  );
  res.status(201).json({
    message: "Slim template created successfully!",
    data: { template: publicTemplate.parse(templateDb) },
  });
};

const generatePdf = async (req, res) => {
  const pdfDb = await new PdfService(getContext(req)).generatePdf(
    req.params.templateId,
    req.body
  );
  res.status(201).json({
    message: "PDF generated successfully!",
    data: { pdf: publicPdf.parse(pdfDb) },
  });
};

const generatePdfPreview = async (req, res) => {
  const tempUrl = await new PdfService(getContext(req)).generatePdf(
    req.params.templateId,
    req.body,
    true
  );
  res.status(201).json({
    message: "PDF preview generated successfully!",
    data: { tempUrl },
  });
};

const remove = async (req, res) => {
  await new TemplateService(getContext(req)).remove(req.params.templateId);
  res.status(204).send();
};

const updateInfo = async (req, res) => {
  const templateDb = await new TemplateService(getContext(req)).updateInfo(
    req.params.templateId,
    req.body
  );
  res.json({
    message: "Template info updated successfully!",
    data: { template: publicTemplate.parse(templateDb) },
  });
};

const getVariables = async (req, res) => {
  const variables = await new TemplateService(getContext(req)).getVariables(
    req.params.templateId
  );
  res.json({
    message: "Template variables retrieved successfully!",
    data: { variables },
  });
};

export {
  createSlim,
  generatePdf,
  generatePdfPreview,
  get,
  getAllByUserId,
  getVariables,
  remove,
  updateInfo,
};
