import { publicHubTemplate, publicHubTemplates } from "../schemas/hubSchema.js";
import HubService from "../services/HubService.js";
import getContext from "../utils/getContext.js";

const getAll = async (req, res) => {
  const filters = {
    category: req.query.category,
    featured: req.query.featured,
    tags: req.query.tags ? req.query.tags.split(",") : undefined,
    limit: req.query.limit ? parseInt(req.query.limit) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset) : undefined,
  };

  // Remove undefined values
  Object.keys(filters).forEach((key) => {
    if (filters[key] === undefined) delete filters[key];
  });

  const hubTemplatesDb = await new HubService(getContext(req)).getAll(filters);
  res.json({
    message: "Hub templates retrieved successfully!",
    data: { hubTemplates: publicHubTemplates.parse(hubTemplatesDb) },
  });
};

const getByPublicId = async (req, res) => {
  const { publicId } = req.params;
  const hubTemplateDb = await new HubService(getContext(req)).getByPublicId(publicId);
  res.json({
    message: "Hub template retrieved successfully!",
    data: { hubTemplate: publicHubTemplate.parse(hubTemplateDb) },
  });
};

const publish = async (req, res) => {
  const { templateId } = req.params;
  const publishData = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    tags: req.body.tags,
  };

  const hubTemplateDb = await new HubService(getContext(req)).publish(
    templateId,
    publishData
  );

  res.status(201).json({
    message: "Template published to hub successfully!",
    data: { hubTemplate: publicHubTemplate.parse(hubTemplateDb) },
  });
};

const update = async (req, res) => {
  const { publicId } = req.params;
  const updateData = {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    tags: req.body.tags,
  };

  // Remove undefined values
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) delete updateData[key];
  });

  const updatedTemplateDb = await new HubService(getContext(req)).update(
    publicId,
    updateData
  );

  res.json({
    message: "Hub template updated successfully!",
    data: { hubTemplate: publicHubTemplate.parse(updatedTemplateDb) },
  });
};

const remove = async (req, res) => {
  const { publicId } = req.params;
  await new HubService(getContext(req)).remove(publicId);
  res.status(204).send();
};

const importTemplate = async (req, res) => {
  const { publicId } = req.params;
  const newTemplateDb = await new HubService(getContext(req)).import(publicId);

  res.status(201).json({
    message: "Hub template imported successfully!",
    data: { hubTemplate: publicHubTemplate.parse(newTemplateDb) },
  });
};

export { getAll, getByPublicId, importTemplate, publish, remove, update };
