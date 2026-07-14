/**
 * Wizard specialist school rules.
 * Divination specialists may only forbid 1 school; all other specialists must forbid 2.
 * Universal can never be a forbidden school.
 */

/** Maximum number of forbidden schools for a specialist in the given specialty */
export function maxForbiddenSchools(specialty: string): number {
  return specialty === 'Divination' ? 1 : 2;
}

/** Whether a school can be marked as forbidden (Universal can never be forbidden) */
export function canForbidSchool(school: string): boolean {
  return school !== 'Universal';
}

/**
 * Whether a specialist's forbidden school selection is complete and valid.
 * Divination: exactly 1 forbidden. All others: exactly 2 forbidden.
 */
export function forbiddenSchoolsComplete(specialty: string, forbiddenSchools: string[]): boolean {
  return forbiddenSchools.length === maxForbiddenSchools(specialty);
}

/**
 * Apply a toggle to the forbidden school list, respecting the cap.
 * Returns the new forbidden school list.
 */
export function toggleForbiddenSchool(
  school: string,
  current: string[],
  specialty: string,
): string[] {
  if (current.includes(school)) {
    return current.filter((s) => s !== school);
  }
  if (current.length < maxForbiddenSchools(specialty)) {
    return [...current, school];
  }
  return current; // at cap, no change
}
