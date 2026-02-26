import { z } from "zod";

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
});

export const voiceSubmissionSchema = z.object({
  title: z.string().trim().min(4).max(140),
  reflection: z.string().trim().min(20).max(2000),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
export type VoiceSubmissionInput = z.infer<typeof voiceSubmissionSchema>;
