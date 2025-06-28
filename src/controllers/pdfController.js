import * as pdfRepo from "../repositories/pdfRepository.js";
import * as fileService from "../services/fileService.js";
import AppError from "../utils/AppError.js";
import { publicPdfs } from "../schemas/pdfSchema.js";

const getAll = async (req, res) => {
  const pdfsDb = await pdfRepo.getAllByUserId(req.user.userId);
  res.json(publicPdfs.parse(pdfsDb));
};

const getDownloadLink = async (req, res) => {
  const pdfId = req.params.id;
  const userId = req.user.userId;

  const pdfRecord = await pdfRepo.getByIdAndUser(pdfId, userId);
  if (!pdfRecord) throw new AppError("PDF record not found.", 404);

  const newUrl = await fileService.getPresignedUrl(pdfRecord.r2_object_key);
  res.json({ url: newUrl });
};

export { getAll, getDownloadLink };
