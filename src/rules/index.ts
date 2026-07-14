/**
 * Rules Engine — single entry point for all D&D 3.5e business rules.
 *
 * This layer:
 *  - has NO React / DOM dependencies
 *  - imports ONLY from src/data/ (the data layer) and src/types/
 *  - exports pure functions
 *  - is fully unit-testable without mounting any component
 *
 * UI components import from here; they do not compute rules themselves.
 */

export * from './caster';
export * from './character';
export * from './types';
export * from './wizard';
