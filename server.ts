import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type {
  ContinuationContext,
  GeneratedStudyResponse,
  LengthMode,
  MockExamData,
  MockExamLcPassage,
  MockExamQuestion,
  MockExamRcPassage,
  PassageItem,
  PassageStyleId,
  QuizDistractorNote,
  QuizQuestion,
  ToeicQuizType,
  VocabularyEntry,
  WordMeaningEntry,
} from './src/types/study.ts';
import { COMMON_ENGLISH_DICT } from './src/utils/commonDictionary.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const STYLE_PROMPTS: Record<PassageStyleId, string> = {
  toeic_business:
    'TOEIC Part 7 Business Documents (authentic corporate emails, internal memos, policy notices, press releases, or business articles with realistic names, dates, and action items). If 3 documents are requested, structure them as a cohesive triple-passage set (e.g., Document 1: Internal Notice or Press Release, Document 2: Follow-up Email, Document 3: Response Email or Schedule Memo) that cross-reference each other.',
  economy_it_news:
    'Modern Economy & IT Tech News Articles (analytical journalism about AI, semiconductors, fintech, market shifts, or corporate strategy in the tone of Financial Times / TechCrunch). If 3 documents are requested, structure them as a cohesive 3-part special report (e.g., Document 1: Breaking Market Report, Document 2: Industry Expert Commentary, Document 3: Consumer/Company Impact Brief).',
  daily_story:
    'Everyday Conversation & Short Story (natural spoken dialogue blended with narrative moments between friends, coworkers, or travelers). If 3 documents are requested, structure them as a cohesive 3-part narrative (e.g., Part 1: Morning Plan & Dialogue, Part 2: Unexpected Event & Conversation, Part 3: Evening Resolution).',
  web_novel:
    'Korean-style Male-oriented Web Novel translated/written in vivid English prose (genres such as Hunter/Dungeon raid, Regressor corporate takeover, Modern Genius Inventor, or Fantasy Action with sharp pacing, tense confrontations, tactical decisions, and satisfying progression). If 3 documents are requested, structure them as 3 consecutive linked chapters/scenes (Chapter 1, Chapter 2, Chapter 3).',
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'A concise Korean title summarizing the generated reading set.',
    },
    passages: {
      type: Type.ARRAY,
      description: '1 passage for short mode, or exactly 3 connected passages for long_triple mode.',
      items: {
        type: Type.OBJECT,
        properties: {
          docNumber: { type: Type.INTEGER },
          docTypeLabel: {
            type: Type.STRING,
            description: 'Short Korean label for the document type, e.g. 이메일, 사내 공지, 뉴스 기사, 제1화.',
          },
          docTitle: {
            type: Type.STRING,
            description: 'English title or email subject line for this document.',
          },
          englishTaggedText: {
            type: Type.STRING,
            description:
              'Natural English passage where EVERY occurrence of a target vocabulary word (including inflections/plurals/derivatives) is wrapped strictly as [[surfaceForm|baseWord]], e.g., [[allocated|allocate]].',
          },
          koreanTranslation: {
            type: Type.STRING,
            description: 'Natural, accurate Korean translation of the entire passage without any [[...|...]] brackets.',
          },
        },
        required: ['docNumber', 'docTypeLabel', 'docTitle', 'englishTaggedText', 'koreanTranslation'],
      },
    },
    included_words: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Exact base words from the input list that appear in the passages.',
    },
    missing_words: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Any input words that could not be included (must be empty).',
    },
    vocabulary_table: {
      type: Type.ARRAY,
      description: 'Vocabulary summary entry for EVERY input word.',
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: 'Exact input word' },
          matchedForm: { type: Type.STRING, description: 'Actual form used in the passage' },
          partOfSpeech: { type: Type.STRING, description: 'Abbreviated POS such as n., v., adj., adv., phr.' },
          coreMeaning: { type: Type.STRING, description: 'Core dictionary Korean meaning(s)' },
          contextMeaning: { type: Type.STRING, description: 'Specific meaning as used in the generated passage in Korean' },
          pronunciationStressKo: {
            type: Type.STRING,
            description:
              'Korean phonetic pronunciation with syllable hyphens and the primary stressed syllable wrapped in **...**, e.g. "섭-**시**-퀀트" or "어-**컴**-퍼니".',
          },
          lcParaphrases: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              '2 to 3 frequent TOEIC LC paraphrasing synonyms/phrases heard in Listening Comprehension (e.g. ["go with", "join"] for accompany, or ["following", "next"] for subsequent).',
          },
          collocations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              '1 to 2 high-frequency TOEIC preposition/verb collocations with concise Korean translation, e.g. "be eligible for ~ (~할 자격이 있다)".',
          },
          synonymNuance: {
            type: Type.STRING,
            description:
              'Concise Korean comparison distinguishing this word from a commonly confused TOEIC synonym, e.g. "eligible(자격·조건을 갖춘) vs qualified(능력·경력을 증명한)".',
          },
        },
        required: [
          'word',
          'matchedForm',
          'partOfSpeech',
          'coreMeaning',
          'contextMeaning',
          'pronunciationStressKo',
          'lcParaphrases',
          'collocations',
          'synonymNuance',
        ],
      },
    },
    word_meanings: {
      type: Type.ARRAY,
      description:
        'Hover dictionary entries for ALL unique English words appearing in the generated passages (content words: nouns, verbs, adjectives, adverbs, and non-trivial prepositions/conjunctions) using their exact lowercase surface form as seen in the passage.',
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING, description: 'Lowercase English word token appearing in the passages' },
          partOfSpeech: { type: Type.STRING, description: 'Abbreviated POS (n., v., adj., adv., prep., conj., etc.)' },
          meaning: { type: Type.STRING, description: 'Concise contextual Korean meaning in the passage' },
        },
        required: ['word', 'partOfSpeech', 'meaning'],
      },
    },
    quizzes: {
      type: Type.ARRAY,
      description:
        'Exactly 10 authentic TOEIC RC questions: 4 Part 5 (2 Word Family + 2 Semantic Nuance/Collocation), 2 Part 6 (Context Blank / Sentence Insertion using an excerpted paragraph), and 4 Part 7 (2 Synonym in Context + 2 Reading Comprehension / Inference / NOT-mentioned).',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          quizType: {
            type: Type.STRING,
            description:
              'Must be one of: "part5_word_family", "part5_synonym_vocab", "part6_context_insertion", "part7_synonym_in_context", "part7_reading_inference".',
          },
          typeBadge: {
            type: Type.STRING,
            description:
              'Korean badge label: "Part 5 - 품사 변형", "Part 5 - 유의어 어휘", "Part 6 - 문맥 추론/삽입", "Part 7 - 문맥상 동의어", or "Part 7 - 세부 내용 추론".',
          },
          targetWord: {
            type: Type.STRING,
            description:
              'Exact target word from the user input list tested in this question (or the key target word inside the evidence sentence for Part 7 reading/inference questions).',
          },
          excerptParagraph: {
            type: Type.STRING,
            description:
              'For Part 6 questions: a 2~4 sentence paragraph excerpted/adapted from the generated passage with [ ___ ] marking the blank. For Part 5 and Part 7, use empty string "".',
          },
          questionSentence: {
            type: Type.STRING,
            description:
              'For Part 5: single business/story sentence with ______. For Part 6: concise prompt e.g. "Which best fits the blank [ ___ ] in the excerpt above?". For Part 7 Synonym: e.g. In the passage, the word "surface" in Document 1 (Paragraph 2) is closest in meaning to:. For Part 7 Inference: e.g. What is indicated about ...? or Which of the following is NOT mentioned about ...?',
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Exactly 4 distinct English options (words, phrases, or full sentences for Part 6/7).',
          },
          correctIndex: {
            type: Type.INTEGER,
            description: '0-based index (0, 1, 2, or 3) of the single correct option.',
          },
          koreanTranslation: {
            type: Type.STRING,
            description:
              'Accurate, natural Korean translation of the question sentence (and for Part 6, the Korean translation of the excerpt paragraph with the blank filled/indicated; for Part 7, the Korean translation of the question stem).',
          },
          answerReason: {
            type: Type.STRING,
            description:
              'Clear Korean explanation of WHY the correct option is right: cite specific grammar structure/POS rules/collocations for Part 5 & 6, or quote/cite the exact evidence sentence & logic from the passage for Part 7.',
          },
          distractorNotes: {
            type: Type.ARRAY,
            description: 'Exactly 3 entries explaining each of the 3 incorrect options.',
            items: {
              type: Type.OBJECT,
              properties: {
                option: {
                  type: Type.STRING,
                  description: 'Exact text of the incorrect option matching options[]',
                },
                meaningKo: {
                  type: Type.STRING,
                  description: 'Concise Korean meaning of this option',
                },
                reasonKo: {
                  type: Type.STRING,
                  description: 'Why this option is wrong (grammatical mismatch, wrong nuance/collocation, or contradicted/unmentioned in passage) in Korean',
                },
              },
              required: ['option', 'meaningKo', 'reasonKo'],
            },
          },
          koreanExplanation: {
            type: Type.STRING,
            description: 'Concise 1-sentence Korean summary of the explanation.',
          },
        },
        required: [
          'id',
          'quizType',
          'typeBadge',
          'targetWord',
          'excerptParagraph',
          'questionSentence',
          'options',
          'correctIndex',
          'koreanTranslation',
          'answerReason',
          'distractorNotes',
          'koreanExplanation',
        ],
      },
    },
  },
  required: [
    'title',
    'passages',
    'included_words',
    'missing_words',
    'vocabulary_table',
    'word_meanings',
    'quizzes',
  ],
};

function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripTags(taggedText: string): string {
  return taggedText.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$1');
}

function extractUniqueEnglishTokens(passages: PassageItem[]): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const p of passages) {
    const plain = stripTags(p.englishTaggedText);
    const matches = plain.match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) ?? [];
    for (const m of matches) {
      const lower = m.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        tokens.push(lower);
      }
    }
  }
  return tokens;
}

const VALID_QUIZ_TYPES = new Set<ToeicQuizType>([
  'part5_word_family',
  'part5_synonym_vocab',
  'part6_context_insertion',
  'part7_synonym_in_context',
  'part7_reading_inference',
]);

const DEFAULT_BADGE_BY_TYPE: Record<ToeicQuizType, string> = {
  part5_word_family: 'Part 5 - 품사 변형',
  part5_synonym_vocab: 'Part 5 - 유의어 어휘',
  part6_context_insertion: 'Part 6 - 문맥 추론/삽입',
  part7_synonym_in_context: 'Part 7 - 문맥상 동의어',
  part7_reading_inference: 'Part 7 - 세부 내용 추론',
};

function normalizeToeicQuizzes(
  rawQuizzes: QuizQuestion[] | undefined,
  inputWords: string[],
  quizCount: number
): QuizQuestion[] {
  const inputByLower = new Map<string, string>();
  for (const w of inputWords) {
    const key = normalizeWord(w);
    if (key && !inputByLower.has(key)) {
      inputByLower.set(key, w);
    }
  }

  return (rawQuizzes ?? []).slice(0, quizCount).map((q, idx) => {
    const rawType = typeof q.quizType === 'string' ? q.quizType.trim() : '';
    const quizType: ToeicQuizType = VALID_QUIZ_TYPES.has(rawType as ToeicQuizType)
      ? (rawType as ToeicQuizType)
      : 'part5_synonym_vocab';

    const typeBadge =
      typeof q.typeBadge === 'string' && q.typeBadge.trim().length > 0
        ? q.typeBadge.trim()
        : DEFAULT_BADGE_BY_TYPE[quizType];

    const rawTarget = typeof q.targetWord === 'string' ? q.targetWord.trim() : '';
    const canonicalTarget = inputByLower.get(normalizeWord(rawTarget)) ?? rawTarget;

    const options = Array.isArray(q.options) ? q.options.slice(0, 4).map((o) => String(o)) : [];
    const correctIndex =
      typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < options.length
        ? q.correctIndex
        : 0;

    const distractorNotes: QuizDistractorNote[] = Array.isArray(q.distractorNotes)
      ? q.distractorNotes
          .filter(
            (d): d is QuizDistractorNote =>
              Boolean(d) &&
              typeof d.option === 'string' &&
              typeof d.meaningKo === 'string' &&
              typeof d.reasonKo === 'string'
          )
          .slice(0, 3)
      : [];

    return {
      id: idx + 1,
      quizType,
      typeBadge,
      targetWord: canonicalTarget,
      excerptParagraph:
        typeof q.excerptParagraph === 'string' ? q.excerptParagraph.trim() : '',
      questionSentence: String(q.questionSentence ?? '').trim(),
      options,
      correctIndex,
      koreanTranslation:
        typeof q.koreanTranslation === 'string' ? q.koreanTranslation.trim() : '',
      answerReason: typeof q.answerReason === 'string' ? q.answerReason.trim() : '',
      distractorNotes,
      koreanExplanation: String(q.koreanExplanation ?? '').trim(),
    };
  });
}

function auditAndNormalizePassages(
  inputWords: string[],
  passages: PassageItem[]
): {
  passages: PassageItem[];
  includedWords: string[];
  missingWords: string[];
  matchedFormsMap: Map<string, string>;
} {
  const inputByLower = new Map<string, string>();
  for (const w of inputWords) {
    const key = normalizeWord(w);
    if (key && !inputByLower.has(key)) {
      inputByLower.set(key, w);
    }
  }

  const foundSet = new Set<string>();
  const matchedFormsMap = new Map<string, string>();

  const tagRegex = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;

  const normalizedPassages = passages.map((p) => {
    const updatedText = p.englishTaggedText.replace(tagRegex, (_full, surface: string, base: string) => {
      const cleanSurface = surface.trim();
      const cleanBase = base.trim();
      const baseLower = normalizeWord(cleanBase);
      const surfaceLower = normalizeWord(cleanSurface);

      let canonicalBase = inputByLower.get(baseLower);
      if (!canonicalBase) {
        canonicalBase = inputByLower.get(surfaceLower);
      }
      if (!canonicalBase) {
        for (const [k, orig] of inputByLower.entries()) {
          if (
            k.length >= 4 &&
            (baseLower.startsWith(k.slice(0, Math.max(4, k.length - 2))) ||
              surfaceLower.startsWith(k.slice(0, Math.max(4, k.length - 2))))
          ) {
            canonicalBase = orig;
            break;
          }
        }
      }

      if (canonicalBase) {
        foundSet.add(normalizeWord(canonicalBase));
        if (!matchedFormsMap.has(normalizeWord(canonicalBase))) {
          matchedFormsMap.set(normalizeWord(canonicalBase), cleanSurface);
        }
        return `[[${cleanSurface}|${canonicalBase}]]`;
      }

      return cleanSurface;
    });

    return {
      ...p,
      englishTaggedText: updatedText,
    };
  });

  const missingAfterTags = Array.from(inputByLower.entries()).filter(([k]) => !foundSet.has(k));

  if (missingAfterTags.length > 0) {
    for (const [lowerWord, origWord] of missingAfterTags) {
      const stemPrefix = lowerWord.length >= 5 ? lowerWord.slice(0, lowerWord.length - 1) : lowerWord;
      const wordPattern = new RegExp(
        `\\b(${escapeRegExp(origWord)}|${escapeRegExp(stemPrefix)}[a-zA-Z]{0,5})\\b`,
        'i'
      );

      for (let i = 0; i < normalizedPassages.length; i++) {
        const parts = normalizedPassages[i].englishTaggedText.split(/(\[\[[^\]]+\]\])/g);
        let replaced = false;
        for (let j = 0; j < parts.length; j++) {
          if (parts[j].startsWith('[[') && parts[j].endsWith(']]')) continue;
          const m = parts[j].match(wordPattern);
          if (m && m[1]) {
            const matched = m[1];
            parts[j] = parts[j].replace(wordPattern, `[[${matched}|${origWord}]]`);
            foundSet.add(lowerWord);
            matchedFormsMap.set(lowerWord, matched);
            replaced = true;
            break;
          }
        }
        if (replaced) {
          normalizedPassages[i] = {
            ...normalizedPassages[i],
            englishTaggedText: parts.join(''),
          };
          break;
        }
      }
    }
  }

  const includedWords: string[] = [];
  const missingWords: string[] = [];

  for (const w of inputWords) {
    const key = normalizeWord(w);
    if (foundSet.has(key)) {
      if (!includedWords.some((x) => normalizeWord(x) === key)) {
        includedWords.push(w);
      }
    } else {
      if (!missingWords.some((x) => normalizeWord(x) === key)) {
        missingWords.push(w);
      }
    }
  }

  return {
    passages: normalizedPassages,
    includedWords,
    missingWords,
    matchedFormsMap,
  };
}

async function repairMissingWords(
  passages: PassageItem[],
  missingWords: string[],
  style: PassageStyleId
): Promise<PassageItem[]> {
  const repairSchema = {
    type: Type.OBJECT,
    properties: {
      passages: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            docNumber: { type: Type.INTEGER },
            docTypeLabel: { type: Type.STRING },
            docTitle: { type: Type.STRING },
            englishTaggedText: { type: Type.STRING },
            koreanTranslation: { type: Type.STRING },
          },
          required: ['docNumber', 'docTypeLabel', 'docTitle', 'englishTaggedText', 'koreanTranslation'],
        },
      },
    },
    required: ['passages'],
  };

  const repairPrompt = `You previously generated the following English passages in the style of "${STYLE_PROMPTS[style]}", but some required vocabulary words were omitted.

MISSING WORDS THAT MUST BE ADDED (EVERY SINGLE ONE):
${missingWords.map((w, i) => `${i + 1}. ${w}`).join('\n')}

EXISTING PASSAGES JSON:
${JSON.stringify(passages, null, 2)}

TASK:
Naturally revise and expand sentences inside the existing passages to weave EVERY SINGLE missing word above into the context seamlessly.
- Preserve ALL existing [[surface|base]] tags intact.
- Wrap EVERY newly inserted missing word (even if conjugated, pluralized, or derived) in [[surfaceForm|exactBaseWord]] where exactBaseWord matches the missing word string verbatim.
- Update koreanTranslation of modified passages to reflect the added sentences naturally.
- Keep the exact same number of passages (${passages.length}).`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: repairPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: repairSchema,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as { passages?: PassageItem[] };
  if (Array.isArray(parsed.passages) && parsed.passages.length === passages.length) {
    return parsed.passages;
  }
  return passages;
}

async function fillUncoveredWordMeanings(
  uncoveredTokens: string[],
  passages: PassageItem[]
): Promise<Array<{ word: string; partOfSpeech: string; meaning: string }>> {
  if (uncoveredTokens.length === 0) return [];

  const lookupSchema = {
    type: Type.OBJECT,
    properties: {
      entries: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            meaning: { type: Type.STRING },
          },
          required: ['word', 'partOfSpeech', 'meaning'],
        },
      },
    },
    required: ['entries'],
  };

  const plainPassages = passages
    .map((p) => `[Doc ${p.docNumber}] ${stripTags(p.englishTaggedText)}`)
    .join('\n\n');

  const prompt = `Provide concise Korean dictionary meanings and parts of speech (n., v., adj., adv., prep., conj., pron., etc.) for each English word token below, matching how each word is used in the given passage context.

PASSAGE CONTEXT:
${plainPassages}

WORD TOKENS TO DEFINE (${uncoveredTokens.length} words — return every single one verbatim in lowercase):
${uncoveredTokens.join(', ')}`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: lookupSchema,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  const parsed = JSON.parse((response.text ?? '{}').trim()) as {
    entries?: Array<{ word: string; partOfSpeech: string; meaning: string }>;
  };

  return Array.isArray(parsed.entries) ? parsed.entries : [];
}

async function buildWordMeaningsDictionary(
  passages: PassageItem[],
  modelWordMeanings: Array<{ word: string; partOfSpeech: string; meaning: string }>,
  vocabTable: VocabularyEntry[]
): Promise<Record<string, WordMeaningEntry>> {
  const dict: Record<string, WordMeaningEntry> = { ...COMMON_ENGLISH_DICT };

  // 1. Seed from Gemini's primary word_meanings array
  for (const item of modelWordMeanings) {
    const key = normalizeWord(item.word);
    if (key && item.meaning) {
      dict[key] = {
        partOfSpeech: item.partOfSpeech || '-',
        meaning: item.meaning,
      };
    }
  }

  // 2. Seed/override with target vocabulary entries (both base and matched surface form)
  for (const v of vocabTable) {
    const baseKey = normalizeWord(v.word);
    const surfaceKey = normalizeWord(v.matchedForm);
    if (baseKey) {
      dict[baseKey] = {
        partOfSpeech: v.partOfSpeech,
        meaning: v.contextMeaning || v.coreMeaning,
        baseWord: v.word,
      };
    }
    if (surfaceKey) {
      dict[surfaceKey] = {
        partOfSpeech: v.partOfSpeech,
        meaning: v.contextMeaning || v.coreMeaning,
        baseWord: v.word,
      };
    }
  }

  // 3. Extract EVERY unique English word token from the final passages
  const allPassageTokens = extractUniqueEnglishTokens(passages);

  // Quick inflection fallback before calling AI (e.g. handle simple contractions like don't / it's or plurals if base exists)
  const uncovered: string[] = [];
  for (const token of allPassageTokens) {
    if (dict[token]) continue;

    // Handle possessives/contractions like company's -> company
    if (token.endsWith("'s")) {
      const stem = token.slice(0, -2);
      if (dict[stem]) {
        dict[token] = {
          partOfSpeech: dict[stem].partOfSpeech,
          meaning: `${dict[stem].meaning}(의)`,
          baseWord: stem,
        };
        continue;
      }
    }

    uncovered.push(token);
  }

  // 4. Fill any remaining uncovered tokens via one fast batch lookup so hover coverage is ~100%
  if (uncovered.length > 0) {
    try {
      const filled = await fillUncoveredWordMeanings(uncovered.slice(0, 180), passages);
      for (const item of filled) {
        const key = normalizeWord(item.word);
        if (key && item.meaning) {
          dict[key] = {
            partOfSpeech: item.partOfSpeech || '-',
            meaning: item.meaning,
          };
        }
      }
    } catch (err) {
      console.warn('Secondary word_meanings enrichment failed:', err);
    }
  }

  // Return compact dictionary keyed to tokens present in passages (+ common dict keys omitted if unused to save localStorage space)
  const compactDict: Record<string, WordMeaningEntry> = {};
  for (const token of allPassageTokens) {
    if (dict[token]) {
      compactDict[token] = dict[token];
    }
  }
  for (const v of vocabTable) {
    const k = normalizeWord(v.word);
    if (k && dict[k]) compactDict[k] = dict[k];
  }

  return compactDict;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/generate-story', async (req, res) => {
    try {
      const { words, style, lengthMode, continuation } = req.body as {
        words?: string[];
        style?: PassageStyleId;
        lengthMode?: LengthMode;
        continuation?: ContinuationContext;
      };

      if (!Array.isArray(words) || words.length === 0) {
        res.status(400).json({ error: '최소 1개 이상의 영단어를 입력해 주세요.' });
        return;
      }

      if (words.length > 80) {
        res.status(400).json({ error: '한 번에 최대 80개까지의 영단어를 입력할 수 있습니다.' });
        return;
      }

      const safeStyle: PassageStyleId =
        style && style in STYLE_PROMPTS ? style : 'toeic_business';
      const safeLength: LengthMode = lengthMode === 'long_triple' ? 'long_triple' : 'short';
      const quizCount = 10;
      const targetLengthDesc =
        safeLength === 'long_triple'
          ? 'EXACTLY 3 connected passages (docNumber 1, 2, 3 — 삼중 연계 지문) whose total English word count across all 3 documents is roughly 550~650 words (about 180~220 words per document) and whose plot/information flows cohesively across documents.'
          : 'EXACTLY 1 cohesive English passage (docNumber 1) of roughly 250~300 words.';

      const hasContinuation =
        Boolean(continuation) &&
        typeof continuation?.episodeNumber === 'number' &&
        continuation.episodeNumber >= 2 &&
        typeof continuation?.previousPassagesPlainText === 'string' &&
        continuation.previousPassagesPlainText.trim().length > 0;

      const continuationPromptSection = hasContinuation && continuation
        ? `\nSERIALIZED STORY CONTINUATION (연재 소설 모드 — Episode #${continuation.episodeNumber}):
You are writing the DIRECT SEQUEL (Episode #${continuation.episodeNumber}) continuing immediately after the events of the previous episode below.
- Previous Episode Title: "${continuation.previousTitle}"
- Maintain the exact same characters, names, world-building, corporate/story setting, unresolved plot threads, and narrative tone, advancing the plot logically from right where the previous episode ended.
- Previous Episode Text (reference for plot, characters, and setting):
"""
${continuation.previousPassagesPlainText.slice(0, 3200)}
"""${
            Array.isArray(continuation.callbackWords) && continuation.callbackWords.length > 0
              ? `\n- Natural Callback / Foreshadowing Review Words: Subtly weave 2~3 of these prior episode words (${continuation.callbackWords.join(', ')}) into a brief flashback, dialogue callback, or foreshadowing line (do NOT wrap callback-only words in [[...|...]] brackets unless they are also in today's TARGET WORDS list).`
              : ''
          }\n`
        : '';

      const numberedWords = words.map((w, idx) => `${idx + 1}. ${w}`).join('\n');

      const systemInstruction = `You are an expert TOEIC RC test developer, English curriculum designer, and creative writer for Korean learners.
Your highest priority is 100% vocabulary coverage: EVERY SINGLE target word provided by the user MUST appear at least once naturally in the English passage(s), with ZERO omissions.
Whenever a target word appears in the English text (whether in base form, past/participle tense, plural, or derived POS), you MUST wrap it strictly as [[surfaceForm|exactInputWord]] (e.g., if input is "allocate" and text uses "allocated", write [[allocated|allocate]]).
Do NOT leave [[...|...]] brackets in koreanTranslation, docTitle, vocabulary_table, or quizzes.`;

      const prompt = `Create a complete English vocabulary review set for the following ${words.length} target words.

TARGET WORDS (${words.length} total — ALL MUST BE INCLUDED):
${numberedWords}

PASSAGE STYLE:
${STYLE_PROMPTS[safeStyle]}
${continuationPromptSection}
LENGTH & STRUCTURE REQUIREMENT:
${targetLengthDesc}

QUIZ REQUIREMENT (EXACTLY 10 AUTHENTIC TOEIC RC QUESTIONS — id 1 to 10):
Generate ALL 10 questions following the exact TOEIC RC part distribution below (even if fewer than 10 target words were provided, test different words/grammatical angles without duplicating questions). Spread questions across distinct target words whenever possible:

1) Questions 1~4 — Part 5 Style (40%, 4 questions):
   - Questions 1 & 2 ("quizType": "part5_word_family", "typeBadge": "Part 5 - 품사 변형"):
     Write a realistic TOEIC business-context sentence with ______ where 4 options are DIFFERENT PARTS OF SPEECH from the SAME WORD FAMILY (noun, verb, adjective, adverb — e.g., ["comply", "compliance", "compliant", "compliantly"]) of a target word. Only 1 POS fits the sentence structure unambiguously.
   - Questions 3 & 4 ("quizType": "part5_synonym_vocab", "typeBadge": "Part 5 - 유의어 어휘"):
     Write a realistic TOEIC business-context sentence with ______ where all 4 options share the same POS and are semantically close/confusable TOEIC synonyms or collocation traps (e.g., eligible vs qualified vs competent vs entitled), so only 1 option fits the exact collocation/nuance.

2) Questions 5~6 — Part 6 Style (20%, 2 questions):
   - Question 5 ("quizType": "part6_context_insertion", "typeBadge": "Part 6 - 문맥 어휘"):
     Excerpt a 2~4 sentence paragraph from your generated passage into "excerptParagraph" replacing one target word or logical discourse connector with [ ___ ]. Set "questionSentence" to "Choose the word or phrase that best fits the blank [ ___ ] in the excerpt above." Provide 4 plausible context options.
   - Question 6 ("quizType": "part6_context_insertion", "typeBadge": "Part 6 - 문장 삽입"):
     Excerpt a 3~4 sentence paragraph from your generated passage into "excerptParagraph" replacing one entire middle/transitional sentence (which incorporates a target word) with [ ___ ]. Set "questionSentence" to "Which sentence best fits the blank [ ___ ] in the excerpt above?" Provide 4 full-sentence options where only 1 logically bridges the preceding and following sentences.

3) Questions 7~10 — Part 7 Style (40%, 4 questions):
   - Questions 7 & 8 ("quizType": "part7_synonym_in_context", "typeBadge": "Part 7 - 문맥상 동의어"):
     Select a target word that appears in your generated passage. Format "questionSentence" strictly like real TOEIC Part 7:
     In the passage, the word "<exactSurfaceForm>" in ${safeLength === 'long_triple' ? 'Document X (Paragraph Y)' : 'Paragraph Y'} is closest in meaning to:
     Provide 4 single-word/short-phrase options matching the EXACT part of speech and tense/inflection of "<exactSurfaceForm>", where only 1 matches its specific contextual meaning in that paragraph.
   - Questions 9 & 10 ("quizType": "part7_reading_inference", "typeBadge": "Part 7 - 세부 내용 추론"):
     Ask 1 reading inference/detail question (e.g., "What is indicated about ~?" or "Why did ~?") and 1 NOT-mentioned / true-false detail question (e.g., "Which of the following is NOT mentioned about ~?" or "What can be inferred about ~?") based strictly on events, facts, characters, or policies in your generated passage(s). Set "targetWord" to a key target word from the evidence sentence so wrong answers are tracked in the user's vocabulary review list.

EXPLANATION REQUIREMENT FOR EVERY QUESTION:
For every single question (1~10), populate:
- "koreanTranslation": natural Korean translation of the question sentence (and excerpt for Part 6).
- "answerReason": thorough Korean explanation stating WHY the correct answer works (grammatical structure/POS clue/collocation for Part 5·6, or exact passage evidence sentence/fact for Part 7).
- "distractorNotes": exactly 3 items (one for each incorrect option in options[]), with exact "option" text, "meaningKo" (Korean meaning of the distractor), and "reasonKo" (specific reason it is incorrect).
- "koreanExplanation": concise 1-sentence Korean summary.

VOCABULARY TABLE REQUIREMENT:
Include an entry in "vocabulary_table" for ALL ${words.length} target words, showing:
- word: exact input word
- matchedForm: the surface form actually used in the passage
- partOfSpeech: standard abbreviation (n., v., adj., adv., phr., etc.)
- coreMeaning: primary Korean dictionary meaning
- contextMeaning: nuanced Korean meaning in the generated passage
- pronunciationStressKo: Korean phonetic reading with syllable hyphens and the primary stressed syllable wrapped in **...** (e.g., "섭-**시**-퀀트", "어-**컴**-퍼니", "**앨**-러-케이트")
- lcParaphrases: 2~3 high-frequency TOEIC LC paraphrasing synonyms/phrases heard in listening (e.g., ["following", "next"] or ["go with", "join"])
- collocations: 1~2 high-frequency TOEIC preposition/verb collocation patterns with short Korean gloss (e.g., ["be eligible for ~ (~할 자격이 있다)", "subsequent to ~ (~에 이어)"])
- synonymNuance: concise Korean comparison against a frequently confused TOEIC synonym (e.g., "eligible(자격·조건을 갖춘) vs qualified(능력·경력을 증명한)")

HOVER DICTIONARY REQUIREMENT ("word_meanings"):
Also populate "word_meanings" with the exact lowercase surface form, partOfSpeech, and concise contextual Korean meaning for every meaningful/content English word (nouns, verbs, adjectives, adverbs, key prepositions/conjunctions) used in the generated passages so learners can hover over ANY word to see its meaning immediately.

FINAL SELF-CHECK BEFORE RESPONDING:
Verify every single word from 1 to ${words.length} appears wrapped as [[surface|word]] in englishTaggedText.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('모델 응답이 비어 있습니다.');
      }

      const data = JSON.parse(rawText) as Omit<GeneratedStudyResponse, 'word_meanings'> & {
        word_meanings?: Array<{ word: string; partOfSpeech: string; meaning: string }>;
      };

      if (!Array.isArray(data.passages) || data.passages.length === 0) {
        throw new Error('지문 데이터가 올바르게 생성되지 않았습니다.');
      }

      // Deterministic server-side audit
      let audit = auditAndNormalizePassages(words, data.passages);

      if (audit.missingWords.length > 0) {
        try {
          const repairedPassages = await repairMissingWords(
            audit.passages,
            audit.missingWords,
            safeStyle
          );
          audit = auditAndNormalizePassages(words, repairedPassages);
        } catch (repairErr) {
          console.warn('Missing-word repair pass failed, returning primary audit:', repairErr);
        }
      }

      const vocabMap = new Map<string, VocabularyEntry>();
      for (const entry of data.vocabulary_table ?? []) {
        const key = normalizeWord(entry.word);
        if (key && !vocabMap.has(key)) {
          vocabMap.set(key, {
            ...entry,
            matchedForm: audit.matchedFormsMap.get(key) ?? entry.matchedForm ?? entry.word,
          });
        }
      }

      const completeVocabTable: VocabularyEntry[] = words.map((w) => {
        const key = normalizeWord(w);
        const existing = vocabMap.get(key);
        if (existing) {
          return {
            ...existing,
            word: w,
            matchedForm: audit.matchedFormsMap.get(key) ?? existing.matchedForm,
          };
        }
        return {
          word: w,
          matchedForm: audit.matchedFormsMap.get(key) ?? w,
          partOfSpeech: '-',
          coreMeaning: '사전 뜻 참고',
          contextMeaning: '지문 문맥 참고',
          pronunciationStressKo: '-',
          lcParaphrases: [],
          collocations: [],
          synonymNuance: '-',
        };
      });

      const wordMeaningsDict = await buildWordMeaningsDictionary(
        audit.passages,
        Array.isArray(data.word_meanings) ? data.word_meanings : [],
        completeVocabTable
      );

      const normalizedQuizzes = normalizeToeicQuizzes(data.quizzes, words, quizCount);

      const rawTitle = (data.title || '맞춤형 영단어 스토리 복습')
        .replace(/^\[연재\s*#\d+화\]\s*/i, '')
        .trim();
      const finalTitle =
        hasContinuation && continuation
          ? `[연재 #${continuation.episodeNumber}화] ${rawTitle}`
          : rawTitle;

      const finalPayload: GeneratedStudyResponse = {
        title: finalTitle,
        passages: audit.passages,
        included_words: audit.includedWords,
        missing_words: audit.missingWords,
        vocabulary_table: completeVocabTable,
        word_meanings: wordMeaningsDict,
        quizzes: normalizedQuizzes,
      };

      res.json(finalPayload);
    } catch (error) {
      console.error('Error generating vocabulary story:', error);
      const message =
        error instanceof Error ? error.message : '지문 생성 중 예기치 않은 오류가 발생했습니다.';
      res.status(500).json({ error: message });
    }
  });

  const MOCK_EXAM_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      lcPassages: {
        type: Type.ARRAY,
        description: 'Exactly 2 listening scripts: id "lc_part3" (Part 3 dialogue) and id "lc_part4" (Part 4 monologue).',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: '"lc_part3" or "lc_part4"' },
            part: { type: Type.STRING, description: '"Part 3" or "Part 4"' },
            titleKo: { type: Type.STRING, description: 'Short Korean topic title' },
            contextLabel: { type: Type.STRING, description: 'e.g. "Questions 5-7 refer to the following conversation." or "Questions 8-10 refer to the following announcement."' },
            turns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING, description: '"Man", "Woman", or "Narrator"' },
                  line: { type: Type.STRING, description: 'Natural spoken English dialogue turn or talk segment' },
                },
                required: ['speaker', 'line'],
              },
            },
            koreanTranslation: { type: Type.STRING, description: 'Full Korean translation of the audio script' },
          },
          required: ['id', 'part', 'titleKo', 'contextLabel', 'turns', 'koreanTranslation'],
        },
      },
      rcPassages: {
        type: Type.ARRAY,
        description: 'Exactly 2 reading passages: id "rc_part6" (with blanks [ 16 ] and [ 17 ]) and id "rc_part7" (business notice/email/article).',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: '"rc_part6" or "rc_part7"' },
            part: { type: Type.STRING, description: '"Part 6" or "Part 7"' },
            docTypeLabel: { type: Type.STRING, description: 'Korean document label e.g. "사내 공지", "비즈니스 이메일"' },
            docTitle: { type: Type.STRING, description: 'English title or subject line' },
            englishText: { type: Type.STRING, description: 'Clean English passage (rc_part6 MUST contain [ 16 ] and [ 17 ]). No [[...|...]] brackets.' },
            koreanTranslation: { type: Type.STRING, description: 'Natural Korean translation of the passage' },
          },
          required: ['id', 'part', 'docTypeLabel', 'docTitle', 'englishText', 'koreanTranslation'],
        },
      },
      questions: {
        type: Type.ARRAY,
        description: 'Exactly 20 TOEIC questions numbered 1 to 20 (1~10 LC, 11~20 RC).',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            section: { type: Type.STRING, description: '"LC" for 1~10, "RC" for 11~20' },
            part: { type: Type.STRING, description: '"Part 2", "Part 3", "Part 4", "Part 5", "Part 6", or "Part 7"' },
            typeBadge: { type: Type.STRING, description: 'Concise Korean tag e.g. "LC Part 2 - 질의응답", "RC Part 5 - 품사 변형"' },
            passageId: { type: Type.STRING, description: 'For Part 3: "lc_part3"; Part 4: "lc_part4"; Part 6: "rc_part6"; Part 7: "rc_part7"; empty "" for Part 2 & Part 5.' },
            targetWord: { type: Type.STRING, description: 'Exact word from the provided learned words list tested or referenced by this question.' },
            spokenPrompt: { type: Type.STRING, description: 'For Part 2 (id 1~4): the exact spoken English question/statement. Empty "" for other parts.' },
            questionText: { type: Type.STRING, description: 'Visible English question stem (for Part 2, e.g. "Listen to the question and choose the best response."; for Part 5, sentence with ______; for Part 6, e.g. "Choose the best option for [ 16 ]."; for Part 3/4/7, the printed test question).' },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 English spoken responses for Part 2 (id 1~4); 4 English options for id 5~20.',
            },
            correctIndex: { type: Type.INTEGER, description: '0-based index of the correct option' },
            koreanTranslation: { type: Type.STRING, description: 'Korean translation of the question (and Part 2 spoken A/B/C responses).' },
            koreanExplanation: { type: Type.STRING, description: 'Detailed Korean explanation citing grammatical cues, logical response, or passage evidence.' },
            paraphrasePoint: { type: Type.STRING, description: 'Key TOEIC paraphrasing point in Korean/English (e.g. "accompany ↔ join / go with") or key grammar rule.' },
          },
          required: [
            'id',
            'section',
            'part',
            'typeBadge',
            'passageId',
            'targetWord',
            'spokenPrompt',
            'questionText',
            'options',
            'correctIndex',
            'koreanTranslation',
            'koreanExplanation',
            'paraphrasePoint',
          ],
        },
      },
    },
    required: ['lcPassages', 'rcPassages', 'questions'],
  };

  app.post('/api/generate-mock-exam', async (req, res) => {
    try {
      const { words, sessionTitle } = req.body as {
        words?: string[];
        sessionTitle?: string;
      };

      if (!Array.isArray(words) || words.length === 0) {
        res.status(400).json({ error: '모의고사를 생성할 영단어 목록이 필요합니다.' });
        return;
      }

      const cleanWords = words
        .map((w) => String(w).trim())
        .filter(Boolean)
        .slice(0, 80);

      const inputByLower = new Map<string, string>();
      for (const w of cleanWords) {
        const k = normalizeWord(w);
        if (k && !inputByLower.has(k)) inputByLower.set(k, w);
      }

      const prompt = `Create a complete 20-question authentic TOEIC Mock Exam (10 LC + 10 RC) specifically built around the user's learned vocabulary list below.
Session Theme Reference: "${sessionTitle || '비즈니스 및 실무 영어'}"

LEARNED TARGET WORDS (${cleanWords.length} words — weave ALL or as many distinct words as possible naturally across LC & RC questions):
${cleanWords.map((w, i) => `${i + 1}. ${w}`).join('\n')}

STRICT 20-QUESTION BLUEPRINT:
[SECTION 1: LC (Listening Comprehension) — Questions 1 to 10]
- Questions 1~4 (Part 2 — Question-Response, 4 questions):
  * "section": "LC", "part": "Part 2", "passageId": "", "typeBadge": "LC Part 2 - 질의응답"
  * Put the spoken question/statement in "spokenPrompt" (incorporating a learned target word naturally).
  * Set "questionText" to "음성을 듣고 가장 적절한 응답을 고르세요."
  * Provide EXACTLY 3 realistic spoken options in "options" (A, B, C) — include typical Part 2 traps (indirect answers as correct, similar-sounding word traps as wrong).
  * In "koreanTranslation", translate both the spoken question and (A)/(B)/(C) responses cleanly.

- Questions 5~7 (Part 3 — Short Conversation, 1 dialogue × 3 questions):
  * Create passage id "lc_part3" in "lcPassages" ("part": "Part 3"): a natural 5~6 turn workplace dialogue between "Man" and "Woman" (~110 words) using several learned target words AND natural TOEIC LC paraphrasing!
  * Questions 5, 6, 7 ("section": "LC", "part": "Part 3", "passageId": "lc_part3", "typeBadge": "LC Part 3 - 짧은 대화") each have 4 options (A~D), testing topic/purpose, specific detail with paraphrasing, and next action.

- Questions 8~10 (Part 4 — Short Talk/Announcement, 1 monologue × 3 questions):
  * Create passage id "lc_part4" in "lcPassages" ("part": "Part 4"): a natural voicemail, meeting announcement, or broadcast (~100 words) spoken by "Narrator" using several learned target words and LC paraphrases.
  * Questions 8, 9, 10 ("section": "LC", "part": "Part 4", "passageId": "lc_part4", "typeBadge": "LC Part 4 - 담화/공지") each have 4 options (A~D).

[SECTION 2: RC (Reading Comprehension) — Questions 11 to 20]
- Questions 11~15 (Part 5 — Incomplete Sentences, 5 questions):
  * "section": "RC", "part": "Part 5", "passageId": ""
  * Mix Word Family (품사 변형 함정, badge "RC Part 5 - 품사 변형") and Confusable Synonyms/Collocation (유의어 어휘, badge "RC Part 5 - 유의어 어휘") using business sentences with ______.

- Questions 16~17 (Part 6 — Text Completion, 1 passage × 2 questions):
  * Create passage id "rc_part6" in "rcPassages" ("part": "Part 6"): a cohesive ~120-word business email or memo containing exact placeholders [ 16 ] and [ 17 ] in "englishText".
  * Question 16 ("typeBadge": "RC Part 6 - 문맥 어휘") tests vocabulary/connector for [ 16 ]; Question 17 ("typeBadge": "RC Part 6 - 문장 삽입") tests sentence insertion for [ 17 ] (4 full-sentence options).

- Questions 18~20 (Part 7 — Reading Comprehension, 1 passage × 3 questions):
  * Create passage id "rc_part7" in "rcPassages" ("part": "Part 7"): a ~150-word TOEIC notice, press release, or business email incorporating learned target words.
  * Question 18 ("typeBadge": "RC Part 7 - 문맥상 동의어"): "In the passage, the word \"...\" in paragraph X is closest in meaning to:"
  * Question 19 ("typeBadge": "RC Part 7 - 세부 내용 추론"): factual or inference question ("What is indicated about ~?").
  * Question 20 ("typeBadge": "RC Part 7 - 불일치/목적"): "Which of the following is NOT mentioned ~?" or "Why was this document issued?".

CRITICAL RULES:
- For EVERY question 1~20, set "targetWord" to an exact word from LEARNED TARGET WORDS so wrong answers map directly to the learner's vocabulary review list.
- Never use [[...|...]] brackets anywhere in the mock exam output.
- Keep "paraphrasePoint" crisp and actionable (e.g., "지문 'subsequent' ↔ 보기 'following' 패러프레이징").`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a senior ETS-style TOEIC LC & RC test writer creating a 20-question mini mock exam tailored to Korean learners. Return strict JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: MOCK_EXAM_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('모의고사 생성 응답이 비어 있습니다.');
      }

      const parsed = JSON.parse(rawText) as {
        lcPassages?: MockExamLcPassage[];
        rcPassages?: MockExamRcPassage[];
        questions?: MockExamQuestion[];
      };

      const lcPassages: MockExamLcPassage[] = (parsed.lcPassages ?? []).map((p, idx) => ({
        id: p.id || (idx === 0 ? 'lc_part3' : 'lc_part4'),
        part: p.part === 'Part 4' ? 'Part 4' : 'Part 3',
        titleKo: p.titleKo || (idx === 0 ? 'Part 3 대화' : 'Part 4 담화'),
        contextLabel: p.contextLabel || '',
        turns: Array.isArray(p.turns)
          ? p.turns.map((t) => ({
              speaker:
                t.speaker === 'Man' || t.speaker === 'Woman' ? t.speaker : 'Narrator',
              line: String(t.line ?? '').trim(),
            }))
          : [],
        koreanTranslation: String(p.koreanTranslation ?? '').trim(),
      }));

      const rcPassages: MockExamRcPassage[] = (parsed.rcPassages ?? []).map((p, idx) => ({
        id: p.id || (idx === 0 ? 'rc_part6' : 'rc_part7'),
        part: p.part === 'Part 7' ? 'Part 7' : 'Part 6',
        docTypeLabel: p.docTypeLabel || (idx === 0 ? '비즈니스 문서' : '안내문'),
        docTitle: String(p.docTitle ?? '').trim(),
        englishText: String(p.englishText ?? '').trim(),
        koreanTranslation: String(p.koreanTranslation ?? '').trim(),
      }));

      const questions: MockExamQuestion[] = (parsed.questions ?? [])
        .slice(0, 20)
        .map((q, idx) => {
          const numId = idx + 1;
          const isPart2 = q.part === 'Part 2' || numId <= 4;
          const maxOpts = isPart2 ? 3 : 4;
          const options = Array.isArray(q.options)
            ? q.options.slice(0, maxOpts).map((o) => String(o).trim())
            : [];
          const correctIndex =
            typeof q.correctIndex === 'number' &&
            q.correctIndex >= 0 &&
            q.correctIndex < options.length
              ? q.correctIndex
              : 0;
          const rawTarget = String(q.targetWord ?? '').trim();
          const canonicalTarget =
            inputByLower.get(normalizeWord(rawTarget)) ??
            rawTarget ??
            cleanWords[idx % cleanWords.length];

          return {
            id: numId,
            section: numId <= 10 || q.section === 'LC' ? 'LC' : 'RC',
            part: q.part || (numId <= 4 ? 'Part 2' : numId <= 7 ? 'Part 3' : numId <= 10 ? 'Part 4' : numId <= 15 ? 'Part 5' : numId <= 17 ? 'Part 6' : 'Part 7'),
            typeBadge: String(q.typeBadge ?? '').trim() || `${q.part}`,
            passageId: String(q.passageId ?? '').trim() || undefined,
            targetWord: canonicalTarget || cleanWords[0],
            spokenPrompt: typeof q.spokenPrompt === 'string' ? q.spokenPrompt.trim() : '',
            questionText: String(q.questionText ?? '').trim(),
            options,
            correctIndex,
            koreanTranslation: String(q.koreanTranslation ?? '').trim(),
            koreanExplanation: String(q.koreanExplanation ?? '').trim(),
            paraphrasePoint: String(q.paraphrasePoint ?? '').trim(),
          };
        });

      const examPayload: MockExamData = {
        generatedAt: new Date().toISOString(),
        sourceWords: cleanWords,
        lcPassages,
        rcPassages,
        questions,
      };

      res.json(examPayload);
    } catch (error) {
      console.error('Error generating mock exam:', error);
      const message =
        error instanceof Error ? error.message : '실전 모의고사 생성 중 오류가 발생했습니다.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`VocaStory Studio server running on http://0.0.0.0:${port}`);
  });
}

startServer();
