import { z } from "zod";
import { email, password, token } from "./sharedSchema.js";

const register = z.object({ body: z.object({ email, password }) });

const confirm = z.object({ query: z.object({ token }) });

const resendConfirmation = z.object({ body: z.object({ email }) });

const login = z.object({ body: z.object({ email, password }) });

const forgot = z.object({ body: z.object({ email }) });

const reset = z.object({ body: z.object({ token, password }) });

export { register, confirm, resendConfirmation, login, forgot, reset };
