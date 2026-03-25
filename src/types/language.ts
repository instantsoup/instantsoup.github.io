import { z } from 'zod';

export const LanguageSchema = z.object({
  name: z.string().min(1),
  script: z.string(),
  speakers: z.string(),
  description: z.string(),
});

export type Language = z.infer<typeof LanguageSchema>;
