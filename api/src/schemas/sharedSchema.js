import { z } from "zod";
import { allowedExtensions, ENTITIES } from "../config/constants.js";

const id = z.number().int();

const text = z.string();

const prefixes = Object.values(ENTITIES).map((entity) => entity.prefix);
const publicIdPattern = new RegExp(`^(${prefixes.join("|")})[a-zA-Z0-9]{14}$`);
const publicId = text.regex(publicIdPattern);

const email = z.email();

const password = text.min(8, { error: "Must be at least 8 characters." });

const token = text.length(64);

const dateTime = z.date();

const fileExtensionPattern = allowedExtensions.map((ext) => ext.slice(1)).join("|");
const fileNamePattern = new RegExp(`^[^\\\\/:*?"<>|]+\\.(${fileExtensionPattern})$`);
const fileName = text.regex(fileNamePattern);

export { dateTime, email, fileName, id, password, publicId, text, token };
