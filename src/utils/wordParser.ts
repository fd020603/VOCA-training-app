export interface ParsedWordsResult {
  words: string[];
  duplicateCount: number;
  rawTokenCount: number;
}

/**
 * Parses English words separated by commas, spaces, tabs, or newlines.
 * Deduplicates case-insensitively while preserving original order.
 */
export function parseVocabularyInput(raw: string): ParsedWordsResult {
  const tokens = raw
    .split(/[\s,;\n\r\t]+/)
    .map((t) => t.replace(/^[^a-zA-Z]+|[^a-zA-Z-]+$/g, '').trim())
    .filter((t) => /^[a-zA-Z][a-zA-Z'-]*$/.test(t));

  const seen = new Set<string>();
  const words: string[] = [];
  let duplicateCount = 0;

  for (const token of tokens) {
    const key = token.toLowerCase();
    if (seen.has(key)) {
      duplicateCount += 1;
    } else {
      seen.add(key);
      words.push(token);
    }
  }

  return {
    words,
    duplicateCount,
    rawTokenCount: tokens.length,
  };
}

export const SAMPLE_SHORT_WORDS = [
  'allocate',
  'bottleneck',
  'consensus',
  'streamline',
  'mandatory',
  'discrepancy',
  'implement',
  'adjacent',
  'tentative',
  'reimburse',
  'expedite',
  'comprehensive',
  'negligible',
  'mitigate',
  'endorse',
  'fluctuate',
  'scrutinize',
  'feasible',
];

export const SAMPLE_LONG_WORDS = [
  'allocate',
  'bottleneck',
  'consensus',
  'streamline',
  'mandatory',
  'discrepancy',
  'implement',
  'adjacent',
  'tentative',
  'reimburse',
  'expedite',
  'comprehensive',
  'negligible',
  'mitigate',
  'endorse',
  'fluctuate',
  'scrutinize',
  'feasible',
  'procurement',
  'contingency',
  'leverage',
  'preliminary',
  'threshold',
  'redundant',
  'escalate',
  'benchmark',
  'compliant',
  'deficit',
  'incentive',
  'substantial',
  'unanimous',
  'volatile',
  'warranty',
  'consolidate',
  'delegate',
  'oversight',
];
