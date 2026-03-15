/*
 * DESIGN: AIコックピット — テック・フューチャリスト
 * 設定ページ：APIキー入力・週間テーマ設定・データ管理
 */
import { useState } from "react";
import { Eye, EyeOff, Save, Key, Calendar, Trash2, CheckCircle2, AlertCircle, ExternalLink, Bot } from "lucide-react";
import NavBar from "@/components/NavBar";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl border border-border p-6">
      <h2 className="flex items-center gap-2 text-base font-bold mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { apiSettings, updateApiSettings, weeklyTheme, updateWeeklyTheme, clearAllData, streak } = useApp();

  const [geminiKey, setGeminiKey] = useState(apiSettings.geminiApiKey);
  const [chatgptKey, setChatgptKey] = useState(apiSettings.chatgptApiKey);
  const [showGemini, setShowGemini] = useState(false);
  const [showChatgpt, setShowChatgpt] = useState(false);
  const [preferredAI, setPreferredAI] = useState(apiSettings.preferredAI);
  const [theme, setTheme] = useState(weeklyTheme.theme);
  const [themeMemo, setThemeMemo] = useState(weeklyTheme.memo);
  const [themeStart, setThemeStart] = useState(weeklyTheme.startDate);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSaveApi = () => {
    updateApiSettings({ geminiApiKey: geminiKey.trim(), chatgptApiKey: chatgptKey.trim(), preferredAI });
    toast.success("APIキーを保存しました");
  };

  const handleSaveTheme = () => {
    updateWeeklyTheme({ theme: theme.trim(), memo: themeMemo.trim(), startDate: themeStart });
    toast.success("週間テーマを保存しました");
  };

  const handleClearData = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearAllData();
    setConfirmClear(false);
    toast.success("全データをリセットしました");
  };

  const maskKey = (key: string) => key ? key.slice(0, 6) + "••••••••••••" + key.slice(-4) : "";

  return (
    <div className="min-h-screen bg-background grid-bg">
      <NavBar />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-border bg-primary/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="text-xs text-muted-foreground font-mono mb-2">SETTINGS</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              設定
            </h1>
            <p className="text-muted-foreground text-sm mt-1">APIキー・週間テーマ・データ管理</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* ── API Keys ── */}
          <SectionCard title="AI APIキー設定" icon={<Key size={18} />}>
            <div className="bg-secondary/30 border border-border rounded-lg px-4 py-3 mb-5 text-xs text-muted-foreground leading-relaxed">
              <AlertCircle size={13} className="inline mr-1.5 text-yellow-400" />
              APIキーはお使いのブラウザのローカルストレージにのみ保存されます。外部サーバーには送信されません。
            </div>

            {/* Preferred AI */}
            <div className="mb-5">
              <label className="text-xs text-muted-foreground mb-2 block">デフォルトで使用するAI</label>
              <div className="flex gap-3">
                {(["gemini", "chatgpt"] as const).map(ai => (
                  <button
                    key={ai}
                    onClick={() => setPreferredAI(ai)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      preferredAI === ai
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/30 text-muted-foreground hover:border-border/80"
                    }`}
                  >
                    <Bot size={14} />
                    {ai === "gemini" ? "Gemini" : "ChatGPT"}
                    {preferredAI === ai && <CheckCircle2 size={13} className="text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Gemini Key */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-muted-foreground">Gemini APIキー</label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Google AI Studioで取得 <ExternalLink size={11} />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showGemini ? "text" : "password"}
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
                />
                <button
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showGemini ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {apiSettings.geminiApiKey && (
                <p className="text-xs text-accent mt-1 font-mono">
                  <CheckCircle2 size={11} className="inline mr-1" />
                  保存済み: {maskKey(apiSettings.geminiApiKey)}
                </p>
              )}
            </div>

            {/* ChatGPT Key */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-muted-foreground">ChatGPT (OpenAI) APIキー</label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  OpenAIで取得 <ExternalLink size={11} />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showChatgpt ? "text" : "password"}
                  value={chatgptKey}
                  onChange={e => setChatgptKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
                />
                <button
                  onClick={() => setShowChatgpt(!showChatgpt)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showChatgpt ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {apiSettings.chatgptApiKey && (
                <p className="text-xs text-accent mt-1 font-mono">
                  <CheckCircle2 size={11} className="inline mr-1" />
                  保存済み: {maskKey(apiSettings.chatgptApiKey)}
                </p>
              )}
            </div>

            <button
              onClick={handleSaveApi}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
            >
              <Save size={14} /> APIキーを保存
            </button>
          </SectionCard>

          {/* ── Weekly Theme ── */}
          <SectionCard title="週間テーマ設定" icon={<Calendar size={18} />}>
            <p className="text-xs text-muted-foreground mb-4">
              今週学習するトピックを設定します。Step 1〜7を通じてこのテーマで学習を進めましょう。
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">今週のテーマ *</label>
                <input
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  placeholder="例：コーヒー、旅行、映画..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">開始日</label>
                <input
                  type="date"
                  value={themeStart}
                  onChange={e => setThemeStart(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="text-xs text-muted-foreground mb-1.5 block">メモ（任意）</label>
              <textarea
                value={themeMemo}
                onChange={e => setThemeMemo(e.target.value)}
                placeholder="このテーマを選んだ理由や学習目標など..."
                rows={2}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
              />
            </div>
            <button
              onClick={handleSaveTheme}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all glow-lime"
            >
              <Save size={14} /> テーマを保存
            </button>
          </SectionCard>

          {/* ── Stats ── */}
          <SectionCard title="学習統計" icon={<CheckCircle2 size={18} />}>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "継続日数", value: streak.currentStreak, unit: "日" },
                { label: "最長記録", value: streak.longestStreak, unit: "日" },
                { label: "累計学習日", value: streak.totalDays, unit: "日" },
              ].map(s => (
                <div key={s.label} className="bg-secondary/30 rounded-xl p-4 text-center border border-border">
                  <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {s.value}
                    <span className="text-sm text-muted-foreground ml-1">{s.unit}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Danger Zone ── */}
          <SectionCard title="データ管理" icon={<Trash2 size={18} />}>
            <p className="text-xs text-muted-foreground mb-4">
              学習進捗・単語帳・継続日数を全てリセットします。この操作は取り消せません。
            </p>
            <button
              onClick={handleClearData}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                confirmClear
                  ? "bg-destructive text-destructive-foreground border-destructive"
                  : "bg-transparent border-destructive/50 text-destructive hover:bg-destructive/10"
              }`}
            >
              <Trash2 size={14} />
              {confirmClear ? "本当にリセットする（もう一度クリック）" : "全データをリセット"}
            </button>
            {confirmClear && (
              <button onClick={() => setConfirmClear(false)} className="ml-3 text-xs text-muted-foreground hover:text-foreground mt-2">
                キャンセル
              </button>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
