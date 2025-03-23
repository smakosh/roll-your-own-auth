import { z } from "zod";

export const signupSchema = z.object({
  body: z
    .object({
      name: z.string({
        required_error: "Full name is required",
      }),
      email: z
        .string({
          required_error: "Email is required",
        })
        .email("Not a valid email"),
      password: z.string({
        required_error: "Password is required",
      }),
      confirmPassword: z.string({
        required_error: "Confirm password is required",
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});
