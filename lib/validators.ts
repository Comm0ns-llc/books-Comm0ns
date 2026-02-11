import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(50),
  inviteCode: z
    .string()
    .trim()
    .min(4)
    .max(20)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined))
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const userBookSchema = z.object({
  bookId: z.string().uuid(),
  status: z.enum(["available", "lent_out", "private", "reading"]).default("available"),
  condition: z.enum(["new", "good", "fair", "poor"]).default("good"),
  note: z.string().max(500).optional()
});

export const loanRequestSchema = z.object({
  userBookId: z.string().uuid(),
  message: z.string().max(1000).optional()
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().max(4000).optional(),
  readAt: z.string().date().optional(),
  visibility: z.enum(["public", "community", "private"]).default("community")
});

export const messageSchema = z.object({
  body: z.string().min(1).max(2000),
  loanId: z.string().uuid().optional()
});
