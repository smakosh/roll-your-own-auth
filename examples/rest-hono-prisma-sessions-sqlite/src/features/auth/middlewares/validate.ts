import type { Context, Next } from "hono";
import type { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) => async (c: Context, next: Next) => {
    const body = await c.req.json().catch(() => ({}));
    const result = schema.safeParse(body);

    if (!result.success) {
      return c.json(
        {
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        400,
      );
    }

    c.set("validated", result.data);
    return next();
  };
