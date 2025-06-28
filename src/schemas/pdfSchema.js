import { z } from "zod";
import { id, dateTime } from "./sharedSchema.js";

const publicPdf = z.object({
  id: id,
  user_id: id,
  template_id: id,
  createdAt: dateTime,
});

const publicPdfs = z.array(publicPdf);

export { publicPdf, publicPdfs };
