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
    req.params.id,
    req.body
  );
  res.json({
    message: "PDF generated successfully!",
    data: { pdf: publicPdf.parse(pdfDb) },
  });
};

const remove = async (req, res) => {
  await new TemplateService(getContext(req)).remove(req.params.id);
  res.status(204).send();
};

const update = async (req, res) => {
  const templateDb = await new TemplateService(getContext(req)).update(
    req.params.id,
    req.body,
    req.file?.path
  );
  res.json({
    message: "Template update successful!",
    data: { template: publicTemplate.parse(templateDb) },
  });
};

export { getAllByUserId, create, generatePdf, remove, update };
