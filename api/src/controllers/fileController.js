import { publicFile, publicFiles } from "../schemas/fileSchema.js";
import FileService from "../services/FileService.js";
import getContext from "../utils/getContext.js";

const getAllByTemplateId = async (req, res) => {
  const filesDb = await new FileService(getContext(req)).getAllByTemplatePublicId(
    req.params.templateId
  );
  res.json({
    message: "Files retrieved successfully!",
    data: { files: publicFiles.parse(filesDb) },
  });
};

const getContent = async (req, res) => {
  const { fileId, templateId } = req.params;
  const content = await new FileService(getContext(req)).getContent(fileId, templateId);
  res.json({
    message: "File content retrieved successfully!",
    data: { content },
  });
};

const create = async (req, res) => {
  const { templateId } = req.params;
  const fileDb = await new FileService(getContext(req)).create(templateId, req.file);
  res.status(201).json({
    message: "File created successfully!",
    data: { file: publicFile.parse(fileDb) },
  });
};

const remove = async (req, res) => {
  const { fileId, templateId } = req.params;
  await new FileService(getContext(req)).remove(fileId, templateId);
  res.status(204).send();
};

const updateContent = async (req, res) => {
  const fileDb = await new FileService(getContext(req)).updateContent(
    req.params.fileId,
    req.params.templateId,
    req.body.content
  );
  res.json({
    message: "File content update successful!",
    data: { file: publicFile.parse(fileDb) },
  });
};

export { create, getAllByTemplateId, getContent, remove, updateContent };
