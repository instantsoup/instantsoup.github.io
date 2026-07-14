// pdf-parse and @anthropic-ai/sdk are optional, dev-only dependencies for
// scripts/ingest-rulebook.mts (see that file's header comment) - they aren't
// listed in package.json, so there are no @types for them to resolve.
declare module 'pdf-parse';
declare module '@anthropic-ai/sdk';
