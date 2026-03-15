import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  startDate: string; // ISO date string
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
  lastActivityDate: string; // YYYY-MM-DD
  totalDays: number;
  activityDates: string[]; // YYYY-MM-DD list
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
  // Weekly theme
  weeklyTheme: WeeklyTheme;
  updateWeeklyTheme: (updates: Partial<WeeklyTheme>) => void;
  // API settings
  apiSettings: ApiSettings;
  updateApiSettings: (updates: Partial<ApiSettings>) => void;
  // Streak
  streak: StreakData;
  recordActivity: () => void;
}

const defaultProgress: LearningProgress = {
  step1Completed: false,
  step2Completed: false,
  step3Completed: false,
  step4Completed: false,
  step5Completed: false,
  step6Completed: false,
  step7Completed: false,
  step3WPM: 0,
  step5Recording: "",
  currentTopic: "",
};

const defaultWeeklyTheme: WeeklyTheme = {
  theme: "",
  startDate: new Date().toISOString().split("T")[0],
  memo: "",
};

const defaultApiSettings: ApiSettings = {
  geminiApiKey: "",
  chatgptApiKey: "",
  preferredAI: "gemini",
};

const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: "",
  totalDays: 0,
  activityDates: [],
};

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function calcStreak(activityDates: string[]): { currentStreak: number; longestStreak: number } {
  if (activityDates.length === 0) return { currentStreak: 0, longestStreak: 0 };
  const sorted = Array.from(new Set(activityDates)).sort().reverse();
  const today = getTodayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let currentStreak = 0;
  let checkDate = sorted[0] === today || sorted[0] === yesterday ? sorted[0] : null;
  if (!checkDate) return { currentStreak: 0, longestStreak: calcLongest(sorted) };

  for (const d of sorted) {
    if (d === checkDate) {
      currentStreak++;
      const prevDate: string = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split("T")[0];
      checkDate = prevDate;
    } else {
      break;
    }
  }
  return { currentStreak, longestStreak: Math.max(currentStreak, calcLongest(sorted)) };
}

function calcLongest(sortedDesc: string[]): number {
  if (sortedDesc.length === 0) return 0;
  let longest = 1, cur = 1;
  for (let i = 1; i < sortedDesc.length; i++) {
    const prev = new Date(sortedDesc[i - 1]).getTime();
    const curr = new Date(sortedDesc[i]).getTime();
    if (prev - curr === 86400000) {
      cur++;
      longest = Math.max(longest, cur);
    } else {
      cur = 1;
    }
  }
  return longest;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [vocabWords, setVocabWords] = useState<VocabWord[]>(() => {
    try {
      const stored = localStorage.getItem("vocab_words");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [progress, setProgress] = useState<LearningProgress>(() => {
    try {
      const stored = localStorage.getItem("learning_progress");
      return stored ? { ...defaultProgress, ...JSON.parse(stored) } : defaultProgress;
    } catch { return defaultProgress; }
  });

  const [weeklyTheme, setWeeklyTheme] = useState<WeeklyTheme>(() => {
    try {
      const stored = localStorage.getItem("weekly_theme");
      return stored ? { ...defaultWeeklyTheme, ...JSON.parse(stored) } : defaultWeeklyTheme;
    } catch { return defaultWeeklyTheme; }
  });

  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => {
    try {
      const stored = localStorage.getItem("api_settings");
      return stored ? { ...defaultApiSettings, ...JSON.parse(stored) } : defaultApiSettings;
    } catch { return defaultApiSettings; }
  });

  const [streak, setStreak] = useState<StreakData>(() => {
    try {
      const stored = localStorage.getItem("streak_data");
      if (stored) {
        const data = { ...defaultStreak, ...JSON.parse(stored) };
        const { currentStreak, longestStreak } = calcStreak(data.activityDates);
        return { ...data, currentStreak, longestStreak };
      }
      return defaultStreak;
    } catch { return defaultStreak; }
  });

  useEffect(() => { localStorage.setItem("vocab_words", JSON.stringify(vocabWords)); }, [vocabWords]);
  useEffect(() => { localStorage.setItem("learning_progress", JSON.stringify(progress)); }, [progress]);
  useEffect(() => { localStorage.setItem("weekly_theme", JSON.stringify(weeklyTheme)); }, [weeklyTheme]);
  useEffect(() => { localStorage.setItem("api_settings", JSON.stringify(apiSettings)); }, [apiSettings]);
  useEffect(() => { localStorage.setItem("streak_data", JSON.stringify(streak)); }, [streak]);

  const addVocabWord = useCallback((word: Omit<VocabWord, "id" | "createdAt" | "mastered" | "reviewCount">) => {
    const newWord: VocabWord = {
      ...word,
      id: `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      mastered: false,
      reviewCount: 0,
    };
    setVocabWords(prev => [newWord, ...prev]);
  }, []);

  const removeVocabWord = useCallback((id: string) => {
    setVocabWords(prev => prev.filter(w => w.id !== id));
  }, []);

  const toggleMastered = useCallback((id: string) => {
    setVocabWords(prev => prev.map(w => w.id === id ? { ...w, mastered: !w.mastered } : w));
  }, []);

  const incrementReview = useCallback((id: string) => {
    setVocabWords(prev => prev.map(w => w.id === id ? { ...w, reviewCount: w.reviewCount + 1 } : w));
  }, []);

  const updateProgress = useCallback((updates: Partial<LearningProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  }, []);

  const updateWeeklyTheme = useCallback((updates: Partial<WeeklyTheme>) => {
    setWeeklyTheme(prev => ({ ...prev, ...updates }));
  }, []);

  const updateApiSettings = useCallback((updates: Partial<ApiSettings>) => {
    setApiSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const recordActivity = useCallback(() => {
    const today = getTodayStr();
    setStreak(prev => {
      if (prev.activityDates.includes(today)) return prev;
      const newDates = [...prev.activityDates, today];
      const { currentStreak, longestStreak } = calcStreak(newDates);
      return {
        ...prev,
        activityDates: newDates,
        lastActivityDate: today,
        totalDays: newDates.length,
        currentStreak,
        longestStreak,
      };
    });
  }, []);

  const clearAllData = useCallback(() => {
    setVocabWords([]);
    setProgress(defaultProgress);
    setStreak(defaultStreak);
    localStorage.removeItem("vocab_words");
    localStorage.removeItem("learning_progress");
    localStorage.removeItem("streak_data");
  }, []);

  return (
    <AppContext.Provider value={{
      vocabWords, addVocabWord, removeVocabWord, toggleMastered, incrementReview,
      progress, updateProgress, clearAllData,
      weeklyTheme, updateWeeklyTheme,
      apiSettings, updateApiSettings,
      streak, recordActivity,
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
