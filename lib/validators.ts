import { z } from "zod";

const voiceSubmissionTypeSchema = z.enum(["idea", "quote", "book-read", "inspiration"]);
const voiceVisibilitySchema = z.enum(["open", "anonymous"]);

export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(100, { message: "Name must be 100 characters or fewer." }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .max(200, { message: "Email must be 200 characters or fewer." }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Message is too short. Please write at least 10 characters." })
    .max(4000, { message: "Message must be 4000 characters or fewer." }),
  website: z.string().trim().max(200).optional().default(""),
});

export const voiceSubmissionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, { message: "Title must be at least 4 characters." })
    .max(140, { message: "Title must be 140 characters or fewer." }),
  reflection: z
    .string()
    .trim()
    .min(7, { message: "Reflection must be at least 7 characters." })
    .max(2000, { message: "Reflection must be 2000 characters or fewer." }),
  submissionType: voiceSubmissionTypeSchema,
  visibility: voiceVisibilitySchema,
  descriptor: z
    .string()
    .trim()
    .min(2, { message: "Descriptor must be at least 2 characters when provided." })
    .max(80, { message: "Descriptor must be 80 characters or fewer." })
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined),
});

export const journalSubmissionSchema = z.object({
  prompt: z.string().trim().min(5).max(300),
  answer: z.string().trim().min(1).max(2000),
  stressLevel: z.enum(["low", "medium", "high"]),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
export type VoiceSubmissionInput = z.infer<typeof voiceSubmissionSchema>;
export type JournalSubmissionInput = z.infer<typeof journalSubmissionSchema>;
