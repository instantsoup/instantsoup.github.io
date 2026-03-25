import { type TaintData, TaintDataSchema } from '../types/taint-data';
import rawTaint from './taint.json' assert { type: 'json' };

export const taintData: TaintData = TaintDataSchema.parse(rawTaint);

export function getDepravityEffect(score: number) {
  const clamped = Math.max(0, Math.min(9, Math.floor(score)));
  return taintData.depravityEffects.find((e) => e.score === clamped);
}

export function getCorruptionEffect(score: number) {
  const clamped = Math.max(0, Math.min(9, Math.floor(score)));
  return taintData.corruptionEffects.find((e) => e.score === clamped);
}
