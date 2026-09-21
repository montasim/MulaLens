const MASK_CANDIDATES: Record<string, string[]> = {
  '0': ['o'],
  '1': ['i', 'l'],
  '3': ['e'],
  '4': ['a'],
  '5': ['s'],
  '7': ['t'],
  '8': ['b'],
  '@': ['a'],
  '!': ['i'],
  '$': ['s'],
  '<': ['c'],
  '>': ['x'],
  '><': ['x'],
};

const fallbackMask = (token: string): string =>
  MASK_CANDIDATES[token]?.[0] ?? token;

export const decodeLeetText = (
  value: string,
  canonicalSlug?: string,
): string => {
  const normalized = value.normalize('NFKC');
  const reference = (canonicalSlug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  let referenceIndex = 0;
  let referenceAligned = Boolean(reference);
  let wordStart = true;
  let decoded = '';

  for (let index = 0; index < normalized.length; index += 1) {
    const pair = normalized.slice(index, index + 2);
    const token = pair === '><' ? pair : normalized[index] || '';
    if (token === '><') index += 1;

    const candidates = MASK_CANDIDATES[token];
    const isReferenceCharacter = /^[a-z0-9]$/i.test(token) || Boolean(candidates);
    if (!isReferenceCharacter) {
      decoded += token;
      wordStart = /[\s/_-]/.test(token);
      continue;
    }

    const referenceCharacter = reference[referenceIndex];
    const sourceCharacter = token.toLowerCase();
    if (candidates) {
      let replacement = fallbackMask(token);
      if (
        referenceAligned &&
        referenceCharacter &&
        (referenceCharacter === sourceCharacter ||
          candidates.includes(referenceCharacter))
      ) {
        replacement =
          referenceCharacter === sourceCharacter ? token : referenceCharacter;
      }
      if (wordStart && /^[a-z]$/.test(replacement)) {
        replacement = replacement.toUpperCase();
      }
      decoded += replacement;
      if (
        referenceAligned &&
        referenceCharacter !== replacement.toLowerCase() &&
        referenceCharacter !== sourceCharacter
      ) {
        referenceAligned = false;
      }
    } else {
      decoded += token;
      if (
        referenceAligned &&
        referenceCharacter !== sourceCharacter
      ) {
        referenceAligned = false;
      }
    }

    referenceIndex += 1;
    wordStart = false;
  }

  return decoded;
};

export const slugFromCompanyUrl = (value: string): string | null => {
  try {
    const url = new URL(value, 'https://deshimula.com');
    if (url.origin !== 'https://deshimula.com') return null;
    const match = url.pathname.match(/^\/companies\/([^/?#]+)/);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

export const betonCompanySlug = (value: string): string | null => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['betonkemon.com', 'www.betonkemon.com'].includes(url.hostname)) return null;
    const match = url.pathname.match(/^\/(?:en|bn)\/c\/([^/]+)\/?$/);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

const BETON_ALIASES: Record<string, string> = {
  technonext: 'technonext-ltd',
  'brac-it-services-limited': 'brac-it',
};

export const researchSlugForBeton = (slug: string): string => BETON_ALIASES[slug] ?? slug;

export const trucareerCompanyId = (value: string): string | null => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['trucareer.co', 'www.trucareer.co'].includes(url.hostname)) return null;
    return url.pathname.match(/^\/company\/([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})\/?$/i)?.[1] ?? null;
  } catch {
    return null;
  }
};

export const trucareerCandidateSlug = (name: string): string =>
  name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const companyNamesMatch = (visible: string, canonical: string): boolean => {
  const normalize = (name: string) => name.normalize('NFKC').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '');
  return Boolean(normalize(visible)) && normalize(visible) === normalize(canonical);
};

export const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character,
  );
