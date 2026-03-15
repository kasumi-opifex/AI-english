/*
 * AppContext: データ管理
 * - Firebase未設定/未ログイン → localStorage（従来通り）
 * - Firebaseログイン済み → Realtime DB に自動同期
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useFirebase } from "./FirebaseContext";

export interface VocabWord {
  id: string;
  english: string;
  japanese: string;
  example: string;
  topic: string;
  createdAt: string;
  mastered: boolean;
  reviewCount: number;
}

export interface LearningProgress {
  step1Completed: boolean;
  step2Completed: boolean;
  step3Completed: boolean;
  step4Completed: boolean;
  step5Completed: boolean;
  step6Completed: boolean;
  step7Completed: boolean;
  step3WPM: number;
  step5Recording: string;
  currentTopic: string;
}

export interface WeeklyTheme {
  theme: string;
  startDate: string;
  memo: string;
}

export interface ApiSettings {
  geminiApiKey: string;
  chatgptApiKey: string;
  preferredAI: "gemini" | "chatgpt";
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalDays: number;
  activityDates: string[];
}

interface AppContextType {
  vocabWords: VocabWord[];
  addVocabWord: (word: Omit<VocabWord, "id" | "createdAt" | "mastered" | "reviewCount">) => void;
  removeVocabWord: (id: string) => void;
  toggleMastered: (id: string) => void;
  incrementReview: (id: string) => void;
  progress: LearningProgress;
  updateProgress: (updates: Partial<LearningProgress>) => void;
  clearAllData: () => void;
  weeklyTheme: WeeklyTheme;
  updateWeeklyTheme: (updates: Partial<WeeklyTheme>) => void;
  apiSettings: ApiSettings;
  updateApiSettings: (updates: Partial<ApiSettings>) => void;
  streak: StreakData;
  recordActivity: () => void;
  isSyncing: boolean;
}

// ── Defaults ─────────────────────────────────────────────────
const defaultProgress: LearningProgress = {
  step1Completed: false, step2Completed: false, step3Completed: false,
  step4Completed: false, step5Completed: false, step6Completed: false,
  step7Completed: false, step3WPM: 0, step5Recording: "", currentTopic: "",
};
const defaultWeeklyTheme: WeeklyTheme = {
  theme: "", startDate: new Date().toISOString().split("T")[0], memo: "",
};
const defaultApiSettings: ApiSettings = {
  geminiApiKey: "", chatgptApiKey: "", preferredAI: "gemini",
};
const defaultStreak: StreakData = {
  currentStreak: 0, longestStreak: 0, lastActivityDate: "",
  totalDays: 0, activityDates: [],
};

// ── Streak helpers ────────────────────────────────────────────
function getTodayStr() { return new Date().toISOString().split("T")[0]; }

function calcLongest(sortedDesc: string[]): number {
  if (sortedDesc.length === 0) return 0;
  let longest = 1, cur = 1;
  for (let i = 1; i < sortedDesc.length; i++) {
    const prev = new Date(sortedDesc[i - 1]).getTime();
    const curr = new Date(sortedDesc[i]).getTime();
    if (prev - curr === 86400000) { cur++; longest = Math.max(longest, cur); }
    else { cur = 1; }
  }
  return longest;
}

function calcStreak(activityDates: string[]): { currentStreak: number; longestStreak: number } {
  if (activityDates.length === 0) return { currentStreak: 0, longestStreak: 0 };
  const sorted = Array.from(new Set(activityDates)).sort().reverse();
  const today = getTodayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  let currentStreak = 0;
  let checkDate: string | null = (sorted[0] === today || sorted[0] === yesterday) ? sorted[0] : null;
  if (!checkDate) return { currentStreak: 0, longestStreak: calcLongest(sorted) };
  for (const d of sorted) {
    if (d === checkDate) {
      currentStreak++;
      checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split("T")[0];
    } else break;
  }
  return { currentStreak, longestStreak: Math.max(currentStreak, calcLongest(sorted)) };
}

// ── localStorage helpers ──────────────────────────────────────
function lsGet<T>(key: string, def: T): T {
  try { const s = localStorage.getItem(key); return s ? { ...def, ...(JSON.parse(s) as T) } : def; }
  catch { return def; }
}
function lsGetArr<T>(key: string): T[] {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) as T[] : []; }
  catch { return []; }
}

// ── Context ───────────────────────────────────────────────────
const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, dbWrite, dbListen, isConfigured } = useFirebase();
  const isLoggedIn = isConfigured && !!user;

  // Local state (always used as working state)
  const [vocabWords, setVocabWords] = useState<VocabWord[]>(() => lsGetArr("vocab_words"));
  const [progress, setProgress] = useState<LearningProgress>(() => lsGet("learning_progress", defaultProgress));
  const [weeklyTheme, setWeeklyTheme] = useState<WeeklyTheme>(() => lsGet("weekly_theme", defaultWeeklyTheme));
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => lsGet("api_settings", defaultApiSettings));
  const [streak, setStreak] = useState<StreakData>(() => {
    const s = lsGet("streak_data", defaultStreak);
    const { currentStreak, longestStreak } = calcStreak(s.activityDates);
    return { ...s, currentStreak, longestStreak };
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const dbListenersRef = useRef<Array<() => void>>([]);

  // ── Firebase → local state (リスナー) ─────────────────────
  useEffect(() => {
    // 前のリスナーを解除
    dbListenersRef.current.forEach(u => u());
    dbListenersRef.current = [];

    if (!isLoggedIn) return;

    setIsSyncing(true);

    const unsubs = [
      dbListen("vocab_words", (data) => {
        if (data && typeof data === "object") {
          const words = Object.values(data as Record<string, VocabWord>);
          setVocabWords(words);
          localStorage.setItem("vocab_words", JSON.stringify(words));
        } else {
          setVocabWords([]);
        }
        setIsSyncing(false);
      }),
      dbListen("progress", (data) => {
        if (data) {
          const p = { ...defaultProgress, ...(data as Partial<LearningProgress>) };
          setProgress(p);
          localStorage.setItem("learning_progress", JSON.stringify(p));
        }
      }),
      dbListen("weekly_theme", (data) => {
        if (data) {
          const t = { ...defaultWeeklyTheme, ...(data as Partial<WeeklyTheme>) };
          setWeeklyTheme(t);
          localStorage.setItem("weekly_theme", JSON.stringify(t));
        }
      }),
      dbListen("streak", (data) => {
        if (data) {
          const s = { ...defaultStreak, ...(data as Partial<StreakData>) };
          const { currentStreak, longestStreak } = calcStreak(s.activityDates || []);
          const updated = { ...s, currentStreak, longestStreak };
          setStreak(updated);
          localStorage.setItem("streak_data", JSON.stringify(updated));
        }
      }),
    ];

    dbListenersRef.current = unsubs;
    return () => {
      unsubs.forEach(u => u());
      dbListenersRef.current = [];
    };
  }, [isLoggedIn, dbListen]);

  // ── localStorage 同期（未ログイン時） ─────────────────────
  useEffect(() => { if (!isLoggedIn) localStorage.setItem("vocab_words", JSON.stringify(vocabWords)); }, [vocabWords, isLoggedIn]);
  useEffect(() => { if (!isLoggedIn) localStorage.setItem("learning_progress", JSON.stringify(progress)); }, [progress, isLoggedIn]);
  useEffect(() => { if (!isLoggedIn) localStorage.setItem("weekly_theme", JSON.stringify(weeklyTheme)); }, [weeklyTheme, isLoggedIn]);
  useEffect(() => { if (!isLoggedIn) localStorage.setItem("api_settings", JSON.stringify(apiSettings)); }, [apiSettings, isLoggedIn]);
  useEffect(() => { if (!isLoggedIn) localStorage.setItem("streak_data", JSON.stringify(streak)); }, [streak, isLoggedIn]);

  // ── DB書き込みヘルパー ─────────────────────────────────────
  const writeVocab = useCallback(async (words: VocabWord[]) => {
    if (!isLoggedIn) return;
    const obj: Record<string, VocabWord> = {};
    words.forEach(w => { obj[w.id] = w; });
    await dbWrite("vocab_words", obj);
  }, [isLoggedIn, dbWrite]);

  // ── Actions ───────────────────────────────────────────────
  const addVocabWord = useCallback((word: Omit<VocabWord, "id" | "createdAt" | "mastered" | "reviewCount">) => {
    const newWord: VocabWord = {
      ...word,
      id: `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      mastered: false,
      reviewCount: 0,
    };
    setVocabWords(prev => {
      const updated = [newWord, ...prev];
      writeVocab(updated);
      return updated;
    });
  }, [writeVocab]);

  const removeVocabWord = useCallback((id: string) => {
    setVocabWords(prev => {
      const updated = prev.filter(w => w.id !== id);
      writeVocab(updated);
      return updated;
    });
  }, [writeVocab]);

  const toggleMastered = useCallback((id: string) => {
    setVocabWords(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, mastered: !w.mastered } : w);
      writeVocab(updated);
      return updated;
    });
  }, [writeVocab]);

  const incrementReview = useCallback((id: string) => {
    setVocabWords(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, reviewCount: w.reviewCount + 1 } : w);
      writeVocab(updated);
      return updated;
    });
  }, [writeVocab]);

  const updateProgress = useCallback((updates: Partial<LearningProgress>) => {
    setProgress(prev => {
      const updated = { ...prev, ...updates };
      if (isLoggedIn) dbWrite("progress", updated);
      return updated;
    });
  }, [isLoggedIn, dbWrite]);

  const updateWeeklyTheme = useCallback((updates: Partial<WeeklyTheme>) => {
    setWeeklyTheme(prev => {
      const updated = { ...prev, ...updates };
      if (isLoggedIn) dbWrite("weekly_theme", updated);
      return updated;
    });
  }, [isLoggedIn, dbWrite]);

  const updateApiSettings = useCallback((updates: Partial<ApiSettings>) => {
    setApiSettings(prev => {
      const updated = { ...prev, ...updates };
      // APIキーはlocalStorageのみ（セキュリティ上DBには保存しない）
      localStorage.setItem("api_settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const recordActivity = useCallback(() => {
    const today = getTodayStr();
    setStreak(prev => {
      if (prev.activityDates.includes(today)) return prev;
      const newDates = [...prev.activityDates, today];
      const { currentStreak, longestStreak } = calcStreak(newDates);
      const updated = {
        ...prev,
        activityDates: newDates,
        lastActivityDate: today,
        totalDays: newDates.length,
        currentStreak,
        longestStreak,
      };
      if (isLoggedIn) dbWrite("streak", updated);
      return updated;
    });
  }, [isLoggedIn, dbWrite]);

  const clearAllData = useCallback(() => {
    setVocabWords([]);
    setProgress(defaultProgress);
    setStreak(defaultStreak);
    localStorage.removeItem("vocab_words");
    localStorage.removeItem("learning_progress");
    localStorage.removeItem("streak_data");
    if (isLoggedIn) {
      dbWrite("vocab_words", null);
      dbWrite("progress", null);
      dbWrite("streak", null);
    }
  }, [isLoggedIn, dbWrite]);

  return (
    <AppContext.Provider value={{
      vocabWords, addVocabWord, removeVocabWord, toggleMastered, incrementReview,
      progress, updateProgress, clearAllData,
      weeklyTheme, updateWeeklyTheme,
      apiSettings, updateApiSettings,
      streak, recordActivity,
      isSyncing,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
