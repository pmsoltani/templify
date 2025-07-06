import { publicPdf } from "../schemas/pdfSchema.js";
import { publicTemplate, publicTemplates } from "../schemas/templateSchema.js";
import PdfService from "../services/PdfService.js";
import TemplateService from "../services/TemplateService.js";
import getContext from "../utils/getContext.js";

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
    req.body.description
  );
  res.status(201).json({
    message: "Slim template created successfully!",
    data: { template: publicTemplate.parse(templateDb) },
  });
};

const create = async (req, res) => {
  const templateDb = await new TemplateService(getContext(req)).create(
    req.body.name,
    req.body.htmlEntrypoint,
    req.body.description,
    req.file?.path
  );
  res.status(201).json({
    message: "Template created successfully!",
    data: { template: publicTemplate.parse(templateDb) },
  });
};

const generatePdf = async (req, res) => {
  const pdfDb = await new PdfService(getContext(req)).generatePdf(
    req.params.templateId,
    req.body
  );
  res.json({
    message: "PDF generated successfully!",
    data: { pdf: publicPdf.parse(pdfDb) },
  });
};

const remove = async (req, res) => {
  await new TemplateService(getContext(req)).remove(req.params.templateId);
  res.status(204).send();
};

const update = async (req, res) => {
  const templateDb = await new TemplateService(getContext(req)).update(
    req.params.templateId,
    req.body,
    req.file?.path
  );
  res.json({
    message: "Template update successful!",
    data: { template: publicTemplate.parse(templateDb) },
  });
};

export { create, createSlim, generatePdf, getAllByUserId, getPreview, remove, update };
