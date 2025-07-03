import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 14);

const prefixes = {
  user: "usr",
  template: "tpl",
  pdf: "pdf",
};

const generateId = (entityType) => {
  const prefix = prefixes[entityType];
  if (!prefix) throw new Error(`Unknown entity type: ${entityType}`);
  return `${prefix}${nanoid()}`;
};

export default generateId;
