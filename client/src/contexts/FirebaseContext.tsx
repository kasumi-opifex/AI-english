/*
 * DESIGN: AIコックピット — テック・フューチャリスト
 * Firebase Context: Googleログイン + Realtime Database 同期
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Auth,
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  Database,
  ref,
  set,
  get,
  onValue,
  off,
} from "firebase/database";
import {
  initFirebase,
  googleProvider,
  isFirebaseConfigured,
  type FirebaseConfig,
} from "@/lib/firebase";

// ── Types ────────────────────────────────────────────────────
export interface FirebaseSettings extends FirebaseConfig {}

interface FirebaseContextType {
  // Auth
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  // Config
  firebaseConfig: Partial<FirebaseSettings>;
  updateFirebaseConfig: (config: Partial<FirebaseSettings>) => void;
  // DB helpers
  dbWrite: (path: string, data: unknown) => Promise<void>;
  dbRead: (path: string) => Promise<unknown>;
  dbListen: (path: string, cb: (data: unknown) => void) => () => void;
  error: string | null;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

const DEFAULT_CONFIG: Partial<FirebaseSettings> = {};

function loadConfig(): Partial<FirebaseSettings> {
  try {
    const stored = localStorage.getItem("firebase_config");
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [firebaseConfig, setFirebaseConfig] = useState<Partial<FirebaseSettings>>(loadConfig);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Database | null>(null);

  const isConfigured = isFirebaseConfigured(firebaseConfig);

  // Firebase初期化
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }
    try {
      const { auth: a, db: d } = initFirebase(firebaseConfig as FirebaseSettings);
      setAuth(a);
      setDb(d);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Firebase初期化エラー");
      setIsLoading(false);
    }
  }, [firebaseConfig, isConfigured]);

  // 認証状態監視
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsub();
  }, [auth]);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error("Firebase未設定");
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "ログインエラー";
      setError(msg);
      throw e;
    }
  }, [auth]);

  const signOutUser = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
  }, [auth]);

  const updateFirebaseConfig = useCallback((config: Partial<FirebaseSettings>) => {
    const merged = { ...firebaseConfig, ...config };
    setFirebaseConfig(merged);
    localStorage.setItem("firebase_config", JSON.stringify(merged));
  }, [firebaseConfig]);

  // DB操作
  const dbWrite = useCallback(async (path: string, data: unknown) => {
    if (!db || !user) return;
    await set(ref(db, `users/${user.uid}/${path}`), data);
  }, [db, user]);

  const dbRead = useCallback(async (path: string): Promise<unknown> => {
    if (!db || !user) return null;
    const snap = await get(ref(db, `users/${user.uid}/${path}`));
    return snap.exists() ? snap.val() : null;
  }, [db, user]);

  const dbListen = useCallback((path: string, cb: (data: unknown) => void): (() => void) => {
    if (!db || !user) return () => {};
    const r = ref(db, `users/${user.uid}/${path}`);
    onValue(r, (snap) => {
      cb(snap.exists() ? snap.val() : null);
    });
    return () => off(r);
  }, [db, user]);

  return (
    <FirebaseContext.Provider value={{
      user, isLoading, isConfigured,
      signInWithGoogle, signOutUser,
      firebaseConfig, updateFirebaseConfig,
      dbWrite, dbRead, dbListen,
      error,
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error("useFirebase must be used within FirebaseProvider");
  return ctx;
}
