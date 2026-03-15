/*
 * DESIGN: AIコックピット — テック・フューチャリスト
 * 認証バナー：Firebase未設定/未ログイン時に表示
 */
import { LogIn, LogOut, Cloud, CloudOff, Loader2 } from "lucide-react";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Link } from "wouter";

export default function AuthBanner() {
  const { user, isLoading, isConfigured, signInWithGoogle, signOutUser } = useFirebase();
  const { isSyncing } = useApp();

  if (isLoading) return null;

  // Firebase未設定
  if (!isConfigured) {
    return (
      <div className="bg-yellow-500/5 border-b border-yellow-500/20 px-4 py-2 text-center text-xs text-yellow-400/80 flex items-center justify-center gap-2">
        <CloudOff size={12} />
        <span>データはこの端末のみに保存されています。</span>
        <Link href="/settings" className="underline hover:text-yellow-300 font-medium">
          Firebase設定でクラウド同期を有効化 →
        </Link>
      </div>
    );
  }

  // 未ログイン
  if (!user) {
    return (
      <div className="bg-primary/5 border-b border-primary/20 px-4 py-2 text-center text-xs text-primary/80 flex items-center justify-center gap-2">
        <Cloud size={12} />
        <span>Googleログインで複数端末にデータを同期できます。</span>
        <button
          onClick={async () => {
            try { await signInWithGoogle(); toast.success("ログインしました"); }
            catch { toast.error("ログインに失敗しました"); }
          }}
          className="flex items-center gap-1 underline hover:text-primary font-medium"
        >
          <LogIn size={11} /> Googleでログイン
        </button>
      </div>
    );
  }

  // ログイン済み
  return (
    <div className="bg-accent/5 border-b border-accent/20 px-4 py-1.5 text-center text-xs text-accent/80 flex items-center justify-center gap-3">
      {isSyncing ? (
        <Loader2 size={11} className="animate-spin" />
      ) : (
        <Cloud size={11} />
      )}
      <span className="flex items-center gap-1">
        <img src={user.photoURL ?? ""} alt="" className="w-4 h-4 rounded-full inline" />
        {user.displayName ?? user.email} でクラウド同期中
      </span>
      <button
        onClick={async () => {
          await signOutUser();
          toast.success("ログアウトしました");
        }}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <LogOut size={11} /> ログアウト
      </button>
    </div>
  );
}
