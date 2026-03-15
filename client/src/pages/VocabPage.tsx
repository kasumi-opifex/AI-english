/* 
 * DESIGN: AIコックピット — テック・フューチャリスト
 * 単語帳ページ：フラッシュカード・一覧・追加・フィルタリング機能
 * ディープネイビー基調、ライムグリーンアクセント
 */
import { useState, useMemo } from "react";
import { 
  BookOpen, Plus, Trash2, CheckCircle2, RotateCcw, 
  Search, ChevronLeft, ChevronRight, X, Download
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { useApp, VocabWord } from "@/contexts/AppContext";
import { toast } from "sonner";

// ============================================================
// Flashcard Component
// ============================================================
function FlashCard({ word, onMastered, onNext, onPrev, current, total, direction }: {
  word: VocabWord;
  onMastered: () => void;
  onNext: () => void;
  onPrev: () => void;
  current: number;
  total: number;
  direction: "en-ja" | "ja-en";
}) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => setFlipped(!flipped);

  // directionに応じて表面・裏面の内容を切り替え
  const frontLabel = direction === "en-ja" ? "ENGLISH" : "JAPANESE";
  const frontContent = direction === "en-ja" ? word.english : word.japanese;
  const frontHint = direction === "en-ja" ? "タップして日本語を確認" : "タップして英語を確認";
  const backLabel = direction === "en-ja" ? "JAPANESE" : "ENGLISH";
  const backContent = direction === "en-ja" ? word.japanese : word.english;
  const frontBorder = direction === "en-ja" ? "border-glow-lime" : "border-glow-cyan";
  const backBorder = direction === "en-ja" ? "border-glow-cyan" : "border-glow-lime";
  const backTextClass = direction === "en-ja" ? "text-primary glow-text-cyan" : "text-accent";

  return (
    <div className="flex flex-col items-center">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-4 w-full max-w-md">
        <button onClick={onPrev} disabled={current === 0} className="p-2 rounded hover:bg-secondary/50 transition-all disabled:opacity-30">
          <ChevronLeft size={18} className="text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span className="font-mono">{current + 1} / {total}</span>
            <span className={word.mastered ? "text-accent" : "text-muted-foreground"}>
              {word.mastered ? "✓ マスター済み" : "未マスター"}
            </span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
              style={{ width: `${((current + 1) / total) * 100}%` }}
            />
          </div>
        </div>
        <button onClick={onNext} disabled={current === total - 1} className="p-2 rounded hover:bg-secondary/50 transition-all disabled:opacity-30">
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Card */}
      <div 
        className="w-full max-w-md cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={handleFlip}
      >
        <div 
          className="relative transition-all duration-500"
          style={{ 
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "220px"
          }}
        >
          {/* Front */}
          <div 
            className={`absolute inset-0 glass-panel rounded-2xl border ${frontBorder} p-8 flex flex-col items-center justify-center`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-xs text-muted-foreground font-mono mb-4">{frontLabel}</div>
            <div className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {frontContent}
            </div>
            <div className="text-xs text-muted-foreground mt-4">{frontHint}</div>
            {word.topic && (
              <div className="mt-4 text-xs bg-secondary/50 text-muted-foreground px-3 py-1 rounded-full">
                {word.topic}
              </div>
            )}
          </div>

          {/* Back */}
          <div 
            className={`absolute inset-0 glass-panel rounded-2xl border ${backBorder} p-8 flex flex-col items-center justify-center`}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-xs text-muted-foreground font-mono mb-4">{backLabel}</div>
            <div className={`text-2xl sm:text-3xl font-bold text-center mb-3 ${backTextClass}`}>
              {backContent}
            </div>
            {/* 英語が表面の場合は裏面に日本語、日本語が表面の場合は裏面に英語+例文 */}
            {direction === "ja-en" && word.example && (
              <div className="mt-4 text-center">
                <div className="text-xs text-muted-foreground mb-2">例文</div>
                <p className="text-xs text-foreground/80 leading-relaxed italic font-mono">{word.example}</p>
              </div>
            )}
            {direction === "en-ja" && word.example && (
              <div className="mt-4 text-center">
                <div className="text-xs text-muted-foreground mb-2">例文</div>
                <p className="text-xs text-foreground/80 leading-relaxed italic font-mono">{word.example}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => { setFlipped(false); onPrev(); }}
          disabled={current === 0}
          className="flex items-center gap-2 bg-secondary border border-border text-foreground px-4 py-2 rounded text-sm font-semibold hover:bg-secondary/80 transition-all disabled:opacity-30"
        >
          <ChevronLeft size={14} /> 前へ
        </button>
        <button
          onClick={onMastered}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all ${
            word.mastered 
              ? "bg-secondary border border-border text-muted-foreground hover:bg-secondary/80"
              : "bg-accent text-accent-foreground glow-lime hover:opacity-90"
          }`}
        >
          <CheckCircle2 size={14} />
          {word.mastered ? "マスター取消" : "マスターした！"}
        </button>
        <button
          onClick={() => { setFlipped(false); onNext(); }}
          disabled={current === total - 1}
          className="flex items-center gap-2 bg-secondary border border-border text-foreground px-4 py-2 rounded text-sm font-semibold hover:bg-secondary/80 transition-all disabled:opacity-30"
        >
          次へ <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Add Word Form
// ============================================================
function AddWordForm({ onClose, defaultTopic }: { onClose: () => void; defaultTopic: string }) {
  const { addVocabWord } = useApp();
  const [english, setEnglish] = useState("");
  const [japanese, setJapanese] = useState("");
  const [example, setExample] = useState("");
  const [topic, setTopic] = useState(defaultTopic || "");

  const handleAdd = () => {
    if (!english.trim() || !japanese.trim()) {
      toast.error("英語と日本語は必須です");
      return;
    }
    addVocabWord({ english: english.trim(), japanese: japanese.trim(), example: example.trim(), topic: topic.trim() || "一般" });
    toast.success(`「${english}」を追加しました`);
    setEnglish(""); setJapanese(""); setExample("");
  };

  return (
    <div className="glass-panel rounded-xl border border-accent/30 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Plus size={16} className="inline mr-2 text-accent" />
          単語を追加
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">英語 *</label>
          <input value={english} onChange={e => setEnglish(e.target.value)} placeholder="例: enthusiastic" className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">日本語 *</label>
          <input value={japanese} onChange={e => setJapanese(e.target.value)} placeholder="例: 熱狂的な" className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">例文（任意）</label>
          <input value={example} onChange={e => setExample(e.target.value)} placeholder="例: She is enthusiastic about..." className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">トピック</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="例: コーヒー" className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
        </div>
      </div>
      <button onClick={handleAdd} className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-all glow-lime">
        <Plus size={14} /> 追加する
      </button>
    </div>
  );
}

// ============================================================
// Main Vocab Page
// ============================================================
function VocabPageContent() {
  const { vocabWords, removeVocabWord, toggleMastered, progress } = useApp();
  const [view, setView] = useState<"list" | "flashcard">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTopic, setFilterTopic] = useState("all");
  const [filterMastered, setFilterMastered] = useState<"all" | "mastered" | "unmastered">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashDirection, setFlashDirection] = useState<"en-ja" | "ja-en">("en-ja");

  const topics = useMemo(() => {
    const topicSet = new Set(vocabWords.map(w => w.topic).filter(Boolean));
    return ["all", ...Array.from(topicSet)];
  }, [vocabWords]);

  const filteredWords = useMemo(() => {
    return vocabWords.filter(w => {
      const matchSearch = !searchQuery || 
        w.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.japanese.includes(searchQuery) ||
        w.example.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTopic = filterTopic === "all" || w.topic === filterTopic;
      const matchMastered = filterMastered === "all" || 
        (filterMastered === "mastered" && w.mastered) ||
        (filterMastered === "unmastered" && !w.mastered);
      return matchSearch && matchTopic && matchMastered;
    });
  }, [vocabWords, searchQuery, filterTopic, filterMastered]);

  const masteredCount = vocabWords.filter(w => w.mastered).length;

  const handleExportCSV = () => {
    const header = "英語,日本語,例文,トピック,マスター済み,復習回数\n";
    const rows = vocabWords.map(w => 
      `"${w.english}","${w.japanese}","${w.example}","${w.topic}","${w.mastered ? "はい" : "いいえ"}","${w.reviewCount}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vocab_list.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSVをダウンロードしました");
  };

  const handleMastered = (id: string) => {
    toggleMastered(id);
    const word = filteredWords[flashcardIndex];
    if (word && word.id === id) {
      toast.success(word.mastered ? "マスター取消" : "マスターしました！");
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <NavBar />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-border bg-accent/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-muted-foreground font-mono mb-2">VOCABULARY BOOK</div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  単語帳
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {vocabWords.length}語登録 · {masteredCount}語マスター済み
                </p>
              </div>
              <div className="flex items-center gap-2">
                {vocabWords.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-secondary border border-border text-foreground px-3 py-2 rounded text-sm hover:bg-secondary/80 transition-all"
                  >
                    <Download size={14} /> CSV出力
                  </button>
                )}
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-all glow-lime"
                >
                  <Plus size={14} /> 単語を追加
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            {vocabWords.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>マスター進捗</span>
                  <span className="text-accent font-bold">{masteredCount}/{vocabWords.length}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                    style={{ width: vocabWords.length > 0 ? `${(masteredCount / vocabWords.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6">
              <AddWordForm onClose={() => setShowAddForm(false)} defaultTopic={progress.currentTopic} />
            </div>
          )}

          {vocabWords.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={40} className="text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>単語がまだありません</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Step 2でGeminiに語彙リストを作らせ、ここに登録しましょう。
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded font-semibold text-sm hover:opacity-90 transition-all glow-lime mx-auto"
              >
                <Plus size={16} /> 最初の単語を追加する
              </button>
            </div>
          ) : (
            <>
              {/* View Toggle + Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* View Toggle */}
                <div className="flex bg-secondary/50 rounded-lg p-1 border border-border">
                  <button
                    onClick={() => setView("list")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    一覧表示
                  </button>
                  <button
                    onClick={() => { setView("flashcard"); setFlashcardIndex(0); }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      view === "flashcard" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    フラッシュカード
                  </button>
                </div>

                {/* Search */}
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="単語を検索..."
                    className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={filterTopic}
                    onChange={e => setFilterTopic(e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    {topics.map(t => (
                      <option key={t} value={t}>{t === "all" ? "全トピック" : t}</option>
                    ))}
                  </select>
                  <select
                    value={filterMastered}
                    onChange={e => setFilterMastered(e.target.value as typeof filterMastered)}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="all">全て</option>
                    <option value="unmastered">未マスター</option>
                    <option value="mastered">マスター済み</option>
                  </select>
                </div>
              </div>

              {/* Flashcard View */}
              {view === "flashcard" && filteredWords.length > 0 && (
                <div className="py-4">
                  {/* 方向切り替えボタン */}
                  <div className="flex justify-center mb-5">
                    <div className="flex bg-secondary/50 rounded-lg p-1 border border-border gap-1">
                      <button
                        onClick={() => { setFlashDirection("en-ja"); setFlashcardIndex(0); }}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-medium transition-all ${
                          flashDirection === "en-ja"
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        英語 → 日本語
                      </button>
                      <button
                        onClick={() => { setFlashDirection("ja-en"); setFlashcardIndex(0); }}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-medium transition-all ${
                          flashDirection === "ja-en"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        日本語 → 英語
                      </button>
                    </div>
                  </div>
                  <FlashCard
                    word={filteredWords[flashcardIndex]}
                    onMastered={() => handleMastered(filteredWords[flashcardIndex].id)}
                    onNext={() => setFlashcardIndex(i => Math.min(i + 1, filteredWords.length - 1))}
                    onPrev={() => setFlashcardIndex(i => Math.max(i - 1, 0))}
                    current={flashcardIndex}
                    total={filteredWords.length}
                    direction={flashDirection}
                  />
                </div>
              )}

              {/* List View */}
              {view === "list" && (
                <div className="space-y-2">
                  {filteredWords.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      検索結果がありません
                    </div>
                  ) : (
                    filteredWords.map((word) => (
                      <WordListItem 
                        key={word.id} 
                        word={word} 
                        onToggleMastered={() => toggleMastered(word.id)}
                        onRemove={() => {
                          removeVocabWord(word.id);
                          toast.success(`「${word.english}」を削除しました`);
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Word List Item
// ============================================================
function WordListItem({ word, onToggleMastered, onRemove }: {
  word: VocabWord;
  onToggleMastered: () => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`glass-panel rounded-xl border transition-all ${
      word.mastered ? "border-accent/30 bg-accent/5" : "border-border hover:border-border/80"
    }`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onToggleMastered}
          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            word.mastered 
              ? "bg-accent text-accent-foreground glow-lime" 
              : "bg-secondary border border-border text-muted-foreground hover:border-accent/40"
          }`}
        >
          <CheckCircle2 size={14} />
        </button>

        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <div className="font-bold text-sm text-foreground truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {word.english}
            </div>
          </div>
          <div>
            <div className="text-sm text-primary truncate">{word.japanese}</div>
          </div>
          {word.topic && (
            <div className="hidden sm:block">
              <span className="text-xs bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-full">{word.topic}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {word.example && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
            >
              <RotateCcw size={13} />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && word.example && (
        <div className="px-4 pb-3 pt-0 border-t border-border/50">
          <p className="text-xs text-muted-foreground italic font-mono leading-relaxed">{word.example}</p>
        </div>
      )}
    </div>
  );
}

export default function VocabPage() {
  return <VocabPageContent />;
}
