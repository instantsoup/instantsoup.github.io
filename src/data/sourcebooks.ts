/** 3.5e rulebook abbreviations allowed in campaign */
export const SOURCEBOOKS = {
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
  FC1: "Fiendish Codex I",
  FC2: "Fiendish Codex II",
  Frb: "Frostburn",
  HoB: "Heroes of Battle",
  HoH: "Heroes of Horror",
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
} as const

/** Books that require explicit GM approval before use */
export const CHECK_WITH_GM = {
  FF: "Fiend Folio",
  SBG: "Stronghold Builder's Guidebook",
  UA: "Unearthed Arcana",
} as const

/** Convenience map of all sources */
export const ALL_SOURCES = { ...SOURCEBOOKS, ...CHECK_WITH_GM } as const

export type SourceAbbrev = keyof typeof ALL_SOURCES

/** High-level categories for color coding */
export type SourceCategory = "Core" | "Supplement" | "CheckWithGM"

/** Core books (for visual emphasis) */
const CORE_SET = new Set<SourceAbbrev>(["PHB", "DMG1", "MM1"] as const)

/** Helpers */
export function getSourceFullName(abbrev: string): string | undefined {
  return (ALL_SOURCES as Record<string, string>)[abbrev]
}

export function isCheckWithGM(abbrev: string): boolean {
  return Object.prototype.hasOwnProperty.call(CHECK_WITH_GM, abbrev)
}

export function getSourceCategory(abbrev: string): SourceCategory | undefined {
  if (!getSourceFullName(abbrev)) return undefined
  if (isCheckWithGM(abbrev)) return "CheckWithGM"
  if (CORE_SET.has(abbrev as SourceAbbrev)) return "Core"
  return "Supplement"
}

/** Safe coercion: uppercases and returns undefined if not recognized */
export function coerceSourceAbbrev(input: string): SourceAbbrev | undefined {
  const key = input.trim().toUpperCase()
  return (ALL_SOURCES as Record<string, string>)[key] ? (key as SourceAbbrev) : undefined
}

/** Optional: list utilities */
export function listAllAbbrevs(): SourceAbbrev[] {
  return Object.keys(ALL_SOURCES) as SourceAbbrev[]
}
