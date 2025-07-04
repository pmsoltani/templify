import { publicPdf, publicPdfs } from "../schemas/pdfSchema.js";
import PdfService from "../services/pdfService.js";
import getContext from "../utils/getContext.js";

const getAll = async (req, res) => {
  const pdfsDb = await new PdfService(getContext(req)).getAllByUserPublicId();
  res.json({
    message: "PDFs retrieved successfully!",
    data: { pdfs: publicPdfs.parse(pdfsDb) },
  });
};

const getDownloadLink = async (req, res) => {
  const pdfsDb = await new PdfService(getContext(req)).getDownloadLink(req.params.id);
  res.json({
    message: "Download link generated successfully!",
    data: { pdf: publicPdf.parse(pdfsDb) },
  });
};

export { getAll, getDownloadLink };
