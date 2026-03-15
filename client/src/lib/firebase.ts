/*
 * Firebase 設定・初期化
 * 
 * 使い方:
 * 1. Firebase Console (https://console.firebase.google.com) でプロジェクト作成
 * 2. Authentication → Google ログインを有効化
 * 3. Realtime Database を作成（ルール設定は下記参照）
 * 4. プロジェクト設定 → ウェブアプリ → SDK設定 → 設定値を取得
 * 5. このアプリの「設定」ページでFirebase設定値を入力して保存
 *
 * Realtime Database ルール（Firebase Console で設定）:
 * {
 *   "rules": {
 *     "users": {
 *       "$uid": {
 *         ".read": "$uid === auth.uid",
 *         ".write": "$uid === auth.uid"
 *       }
 *     }
 *   }
 * }
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Database | null = null;

export function initFirebase(config: FirebaseConfig): { auth: Auth; db: Database } {
  // 既存アプリを削除して再初期化（設定変更時）
  const existingApps = getApps();
  if (existingApps.length > 0 && firebaseApp) {
    // 既に同じ設定で初期化済みならそのまま返す
    if (firebaseAuth && firebaseDb) {
      return { auth: firebaseAuth, db: firebaseDb };
    }
  }

  firebaseApp = initializeApp(config, `app-${Date.now()}`);
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getDatabase(firebaseApp);

  return { auth: firebaseAuth, db: firebaseDb };
}

export function getFirebaseInstances(): { auth: Auth | null; db: Database | null } {
  return { auth: firebaseAuth, db: firebaseDb };
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function isFirebaseConfigured(config: Partial<FirebaseConfig>): boolean {
  return !!(config.apiKey && config.authDomain && config.databaseURL && config.projectId);
}
