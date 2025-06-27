import * as pdfRepo from "../repositories/pdfRepository.js";
import * as fileService from "../services/fileService.js";

export const getAll = async (req, res) => {
  try {
    const pdfs = await pdfRepo.getAllByUserId(req.user.userId);
    res.status(200).json(pdfs);
  } catch (err) {
    console.error("Error fetching PDFs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getDownloadLink = async (req, res) => {
  try {
    const pdfId = req.params.id;
    const userId = req.user.userId;

    const pdfRecord = await pdfRepo.getByIdAndUser(pdfId, userId);
    if (!pdfRecord) return res.status(404).json({ error: "PDF record not found." });

    const newUrl = await fileService.getPresignedUrl(pdfRecord.r2_object_key);
    res.status(200).json({ url: newUrl });
  } catch (err) {
    console.error("Error generating download link:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
