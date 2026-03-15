/* 
 * DESIGN: AIコックピット — テック・フューチャリスト
 * ディープネイビー基調、シアン/ライムグリーンアクセント
 * グロー効果、ターミナル風UI
 */
import { Link, useLocation } from "wouter";
import AuthBanner from "./AuthBanner";
import { BookOpen, Home, Layers, Menu, X, Settings, Flame } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";

export default function NavBar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { vocabWords, progress, streak, weeklyTheme } = useApp();

  const completedSteps = [
    progress.step1Completed,
    progress.step2Completed,
    progress.step3Completed,
    progress.step4Completed,
    progress.step5Completed,
    progress.step6Completed,
    progress.step7Completed,
  ].filter(Boolean).length;

  const masteredCount = vocabWords.filter(w => w.mastered).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-glow-cyan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded border border-primary/60 flex items-center justify-center glow-cyan group-hover:glow-cyan transition-all">
              <span className="terminal-text text-xs font-bold">AI</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                英語学習
              </span>
              <span className="text-primary text-sm font-bold ml-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                7STEPS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/">
              <button className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                location === "/" 
                  ? "bg-primary/20 text-primary border border-primary/40" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}>
                <Home size={15} />
                ホーム
              </button>
            </Link>
            {[1,2,3,4,5,6,7].map(n => (
              <Link key={n} href={`/step/${n}`}>
                <button className={`flex items-center gap-1 px-2.5 py-2 rounded text-xs font-medium transition-all ${
                  location === `/step/${n}` 
                    ? "bg-primary/20 text-primary border border-primary/40" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    (progress as unknown as Record<string, boolean>)[`step${n}Completed`]
                      ? "bg-accent text-accent-foreground" 
                      : "bg-secondary text-muted-foreground"
                  }`}>{n}</span>
                </button>
              </Link>
            ))}
            <Link href="/vocab">
              <button className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                location === "/vocab" 
                  ? "bg-accent/20 text-accent border border-accent/40" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}>
                <BookOpen size={15} />
                単語帳
                {vocabWords.length > 0 && (
                  <span className="bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5 font-bold">
                    {vocabWords.length}
                  </span>
                )}
              </button>
            </Link>
            <Link href="/settings">
              <button className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all ${
                location === "/settings" 
                  ? "bg-secondary/60 text-foreground border border-border" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}>
                <Settings size={15} />
                設定
              </button>
            </Link>
          </div>

          {/* Stats + Mobile Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              {/* Streak */}
              {streak.currentStreak > 0 && (
                <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 rounded-full px-2.5 py-1">
                  <Flame size={12} className="text-orange-400" />
                  <span className="text-orange-400 font-bold">{streak.currentStreak}</span>
                  <span className="text-orange-400/70">日</span>
                </div>
              )}
              {/* Weekly theme badge */}
              {weeklyTheme.theme && (
                <div className="hidden lg:flex items-center gap-1 bg-accent/10 border border-accent/30 rounded-full px-2.5 py-1 max-w-[120px]">
                  <span className="text-accent font-bold truncate">{weeklyTheme.theme}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Layers size={12} className="text-primary" />
                <span className="text-primary font-bold">{completedSteps}</span>
                <span>/7</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen size={12} className="text-accent" />
                <span className="text-accent font-bold">{masteredCount}</span>
                <span>/{vocabWords.length}</span>
              </div>
            </div>
            <button
              className="md:hidden p-2 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AuthBanner />
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-t border-border/50 px-4 py-3">
          <div className="flex flex-col gap-1">
            {/* Mobile streak + theme */}
            <div className="flex items-center gap-2 mb-2">
              {streak.currentStreak > 0 && (
                <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 rounded-full px-2.5 py-1 text-xs">
                  <Flame size={12} className="text-orange-400" />
                  <span className="text-orange-400 font-bold">{streak.currentStreak}日継続</span>
                </div>
              )}
              {weeklyTheme.theme && (
                <div className="flex items-center gap-1 bg-accent/10 border border-accent/30 rounded-full px-2.5 py-1 text-xs">
                  <span className="text-accent font-bold">今週: {weeklyTheme.theme}</span>
                </div>
              )}
            </div>
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <button className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium transition-all text-left ${
                location === "/" ? "bg-primary/20 text-primary" : "text-muted-foreground"
              }`}>
                <Home size={16} /> ホーム
              </button>
            </Link>
            <div className="grid grid-cols-7 gap-1 py-1">
              {[1,2,3,4,5,6,7].map(n => (
                <Link key={n} href={`/step/${n}`} onClick={() => setMobileOpen(false)}>
                  <button className={`w-full aspect-square rounded flex items-center justify-center text-sm font-bold transition-all ${
                    location === `/step/${n}` 
                      ? "bg-primary/20 text-primary border border-primary/40" 
                      : (progress as unknown as Record<string, boolean>)[`step${n}Completed`]
                        ? "bg-accent/20 text-accent border border-accent/40"
                        : "bg-secondary/50 text-muted-foreground"
                  }`}>{n}</button>
                </Link>
              ))}
            </div>
            <Link href="/vocab" onClick={() => setMobileOpen(false)}>
              <button className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium transition-all text-left ${
                location === "/vocab" ? "bg-accent/20 text-accent" : "text-muted-foreground"
              }`}>
                <BookOpen size={16} /> 単語帳
                {vocabWords.length > 0 && (
                  <span className="bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5 font-bold ml-auto">
                    {vocabWords.length}語
                  </span>
                )}
              </button>
            </Link>
            <Link href="/settings" onClick={() => setMobileOpen(false)}>
              <button className={`w-full flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium transition-all text-left ${
                location === "/settings" ? "bg-secondary/60 text-foreground" : "text-muted-foreground"
              }`}>
                <Settings size={16} /> 設定
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
