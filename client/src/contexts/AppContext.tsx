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

interface AppContextType {
  vocabWords: VocabWord[];
  addVocabWord: (word: Omit<VocabWord, "id" | "createdAt" | "mastered" | "reviewCount">) => void;
  removeVocabWord: (id: string) => void;
  toggleMastered: (id: string) => void;
  incrementReview: (id: string) => void;
  progress: LearningProgress;
  updateProgress: (updates: Partial<LearningProgress>) => void;
  clearAllData: () => void;
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

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [vocabWords, setVocabWords] = useState<VocabWord[]>(() => {
    try {
      const stored = localStorage.getItem("vocab_words");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [progress, setProgress] = useState<LearningProgress>(() => {
    try {
      const stored = localStorage.getItem("learning_progress");
      return stored ? { ...defaultProgress, ...JSON.parse(stored) } : defaultProgress;
    } catch {
      return defaultProgress;
    }
  });

  useEffect(() => {
    localStorage.setItem("vocab_words", JSON.stringify(vocabWords));
  }, [vocabWords]);

  useEffect(() => {
    localStorage.setItem("learning_progress", JSON.stringify(progress));
  }, [progress]);

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

  const clearAllData = useCallback(() => {
    setVocabWords([]);
    setProgress(defaultProgress);
    localStorage.removeItem("vocab_words");
    localStorage.removeItem("learning_progress");
  }, []);

  return (
    <AppContext.Provider value={{
      vocabWords,
      addVocabWord,
      removeVocabWord,
      toggleMastered,
      incrementReview,
      progress,
      updateProgress,
      clearAllData,
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
