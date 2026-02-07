import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(4000),
});

export const voiceSubmissionSchema = z.object({
  title: z.string().trim().min(4).max(140),
  reflection: z.string().trim().min(20).max(2000),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
export type VoiceSubmissionInput = z.infer<typeof voiceSubmissionSchema>;
