/* 
 * DESIGN: AIコックピット — テック・フューチャリスト
 * ヒーローセクション + 7ステップ概要カード
 * ディープネイビー基調、シアン/ライムグリーンアクセント
 */
import { Link } from "wouter";
import { ArrowRight, BookOpen, CheckCircle2, Layers, MessageSquare, Mic, RotateCcw, Volume2, Zap } from "lucide-react";
import NavBar from "@/components/NavBar";
import { useApp } from "@/contexts/AppContext";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663334404957/ZYESkhyNDABvNyiwHT2bqJ/hero-bg-PKpbKwxAkN5wFh7nkNFAsU.webp";
const STEP_ILLUST = "https://d2xsxph8kpxj0f.cloudfront.net/310519663334404957/ZYESkhyNDABvNyiwHT2bqJ/step-illustration-na36MRgkErgqY2mVCVhJV5.webp";

const steps = [
  {
    id: 1,
    phase: "準備・インプット編",
    phaseColor: "cyan",
    icon: MessageSquare,
    title: "AIと日本語でおしゃべり",
    subtitle: "ネタ出し",
    description: "Geminiに対して日本語で日常の出来事や趣味を話す。自分が「普段話していること」を客観的に把握し、トークのネタを特定する。",
    tool: "Gemini",
    toolColor: "text-primary",
    tip: "$ gemini --chat --lang ja",
  },
  {
    id: 2,
    phase: "準備・インプット編",
    phaseColor: "cyan",
    icon: Layers,
    title: "自分だけの語彙リスト作成",
    subtitle: "単語帳作成",
    description: "Step 1のトピックをもとに、Geminiに「この話をするために必要な英単語表」を作らせる。英語・日本語・例文の3列構成で出力。",
    tool: "Gemini",
    toolColor: "text-primary",
    tip: "$ gemini --vocab --format spreadsheet",
  },
  {
    id: 3,
    phase: "準備・インプット編",
    phaseColor: "cyan",
    icon: BookOpen,
    title: "ナロー・リーディング",
    subtitle: "狭く深く読む",
    description: "決めたトピックについてGeminiにレベル別英文を書かせる。WPM（1分間の読書スピード）を測定し、ネイティブ速度（150〜200WPM）を目指して繰り返し読む。",
    tool: "Gemini",
    toolColor: "text-primary",
    tip: "$ measure-wpm --target 150-200",
  },
  {
    id: 4,
    phase: "準備・インプット編",
    phaseColor: "cyan",
    icon: Volume2,
    title: "リスニング",
    subtitle: "音の繋がりを確認",
    description: "生成した英文をAIに読み上げさせる。速度を0.5〜0.8倍に落とし、「Check it out → チェキラ」のようなリンキング（音の繋がり）を耳で確認する。",
    tool: "Gemini",
    toolColor: "text-primary",
    tip: "$ tts --speed 0.7 --focus linking",
  },
  {
    id: 5,
    phase: "アウトプット・実践編",
    phaseColor: "lime",
    icon: Mic,
    title: "1分間スピーチ",
    subtitle: "口から出す練習",
    description: "スマホに向かってそのトピックについて1分間英語で話し、録音・文字起こしする。「知っている」状態から「口から出す」負荷を脳にかける。",
    tool: "スマホ録音",
    toolColor: "text-accent",
    tip: "$ record --duration 60s --transcribe",
  },
  {
    id: 6,
    phase: "アウトプット・実践編",
    phaseColor: "lime",
    icon: RotateCcw,
    title: "3-2-1 リテリング",
    subtitle: "4コマ漫画活用",
    description: "Geminiにスピーチ内容を「セリフなしの4コマ漫画」に画像生成させる。絵のイメージから直接英語を出す回路を作る。同じ内容を3分→2分→1分と時間を縮めて話す。",
    tool: "Gemini",
    toolColor: "text-primary",
    tip: "$ gemini --image 4koma --retell 3-2-1",
  },
  {
    id: 7,
    phase: "アウトプット・実践編",
    phaseColor: "lime",
    icon: Zap,
    title: "ロールプレイ",
    subtitle: "仕上げ",
    description: "ChatGPTの音声モードを使用。特定のシチュエーション（カフェの店員と客など）になりきって会話する。実践的な対話スピードと予期せぬ返しへの対応力を磨く。",
    tool: "ChatGPT",
    toolColor: "text-emerald-400",
    tip: "$ chatgpt --voice --roleplay cafe",
  },
];

function HomeContent() {
  const { progress, vocabWords } = useApp();
  const completedSteps = [1,2,3,4,5,6,7].filter(n => 
    (progress as unknown as Record<string, boolean>)[`step${n}Completed`]
  ).length;

  return (
    <div className="min-h-screen bg-background grid-bg">
      <NavBar />

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {/* Terminal prompt */}
              <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded px-3 py-1.5 mb-6">
                <span className="terminal-text text-xs">$</span>
                <span className="terminal-text text-xs">english-learning --method AI-powered --steps 7</span>
                <span className="terminal-text text-xs animate-blink">▋</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span className="text-foreground">Gemini</span>
                <span className="text-muted-foreground mx-2">×</span>
                <span className="text-emerald-400">ChatGPT</span>
                <br />
                <span className="text-primary glow-text-cyan">英語学習</span>
                <span className="text-foreground"> 7ステップ</span>
              </h1>

              <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
                AIを最大限に活用した、インプットからアウトプットまでの体系的な英語学習メソッド。
                準備・インプット編（Step 1〜4）とアウトプット・実践編（Step 5〜7）で構成。
              </p>

              {/* Progress Bar */}
              <div className="bg-secondary/50 rounded-lg p-4 mb-8 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground font-mono">PROGRESS</span>
                  <span className="text-xs font-bold text-primary font-mono">{completedSteps}/7 STEPS</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                    style={{ width: `${(completedSteps / 7) * 100}%` }}
                  />
                </div>
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5,6,7].map(n => (
                    <div 
                      key={n}
                      className={`flex-1 h-1 rounded-full transition-all ${
                        (progress as unknown as Record<string, boolean>)[`step${n}Completed`]
                          ? n <= 4 ? "bg-primary" : "bg-accent"
                          : "bg-secondary"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/step/1">
                  <button className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded font-semibold text-sm hover:opacity-90 transition-all glow-cyan">
                    学習を始める
                    <ArrowRight size={16} />
                  </button>
                </Link>
                <Link href="/vocab">
                  <button className="flex items-center gap-2 bg-secondary border border-border text-foreground px-5 py-2.5 rounded font-semibold text-sm hover:bg-secondary/80 transition-all">
                    <BookOpen size={16} />
                    単語帳を開く
                    {vocabWords.length > 0 && (
                      <span className="bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5 font-bold">
                        {vocabWords.length}
                      </span>
                    )}
                  </button>
                </Link>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-3xl" />
                <img 
                  src={STEP_ILLUST} 
                  alt="AI英語学習" 
                  className="relative w-full max-w-md rounded-xl border border-border/50 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase Labels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg px-4 py-3">
            <div className="w-2 h-8 bg-primary rounded-full glow-cyan" />
            <div>
              <div className="text-xs text-muted-foreground font-mono">PHASE 01</div>
              <div className="text-sm font-bold text-primary">準備・インプット編 — Step 1〜4</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-accent/10 border border-accent/30 rounded-lg px-4 py-3">
            <div className="w-2 h-8 bg-accent rounded-full glow-lime" />
            <div>
              <div className="text-xs text-muted-foreground font-mono">PHASE 02</div>
              <div className="text-sm font-bold text-accent">アウトプット・実践編 — Step 5〜7</div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = (progress as unknown as Record<string, boolean>)[`step${step.id}Completed`];
            const isCyan = step.phaseColor === "cyan";

            return (
              <Link key={step.id} href={`/step/${step.id}`}>
                <div className={`group relative glass-panel rounded-xl p-5 border transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                  isCompleted 
                    ? isCyan ? "border-primary/50 bg-primary/5" : "border-accent/50 bg-accent/5"
                    : "border-border hover:border-border/80"
                } ${isCyan ? "hover:border-primary/40" : "hover:border-accent/40"}`}>
                  
                  {/* Step Number + Completed */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg step-badge ${
                      isCompleted 
                        ? isCyan ? "bg-primary text-primary-foreground glow-cyan" : "bg-accent text-accent-foreground glow-lime"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {isCompleted ? <CheckCircle2 size={20} /> : step.id}
                    </div>
                    <span className={`text-xs font-mono px-2 py-1 rounded border ${
                      isCyan ? "text-primary border-primary/30 bg-primary/10" : "text-accent border-accent/30 bg-accent/10"
                    }`}>
                      {step.tool}
                    </span>
                  </div>

                  {/* Icon + Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={isCyan ? "text-primary" : "text-accent"} />
                    <span className="text-xs text-muted-foreground">{step.subtitle}</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-2 leading-snug" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {step.description}
                  </p>

                  {/* Terminal hint */}
                  <div className="bg-background/60 rounded px-2 py-1.5 border border-border/50">
                    <span className="terminal-text text-xs opacity-70">{step.tip}</span>
                  </div>

                  {/* Arrow */}
                  <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all ${
                    isCyan ? "text-primary" : "text-accent"
                  }`}>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Vocab CTA */}
        <div className="mt-8 glass-panel rounded-xl border border-accent/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center glow-lime">
              <BookOpen size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>単語帳</h3>
              <p className="text-sm text-muted-foreground">
                {vocabWords.length > 0 
                  ? `${vocabWords.length}語登録済み（${vocabWords.filter(w => w.mastered).length}語マスター）`
                  : "Step 2で作成した単語を管理・復習できます"
                }
              </p>
            </div>
          </div>
          <Link href="/vocab">
            <button className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded font-semibold text-sm hover:opacity-90 transition-all glow-lime whitespace-nowrap">
              単語帳を開く
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
