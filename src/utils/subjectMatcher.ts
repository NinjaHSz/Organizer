import { SUBJECT_METADATA } from '../components/schedule/scheduleData';

/**
 * Normalizes text for robust comparison (removes accents, punctuation, lowercases, trims)
 */
export function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .replace(/[^a-z0-9\s]/g, ' ') // replace punctuation/dots with space (e.g., "ed.fis" -> "ed fis")
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();
}

/**
 * Known aliases for timetable subject codes.
 * Ensures composite subjects like "Ed. Física" are never confused with "Física".
 */
export const SUBJECT_ALIASES: Record<string, string[]> = {
  'ED.FIS': [
    'ed fisica',
    'ed fis',
    'edfisica',
    'edfis',
    'educacao fisica',
    'educacao fis',
    'educacaofisica',
    'ef',
    'ed',
    'ed fisica escolar',
    'esportes',
  ],
  FIS: ['fisica', 'fis', 'physics', 'ciencias fisicas', 'mecanica', 'optica', 'termodinamica'],
  MAT: [
    'matematica',
    'mat',
    'mate',
    'math',
    'matematica basica',
    'algebra',
    'geometria',
    'trigonometria',
    'calculo',
  ],
  BIO: ['biologia', 'bio', 'biology', 'ciencias biologicas', 'ecologia', 'genetica'],
  QUI: ['quimica', 'qui', 'quim', 'chemistry', 'quimica organica', 'quimica inorganica'],
  ING: ['ingles', 'ing', 'english', 'lingua inglesa'],
  ESP: ['espanhol', 'esp', 'espanol', 'spanish', 'lingua espanhola'],
  HIS: ['historia', 'his', 'hist', 'history', 'historia do brasil', 'historia geral'],
  GEO: ['geografia', 'geo', 'geography', 'geopolitica'],
  FIL: ['filosofia', 'fil', 'filo', 'philosophy'],
  SOC: ['sociologia', 'soc', 'socio', 'sociology'],
  ART: ['artes', 'arte', 'art', 'arts', 'artes visuais', 'educacao artistica'],
  RED: ['redacao', 'red', 'producao textual', 'producao de texto', 'redacao dissertativa'],
  GRAM: [
    'gramatica',
    'gram',
    'lingua portuguesa',
    'portugues',
    'port',
    'linguagens',
    'lp',
  ],
  LIT: ['literatura', 'lit', 'literature', 'literatura brasileira', 'leituras'],
  ETC: ['etc', 'outros', 'diversos', 'geral'],
};

/**
 * Returns the canonical schedule subject code (e.g. 'ED.FIS', 'FIS', 'MAT') for any input string.
 * Uses a tiered, priority-based algorithm to prevent substring false positives.
 */
export function getSubjectCode(nameOrCode?: string | null): string | null {
  if (!nameOrCode) return null;

  const rawUpper = nameOrCode.trim().toUpperCase();
  // 1. Direct Code match (e.g. 'ED.FIS', 'FIS', 'MAT')
  if (SUBJECT_METADATA[rawUpper]) {
    return rawUpper;
  }

  const clean = normalizeText(nameOrCode);
  if (!clean) return null;

  // 2. Exact match with metadata name or code
  for (const [code, meta] of Object.entries(SUBJECT_METADATA)) {
    const metaClean = normalizeText(meta.name);
    const codeClean = normalizeText(code);
    if (clean === metaClean || clean === codeClean) {
      return code;
    }
  }

  // 3. Exact alias match (prioritized: check aliases for exact equality)
  for (const [code, aliases] of Object.entries(SUBJECT_ALIASES)) {
    if (aliases.some((alias) => normalizeText(alias) === clean)) {
      return code;
    }
  }

  // 4. Tokenized / Whole-word match with disambiguation
  // Specific checks for frequent collisions:
  const words = clean.split(' ');
  const hasEd = words.includes('ed') || clean.includes('educacao') || clean.includes('fisica escolar');
  const hasFis = words.includes('fis') || words.includes('fisica');

  if (hasEd && hasFis) {
    return 'ED.FIS';
  }
  if (hasFis && !hasEd) {
    return 'FIS';
  }

  // Check aliases whole words or prefix/substring matches with scoring
  let bestMatchCode: string | null = null;
  let bestScore = 0;

  for (const [code, aliases] of Object.entries(SUBJECT_ALIASES)) {
    const metaClean = normalizeText(SUBJECT_METADATA[code]?.name || '');

    for (const alias of [metaClean, ...aliases]) {
      const aliasClean = normalizeText(alias);
      if (!aliasClean) continue;

      let score = 0;
      if (clean === aliasClean) {
        score = 100;
      } else if (clean.startsWith(aliasClean + ' ') || clean.endsWith(' ' + aliasClean)) {
        score = 80;
      } else if (words.includes(aliasClean)) {
        score = 70;
      } else if (aliasClean.includes(clean) && clean.length >= 4) {
        score = 50;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatchCode = code;
      }
    }
  }

  return bestScore >= 50 ? bestMatchCode : null;
}

/**
 * Finds the best matching Subject item from a user's custom or database subjects array.
 * Correctly distinguishes between "Ed. Física" and "Física".
 */
export function findBestMatchingSubject<T extends { id: string; name: string }>(
  subjects: T[],
  query?: string | null
): T | null {
  if (!subjects || subjects.length === 0 || !query) return null;

  const cleanQuery = normalizeText(query);
  if (!cleanQuery) return null;

  // 1. Direct exact name match
  const exactMatch = subjects.find((s) => normalizeText(s.name) === cleanQuery);
  if (exactMatch) return exactMatch;

  // 2. Canonical code match
  const queryCode = getSubjectCode(query);
  if (queryCode) {
    // Check if any subject in the list resolves to the same code
    const sameCodeMatch = subjects.find((s) => getSubjectCode(s.name) === queryCode);
    if (sameCodeMatch) return sameCodeMatch;
  }

  // 3. Specific collision guard for physical education vs physics
  const queryWords = cleanQuery.split(' ');
  const queryHasEd =
    queryWords.includes('ed') || cleanQuery.includes('educacao') || queryWords.includes('ef');
  const queryHasFis = queryWords.includes('fis') || queryWords.includes('fisica');

  if (queryHasEd && queryHasFis) {
    const edFisSub = subjects.find((s) => {
      const sClean = normalizeText(s.name);
      return sClean.includes('ed') && sClean.includes('fis');
    });
    if (edFisSub) return edFisSub;
  } else if (queryHasFis && !queryHasEd) {
    const fisSub = subjects.find((s) => {
      const sClean = normalizeText(s.name);
      return (sClean === 'fisica' || sClean === 'fis') && !sClean.includes('ed') && !sClean.includes('educacao');
    });
    if (fisSub) return fisSub;
  }

  // 4. Token-based scoring
  let bestSubject: T | null = null;
  let bestScore = 0;

  for (const s of subjects) {
    const sClean = normalizeText(s.name);
    const sWords = sClean.split(' ');

    let score = 0;
    if (sClean === cleanQuery) {
      score = 100;
    } else if (sClean.startsWith(cleanQuery) || cleanQuery.startsWith(sClean)) {
      // Prevent "fisica" starting "ed fisica" (which it doesn't, but vice versa check)
      const lenDiff = Math.abs(sClean.length - cleanQuery.length);
      score = 70 - lenDiff;
    } else {
      // Count matching words
      const matchingWords = sWords.filter((w) => queryWords.includes(w) && w.length >= 3);
      if (matchingWords.length > 0) {
        score = matchingWords.length * 20;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestSubject = s;
    }
  }

  return bestScore >= 20 ? bestSubject : null;
}
