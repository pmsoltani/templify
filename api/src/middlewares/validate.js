import { z } from "zod";
import AppError from "../utils/AppError.js";

/**
 * A middleware factory that takes a Zod schema and validates the request against it.
 * @param {z.ZodObject<any>} schema The Zod schema to validate against.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = parsed.body;
    Object.assign(req.query, parsed.query);
    req.params = parsed.params;

    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const validationErrors = err.flatten().fieldErrors;
      const appError = new AppError("Invalid input data.", 400, {
        details: { validation: validationErrors },
        logData: {
          action: "SCHEMA_VALIDATION",
          details: { route: req.originalUrl, errors: validationErrors },
        },
      });
      return next(appError);
    }
    next(err); // For any other unexpected errors, pass them on.
  }
};

export default validate;
