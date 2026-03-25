import { z } from 'zod';

export const TaintEffectSchema = z.object({
  score: z.number().int().min(0).max(9),
  label: z.string().min(1),
  effect: z.string(),
});

export type TaintEffect = z.infer<typeof TaintEffectSchema>;

export const TaintDataSchema = z.object({
  description: z.string(),
  depravityEffects: z.array(TaintEffectSchema),
  corruptionEffects: z.array(TaintEffectSchema),
});

export type TaintData = z.infer<typeof TaintDataSchema>;
