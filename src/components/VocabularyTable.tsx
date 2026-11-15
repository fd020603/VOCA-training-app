import { useMemo, useState } from 'react';
import { Search, Star, Volume2 } from 'lucide-react';
import type { VocabularyEntry } from '../types/study';

interface VocabularyTableProps {
  entries: VocabularyEntry[];
  wrongWords: string[];
  onToggleStarWord: (word: string) => void;
}

function renderStressedKorean(pron: string) {
  const parts = pron.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={idx}
          className="font-bold text-amber-700 dark:text-amber-300 underline decoration-amber-500/60 underline-offset-2"
        >
          {inner}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function VocabularyTable({
  entries,
  wrongWords,
  onToggleStarWord,
}: VocabularyTableProps) {
  const [query, setQuery] = useState('');
  const [onlyStarred, setOnlyStarred] = useState(false);

  const wrongSet = useMemo(
    () => new Set(wrongWords.map((w) => w.trim().toLowerCase())),
    [wrongWords]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((item) => {
      const isStarred = wrongSet.has(item.word.trim().toLowerCase());
      if (onlyStarred && !isStarred) return false;
      if (!q) return true;
      return (
        item.word.toLowerCase().includes(q) ||
        item.matchedForm.toLowerCase().includes(q) ||
        item.coreMeaning.toLowerCase().includes(q) ||
        item.contextMeaning.toLowerCase().includes(q) ||
        (item.pronunciationStressKo ?? '').toLowerCase().includes(q) ||
        (item.lcParaphrases ?? []).some((p) => p.toLowerCase().includes(q)) ||
        (item.collocations ?? []).some((c) => c.toLowerCase().includes(q)) ||
        (item.synonymNuance ?? '').toLowerCase().includes(q)
      );
    });
  }, [entries, query, onlyStarred, wrongSet]);

  const speakWord = (word: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  return (
    <section className="rounded-xl bg-white dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            핵심 단어 요약표
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            총 <span className="font-mono-tabular font-semibold">{entries.length}개</span> 단어 · 강세·한글 발음 · 토익 LC 패러프레이징 · 짝꿍 표현(Collocation) &amp; 유의어 구분
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setOnlyStarred(false)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                !onlyStarred
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              전체 ({entries.length})
            </button>
            <button
              type="button"
              onClick={() => setOnlyStarred(true)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                onlyStarred
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              취약/오답 ({wrongWords.length})
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="단어·발음·패러프레이징 검색..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1625] text-xs font-semibold text-slate-600 dark:text-slate-400">
              <th className="py-3 pl-4 pr-2 w-10 text-center" aria-label="취약 단어 북마크">
                ⭐
              </th>
              <th className="py-3 px-2 w-10">#</th>
              <th className="py-3 px-3 min-w-[130px]">입력 단어</th>
              <th className="py-3 px-3 min-w-[105px]">지문 내 형태</th>
              <th className="py-3 px-2 w-14">품사</th>
              <th className="py-3 px-3 min-w-[205px]">발음(강세) &amp; LC 패러프레이징</th>
              <th className="py-3 px-3 min-w-[160px]">핵심 뜻 &amp; 문맥 의미</th>
              <th className="py-3 pl-3 pr-5 min-w-[250px]">
                토익 빈출 짝꿍(Collocation) &amp; 유의어 구분
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  {onlyStarred
                    ? '북마크(⭐)되거나 퀴즈에서 틀린 취약 단어가 아직 없습니다.'
                    : '검색어와 일치하는 단어가 없습니다.'}
                </td>
              </tr>
            ) : (
              filtered.map((entry, idx) => {
                const isStarred = wrongSet.has(entry.word.trim().toLowerCase());
                const collocations = entry.collocations ?? [];
                const synonymNuance = entry.synonymNuance;
                const lcParaphrases = entry.lcParaphrases ?? [];
                const pron = entry.pronunciationStressKo;

                return (
                  <tr
                    key={`${entry.word}-${idx}`}
                    className={`transition-colors ${
                      isStarred
                        ? 'bg-amber-50/45 dark:bg-amber-500/5 hover:bg-amber-50/80 dark:hover:bg-amber-500/10'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3.5 pl-4 pr-2 text-center align-top">
                      <button
                        type="button"
                        onClick={() => onToggleStarWord(entry.word)}
                        aria-label={
                          isStarred
                            ? `${entry.word} 취약 단어 북마크 해제`
                            : `${entry.word} 취약 단어 북마크 추가`
                        }
                        aria-pressed={isStarred}
                        title={isStarred ? '취약 단어 해제' : '취약 단어로 찜하기'}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 transition-colors ${
                            isStarred
                              ? 'fill-amber-400 text-amber-500 dark:text-amber-400'
                              : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-3.5 px-2 text-xs text-slate-400 dark:text-slate-500 font-mono-tabular align-top">
                      {String(idx + 1).padStart(2, '0')}
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-slate-100 align-top">
                      <div className="flex items-center gap-1.5">
                        <span>{entry.word}</span>
                        <button
                          type="button"
                          onClick={() => speakWord(entry.word)}
                          aria-label={`${entry.word} 발음 듣기`}
                          className="p-1 rounded text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 align-top">
                      <span className="font-medium text-amber-700 dark:text-amber-300">
                        {entry.matchedForm}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 text-xs font-mono-tabular text-slate-500 dark:text-slate-400 align-top">
                      {entry.partOfSpeech}
                    </td>

                    <td className="py-3.5 px-3 align-top space-y-1.5 text-xs leading-relaxed">
                      {pron && pron !== '-' ? (
                        <div className="text-slate-800 dark:text-slate-100 font-medium">
                          [{renderStressedKorean(pron)}]
                        </div>
                      ) : (
                        <div className="text-slate-400 dark:text-slate-500">-</div>
                      )}
                      {lcParaphrases.length > 0 && (
                        <div className="text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            LC ↔{' '}
                          </span>
                          <span>{lcParaphrases.join(' · ')}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 align-top space-y-1">
                      <div className="text-slate-800 dark:text-slate-100 font-medium">
                        {entry.coreMeaning}
                      </div>
                      {entry.contextMeaning && entry.contextMeaning !== entry.coreMeaning && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          문맥: {entry.contextMeaning}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 pl-3 pr-5 align-top space-y-1.5 text-xs leading-relaxed">
                      {collocations.length > 0 ? (
                        <div className="space-y-0.5">
                          {collocations.map((col, cIdx) => (
                            <div
                              key={cIdx}
                              className="text-slate-800 dark:text-slate-200 font-medium"
                            >
                              · {col}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-400 dark:text-slate-500">-</div>
                      )}

                      {synonymNuance && synonymNuance !== '-' && (
                        <div className="pt-1 text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-sky-700 dark:text-sky-400">
                            유의어 구분:{' '}
                          </span>
                          <span>{synonymNuance}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
