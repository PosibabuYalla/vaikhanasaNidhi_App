/** Match scriptures to subcategories (including legacy docs without subcategory field). */

import { getSubcategory } from '../data/categories';
import { getCategoryInfo } from './categoryLookup';

function titleHay(scripture) {
  return `${scripture.title_telugu || ''} ${scripture.title_english || ''} ${scripture.description || ''}`.toLowerCase();
}

function titleMatches(scripture, terms) {
  const hay = titleHay(scripture);
  return terms.some((t) => hay.includes(String(t).toLowerCase()));
}

const UNIQUE_SLUG_MAP = {
  ashtottaram: { parent_key: 'stotra', key: 'ashtotharams' },
  sahasranamam: { parent_key: 'stotra', key: 'sahasranamams' },
  sandeha_nivrutti: { parent_key: 'sandeha_nivrutti', key: 'doubts' },
  chitralu: { parent_key: 'chitralu', key: 'brahmotsavam' },
};

const LEGACY_CATEGORY_TO_MAIN = {
  ashtottaram: 'stotra',
  sahasranamam: 'stotra',
};

const MAIN_SECTION_KEYS = [
  'stotra', 'mantra', 'agama', 'pooja_vidhanam', 'book',
  'alaya_viseshalu', 'sandeha_nivrutti', 'chitralu',
];

export function resolveLegacySubcategory(scripture) {
  const cat = scripture.category;

  if (UNIQUE_SLUG_MAP[cat]) {
    return UNIQUE_SLUG_MAP[cat];
  }

  if (cat === 'stotra') {
    if (titleMatches(scripture, ['suprabhatam', 'సుప్రభాత'])) {
      return { parent_key: 'stotra', key: 'suprabhatams' };
    }
    if (titleMatches(scripture, ['kavacham', 'kavach', 'కవచ'])) {
      return { parent_key: 'stotra', key: 'kavachams' };
    }
    return { parent_key: 'stotra', key: 'stotras' };
  }

  if (cat === 'mantra') {
    if (titleMatches(scripture, ['sandhya', 'sandhyavandanam', 'సంధ్య'])) {
      return { parent_key: 'mantra', key: 'sandhyavandanam' };
    }
    if (titleMatches(scripture, ['brahmotsav', 'బ్రహ్మోత్సవ'])) {
      return { parent_key: 'mantra', key: 'brahmotsva' };
    }
    if (titleMatches(scripture, ['prathishta', 'ప్రతిష్ఠ'])) {
      return { parent_key: 'mantra', key: 'prathishta' };
    }
    if (titleMatches(scripture, ['homa', 'హోమ', 'yagam', 'యాగ'])) {
      return { parent_key: 'mantra', key: 'visesha_homalu' };
    }
    if (titleMatches(scripture, ['utsava', 'ఉత్సవ'])) {
      return { parent_key: 'mantra', key: 'devaalaya_utsava' };
    }
    return { parent_key: 'mantra', key: 'others' };
  }

  if (cat === 'agama') {
    return { parent_key: 'agama', key: 'vaikhanasa_agama' };
  }

  if (cat === 'book') {
    return { parent_key: 'book', key: 'scriptures' };
  }

  if (cat === 'pooja_vidhanam') {
    return { parent_key: 'pooja_vidhanam', key: 'others' };
  }

  if (cat === 'alaya_viseshalu') {
    if (titleMatches(scripture, ['charithra', 'చరిత్ర', 'history'])) {
      return { parent_key: 'alaya_viseshalu', key: 'traditions' };
    }
    if (titleMatches(scripture, ['festival', 'పండుగ', 'nakshatra', 'నక్షత్ర'])) {
      return { parent_key: 'alaya_viseshalu', key: 'festivals' };
    }
    return { parent_key: 'alaya_viseshalu', key: 'temples' };
  }

  return null;
}

export function scriptureMatchesSubcategory(scripture, sub) {
  // Explicit subcategory from admin always wins
  if (scripture.subcategory) {
    if (scripture.subcategory !== sub.key) return false;
    if (scripture.parent_category && sub.parent_key && scripture.parent_category !== sub.parent_key) {
      return false;
    }
    return true;
  }

  const mapped = UNIQUE_SLUG_MAP[scripture.category];
  if (mapped) {
    return mapped.parent_key === sub.parent_key && mapped.key === sub.key;
  }

  const resolved = resolveLegacySubcategory(scripture);
  if (resolved) {
    return resolved.parent_key === sub.parent_key && resolved.key === sub.key;
  }

  return false;
}

export function countScripturesForSubcategory(scriptures, sub) {
  return scriptures.filter((s) => scriptureMatchesSubcategory(s, sub)).length;
}

/** Unique scriptures under a main section (any subcategory). */
export function countScripturesForMainSection(scriptures, parentKey, allSubs = []) {
  const subs = allSubs.filter((s) => s.parent_key === parentKey);
  if (!subs.length) return 0;
  const matched = new Set();
  scriptures.forEach((s) => {
    if (subs.some((sub) => scriptureMatchesSubcategory(s, sub))) {
      matched.add(s.id);
    }
  });
  return matched.size;
}

export function getScriptureBadgeLabel(scripture, parentKey, subcategories = [], mainCategories = []) {
  const pk = parentKey || scripture.parent_category;
  const subKey = scripture.subcategory || (pk ? getScriptureSubcategoryKey(scripture, pk) : null);

  if (pk && subKey) {
    const fromList = subcategories.find((s) => s.key === subKey);
    if (fromList) return fromList.labelTe || fromList.label;
    const staticSub = getSubcategory(pk, subKey);
    if (staticSub) return staticSub.labelTe || staticSub.label;
  }

  return getCategoryInfo(scripture.category, mainCategories).label;
}

export function getScriptureSubcategoryKey(scripture, parentKey) {
  const mapped = UNIQUE_SLUG_MAP[scripture.category];
  if (mapped && mapped.parent_key === parentKey) return mapped.key;

  if (scripture.subcategory) {
    if (!parentKey || !scripture.parent_category || scripture.parent_category === parentKey) {
      return scripture.subcategory;
    }
  }
  const resolved = resolveLegacySubcategory(scripture);
  if (resolved?.parent_key === parentKey) return resolved.key;
  return null;
}

/** Resolve main section key for admin display (handles legacy filter slugs). */
export function resolveScriptureParentKey(scripture) {
  if (scripture.parent_category && MAIN_SECTION_KEYS.includes(scripture.parent_category)) {
    return scripture.parent_category;
  }

  const cat = scripture.category;
  if (LEGACY_CATEGORY_TO_MAIN[cat]) return LEGACY_CATEGORY_TO_MAIN[cat];
  if (UNIQUE_SLUG_MAP[cat]) return UNIQUE_SLUG_MAP[cat].parent_key;
  if (MAIN_SECTION_KEYS.includes(cat)) return cat;

  const resolved = resolveLegacySubcategory(scripture);
  return resolved?.parent_key || cat || null;
}

/** Find subcategory row for admin table (explicit field or legacy inference). */
export function resolveScriptureSubForDisplay(scripture, allSubs = []) {
  const parentKey = resolveScriptureParentKey(scripture);
  const subKey = scripture.subcategory || (parentKey ? getScriptureSubcategoryKey(scripture, parentKey) : null);
  if (!subKey) return null;

  return allSubs.find((c) => c.key === subKey && c.parent_key === parentKey)
    || allSubs.find((c) => c.key === subKey)
    || null;
}

export function isImageGalleryScripture(scripture) {
  if (!scripture) return false;
  if (scripture.reading_layout === 'image_pages' || scripture.reading_layout === 'pdf_pages') return false;
  return scripture.parent_category === 'chitralu'
    || scripture.category === 'chitralu';
}

/** Book stored as one PDF — pages rendered in browser (low storage) */
export function isBookPdfScripture(scripture) {
  if (!scripture) return false;
  const pdfUrl = scripture.pdf_url?.trim();
  if (!pdfUrl) return false;
  if (scripture.reading_layout === 'pdf_pages') return true;
  if (scripture.reading_layout === 'image_pages') return false;
  // Saved with pdf_url but layout not set (legacy / partial save)
  return scripture.parent_category === 'book' || scripture.category === 'book';
}

/** Book imported as PDF page images — paginated image reader (high storage) */
export function isBookImageScripture(scripture) {
  if (!scripture) return false;
  if (isBookPdfScripture(scripture)) return false;
  if (scripture.reading_layout === 'image_pages') return true;
  return scripture.parent_category === 'book'
    && (scripture.images?.length || 0) >= 5
    && !(scripture.verses?.length);
}

export function isBookVisualScripture(scripture) {
  return isBookPdfScripture(scripture) || isBookImageScripture(scripture);
}

export function isImageProgressItem(item, scriptureById) {
  if (!item) return false;
  if (item.category === 'chitralu') return true;
  const scripture = scriptureById?.get?.(item.scripture_id);
  if (scripture?.reading_layout === 'image_pages' || scripture?.reading_layout === 'pdf_pages') return false;
  return isImageGalleryScripture(scripture);
}
