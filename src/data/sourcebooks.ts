// src/data/sourcebooks.ts

import ABBR from "./sourcebook-abbrevs.json" assert { type: "json" }

/**
 * Canonical list of all accepted source abbreviations (single source of truth comes from JSON).
 */
export const ALL_SOURCE_ABBREVS = ABBR as readonly string[]
export type SourceAbbrev = typeof ALL_SOURCE_ABBREVS[number]

/**
 * Human-readable names for each abbreviation.
 * Include both the generally allowed books and those that require GM approval.
 */
export const SOURCEBOOK_NAMES: Record<SourceAbbrev, string> = {
  AEG: "Arms and Equipment Guide",
  BoED: "Book of Exalted Deeds",
  BoVD: "Book of Vile Darkness",
  City: "Cityscape",
  CAdv: "Complete Adventurer",
  CArc: "Complete Arcane",
  CCha: "Complete Champion",
  CDiv: "Complete Divine",
  CMa: "Complete Mage",
  CPsi: "Complete Psionic",
  CSco: "Complete Scoundrel",
  CWar: "Complete Warrior",
  Drcn: "Draconomicon",
  DrC: "Dragon Compendium",
  DrM: "Dragon Magic",
  DMG1: "Dungeon Master's Guide I",
  DMG2: "Dungeon Master's Guide II",
  Dnsc: "Dungeonscape",
  EE: "Elder Evils",
  Epic: "Epic Level Handbook",
  EoE: "Exemplars of Evil",
  EPH: "Expanded Psionics Handbook",
  FC1: "Fiendish Codex I: Hordes of the Abyss",
  FC2: "Fiendish Codex II: Tyrants of the Nine Hells",
  Frb: "Frostburn",
  HoB: "Heroes of Battle",
  HoH: "Heroes of Horror",
  Kan: "Player's Guide to Kanderra",
  LM: "Libris Mortis",
  LoM: "Lords of Madness",
  MIC: "Magic Item Compendium",
  MoI: "Magic of Incarnum",
  MotP: "Manual of the Planes",
  Mini: "Miniatures Handbook",
  MM1: "Monster Manual I",
  MM2: "Monster Manual II",
  MM3: "Monster Manual III",
  MM4: "Monster Manual IV",
  MM5: "Monster Manual V",
  Plnr: "Planar Handbook",
  PHB: "Player's Handbook I",
  PH2: "Player's Handbook II",
  RoD: "Races of Destiny",
  RoS: "Races of Stone",
  RotD: "Races of the Dragon",
  RotW: "Races of the Wild",
  RC: "Rules Compendium",
  Sand: "Sandstorm",
  SS: "Savage Species",
  SC: "Spell Compendium",
  Strm: "Stormwrack",
  ToM: "Tome of Magic",
  WoL: "Weapons of Legacy",
  FF: "Fiend Folio",
  SBG: "Stronghold Builder's Guidebook",
  UA: "Unearthed Arcana",
}

/**
 * High-level categories for UI hints/badges.
 */
export type SourceCategory = "Core" | "Supplement" | "CheckWithGM"

/**
 * Which abbreviations are considered "core" for emphasis.
 */
const CORE_SET = new Set<SourceAbbrev>(["PHB", "DMG1", "MM1"])

/**
 * Which abbreviations require explicit GM approval.
 */
const CHECK_WITH_GM_SET = new Set<SourceAbbrev>(["FF", "SBG", "UA"])

/**
 * Utility: get full name from abbreviation.
 */
export function getSourceFullName(abbrev: string): string | undefined {
  const key = abbrev as SourceAbbrev
  return SOURCEBOOK_NAMES[key]
}

/**
 * Utility: does this source require GM approval?
 */
export function isCheckWithGM(abbrev: string): boolean {
  return CHECK_WITH_GM_SET.has(abbrev as SourceAbbrev)
}

/**
 * Derive category from abbreviation.
 */
export function getSourceCategory(abbrev: string): SourceCategory | undefined {
  if (!SOURCEBOOK_NAMES[abbrev as SourceAbbrev]) return undefined
  if (CHECK_WITH_GM_SET.has(abbrev as SourceAbbrev)) return "CheckWithGM"
  if (CORE_SET.has(abbrev as SourceAbbrev)) return "Core"
  return "Supplement"
}

/**
 * Coerce an arbitrary input to a recognized abbreviation.
 * Returns undefined if not recognized.
 */
export function coerceSourceAbbrev(input: string): SourceAbbrev | undefined {
  const key = String(input).trim()
  return (SOURCEBOOK_NAMES as Record<string, string>)[key] ? (key as SourceAbbrev) : undefined
}

/**
 * List all known abbreviations.
 */
export function listAllAbbrevs(): SourceAbbrev[] {
  return [...ALL_SOURCE_ABBREVS] as SourceAbbrev[]
}
