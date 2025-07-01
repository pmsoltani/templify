import * as pdfRepo from "../repositories/pdfRepository.js";
import * as fileService from "../services/fileService.js";
import AppError from "../utils/AppError.js";
import { publicPdfs } from "../schemas/pdfSchema.js";

const getAll = async (req, res) => {
  const pdfsDb = await pdfRepo.getAllByUserId(req.user.userId);
  res.json({
    message: "PDFs retrieved successfully!",
    data: { pdfs: publicPdfs.parse(pdfsDb) },
  });
};

const getDownloadLink = async (req, res) => {
  const pdfId = req.params.id;
  const userId = req.user.userId;

  const pdfDb = await pdfRepo.getByIdAndUser(pdfId, userId);
  if (!pdfDb) throw new AppError("PDF record not found.", 404);

  const newUrl = await fileService.getPresignedUrl(pdfDb.storage_object_key);
  res.json({ message: "Download link generated successfully!", data: { url: newUrl } });
};

export { getAll, getDownloadLink };
