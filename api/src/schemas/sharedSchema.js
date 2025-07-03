import { z } from "zod";
import { ENTITIES } from "../config/constants.js";

const id = z.number().int();

const prefixes = Object.values(ENTITIES).map((entity) => entity.prefix);
const publicIdPattern = new RegExp(`^(${prefixes.join("|")})[a-zA-Z0-9]{14}$`);
const publicId = z.string().regex(publicIdPattern, { message: "Invalid ID" });

const email = z
  .string({ required_error: "Email is required." })
  .email("Invalid email address.");

const password = z
  .string({ required_error: "Password is required." })
  .min(8, "Password must be at least 8 characters long.");

const token = z
  .string({ required_error: "Token is required." })
  .length(64, "Invalid token length.");

const dateTime = z.date().or(z.string());

const templateName = z.string("Template name is required");

const templateHtmlEntrypoint = z.string().optional().default("template.html");

const templateDescription = z.string().optional();

export {
  id,
  publicId,
  email,
  password,
  token,
  dateTime,
  templateName,
  templateHtmlEntrypoint,
  templateDescription,
};
