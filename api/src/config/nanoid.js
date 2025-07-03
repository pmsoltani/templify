import { customAlphabet } from "nanoid";
import { NANO_ALPHABET } from "./constants.js";

const nanoid = customAlphabet(NANO_ALPHABET, 14);

export default nanoid;
