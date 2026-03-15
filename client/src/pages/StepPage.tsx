/* 
 * DESIGN: AIコックピット — テック・フューチャリスト
 * 各ステップの詳細ガイドページ
 * ターミナル風プロンプト表示、WPM計測、インタラクティブ要素
 */
import { useParams, Link } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, BookOpen, MessageSquare, 
  Layers, Volume2, Mic, RotateCcw, Zap, Copy, Check,
  Play, Square, Timer, Plus, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

// ============================================================
// Step Data
// ============================================================
const stepData = [
  {
    id: 1,
    phase: "準備・インプット編",
    phaseNum: "01",
    icon: MessageSquare,
    title: "AIと日本語でおしゃべり",
    subtitle: "ネタ出し（トピック特定）",
    tool: "Gemini",
    toolUrl: "https://gemini.google.com",
    toolColor: "cyan",
    description: "Geminiに対して日本語で日常の出来事や趣味を話す。自分が「普段話していること（＝英語でも話すべきこと）」を客観的に把握し、トークのネタを特定する。",
    purpose: "自分が日常的に話すトピックを英語でも話せるようにするための「ネタ出し」フェーズ。AIに話しかけることで、自分の思考パターンや興味を客観視できる。",
    steps: [
      "Geminiを開き、日本語で「今日あったこと」「最近ハマっていること」「仕事や趣味について」などを自由に話す",
      "Geminiが要約・整理してくれた内容から、英語で話したいトピックを1〜3つ選ぶ",
      "選んだトピックをメモしておく（次のStep 2で使用）",
    ],
    prompts: [
      {
        label: "ネタ出しプロンプト（日本語で話しかける）",
        text: "今日あったことや最近の趣味について話します。聞いて整理してください。\n\n[ここに自分の話を入力]",
      },
      {
        label: "トピック特定プロンプト",
        text: "今の会話から、私が英語でも話せるようになりたいトピックを3つ提案してください。それぞれ「なぜそのトピックが私に向いているか」も教えてください。",
      },
    ],
    tips: [
      "完璧な日本語でなくてOK。思いついたまま話しかけよう",
      "「英語で話せるようになりたい」という目標を意識しながら話す",
      "仕事・趣味・日常の3カテゴリからそれぞれ1つずつ選ぶのがおすすめ",
    ],
    hasTopicInput: true,
  },
  {
    id: 2,
    phase: "準備・インプット編",
    phaseNum: "01",
    icon: Layers,
    title: "自分だけの語彙リスト作成",
    subtitle: "パーソナル単語帳",
    tool: "Gemini",
    toolUrl: "https://gemini.google.com",
    toolColor: "cyan",
    description: "Step 1のトピックをもとに、Geminiに「この話をするために必要な英単語表」を作らせる。英語・日本語・例文の3列構成でスプレッドシート形式に出力。",
    purpose: "「自分が実際に使う」単語だけを学ぶことで、学習効率を最大化する。汎用的な単語帳ではなく、自分のトピックに特化したパーソナル語彙リストを作成する。",
    steps: [
      "Step 1で特定したトピックをGeminiに伝える",
      "「このトピックで会話するために必要な英単語20語を、英語・日本語・例文の3列表形式で出力してください」と依頼する",
      "出力された単語をこのアプリの単語帳に登録する",
      "特に重要な単語に★マークをつけて優先的に覚える",
    ],
    prompts: [
      {
        label: "語彙リスト生成プロンプト",
        text: "トピック：[Step 1で選んだトピックを入力]\n\nこのトピックについて英語で会話するために必要な単語・フレーズを20個、以下の形式で出力してください：\n\n| 英語 | 日本語 | 例文（英語） |\n|------|--------|------------|",
      },
      {
        label: "レベル別単語追加プロンプト",
        text: "上記の単語リストに加えて、初級・中級・上級それぞれ5語ずつ追加してください。同じ形式で出力してください。",
      },
    ],
    tips: [
      "一度に覚えようとせず、まず「見て意味がわかる」状態を目指す",
      "例文は自分のトピックに関連したものになっているか確認する",
      "このアプリの単語帳機能を使って登録・管理しよう",
    ],
    hasVocabInput: true,
  },
  {
    id: 3,
    phase: "準備・インプット編",
    phaseNum: "01",
    icon: BookOpen,
    title: "ナロー・リーディング",
    subtitle: "狭く深く読む",
    tool: "Gemini",
    toolUrl: "https://gemini.google.com",
    toolColor: "cyan",
    description: "決めたトピックについてGeminiにレベル別の英文を書かせる。WPM（1分間の読書スピード）を測定し、ネイティブのスピード（150〜200WPM）を目指して繰り返し読む。",
    purpose: "同じトピックの英文を繰り返し読むことで、語彙・文法・内容が定着する。WPM測定により、読書速度の客観的な向上を実感できる。",
    steps: [
      "Geminiに「[トピック]について、A2レベルの英文を150〜200語で書いてください」と依頼する",
      "書かれた英文の単語数を確認する",
      "タイマーをスタートし、英文を読み終わったら止める",
      "WPM = 単語数 ÷ 読んだ時間（分）で計算する",
      "目標：150〜200WPM（ネイティブの自然な読書速度）",
      "同じ英文を繰り返し読んでWPMを上げていく",
    ],
    prompts: [
      {
        label: "レベル別英文生成プロンプト（A2）",
        text: "トピック：[トピックを入力]\n\nこのトピックについて、英語学習者向け（A2レベル）の英文を150〜200語で書いてください。使用する単語は中学英語レベルを中心にしてください。文末に単語数を記載してください。",
      },
      {
        label: "レベルアップ版（B1）",
        text: "同じトピックで、B1レベル（TOEIC 500〜600点相当）の英文を200〜250語で書いてください。より自然な表現や慣用句を含めてください。",
      },
    ],
    tips: [
      "最初は遅くてもOK。同じ英文を3〜5回読むことで速度が上がる",
      "音読しながら読むとリスニング力も同時に鍛えられる",
      "WPMが150を超えたら次のレベルの英文に挑戦しよう",
    ],
    hasWPM: true,
  },
  {
    id: 4,
    phase: "準備・インプット編",
    phaseNum: "01",
    icon: Volume2,
    title: "リスニング",
    subtitle: "音の繋がり（リンキング）を確認",
    tool: "Gemini",
    toolUrl: "https://gemini.google.com",
    toolColor: "cyan",
    description: "生成した英文をAIに読み上げさせる。速度を0.5〜0.8倍に落とし、「Check it out → チェキラ」のようなリンキング（音の繋がり）を耳で確認する。",
    purpose: "ネイティブの発音では単語と単語が繋がって聞こえる（リンキング）。スローモーションで聞くことで、この音の変化を耳で捉える訓練をする。",
    steps: [
      "Step 3で生成した英文をGeminiのTTS（音声読み上げ）機能で再生する",
      "まず通常速度（1.0倍）で聞き、全体の流れを把握する",
      "次に0.7倍速に落として、単語の繋がりを意識しながら聞く",
      "リンキングが起きている箇所をメモする（例：「want to → wanna」「going to → gonna」）",
      "聞こえた音を真似して声に出す（シャドーイング）",
    ],
    prompts: [
      {
        label: "リンキング解説プロンプト",
        text: "以下の英文のリンキング（音の繋がり）が起きている箇所を全て指摘し、実際にどう聞こえるか（カタカナ表記）で教えてください：\n\n[Step 3で生成した英文を貼り付け]",
      },
      {
        label: "シャドーイング用プロンプト",
        text: "この英文をシャドーイング練習用に、スラッシュ（/）で意味のまとまりごとに区切ってください。また、特に注意すべき発音のポイントも教えてください。",
      },
    ],
    tips: [
      "「Check it out」→「チェキラウ」のように、繋がって聞こえる部分を探そう",
      "最初は0.5倍速から始めて、慣れたら0.8倍速に上げていく",
      "同じ英文を最低5回は聞くことで耳が慣れてくる",
    ],
    linkingExamples: [
      { original: "Check it out", linked: "チェキラウ", rule: "子音+母音のリンキング" },
      { original: "Want to", linked: "ウォナ", rule: "縮約形（Reduction）" },
      { original: "Going to", linked: "ゴナ", rule: "縮約形（Reduction）" },
      { original: "Did you", linked: "ディジュ", rule: "同化（Assimilation）" },
      { original: "Could you", linked: "クジュ", rule: "同化（Assimilation）" },
      { original: "What are you", linked: "ワラユ", rule: "連続リンキング" },
    ],
  },
  {
    id: 5,
    phase: "アウトプット・実践編",
    phaseNum: "02",
    icon: Mic,
    title: "1分間スピーチ",
    subtitle: "口から出す練習",
    tool: "スマホ録音",
    toolUrl: null,
    toolColor: "lime",
    description: "スマホに向かって、そのトピックについて1分間英語で話し、録音・文字起こしする。「知っている」状態から「口から出す」負荷を脳にかける。",
    purpose: "インプットした知識を実際に「話す」ことで、脳に「アウトプット回路」を作る。録音することで客観的に自分の英語を評価でき、文字起こしで改善点を発見できる。",
    steps: [
      "Step 1〜4で学んだトピックについて、1分間話す内容を頭の中で整理する（メモ不可）",
      "スマホのボイスメモアプリを起動し、録音を開始する",
      "タイマーを1分にセットして、英語で話し続ける（途中で止まっても続ける）",
      "録音した音声をGeminiやChatGPTに文字起こしさせる",
      "文字起こしを読んで、言えなかった表現・間違えた文法をメモする",
      "同じトピックでもう一度話し、改善を確認する",
    ],
    prompts: [
      {
        label: "文字起こし＋フィードバックプロンプト",
        text: "以下は私の1分間英語スピーチの文字起こしです。\n\n[文字起こしを貼り付け]\n\n以下の点でフィードバックをください：\n1. 文法の誤り（修正案付き）\n2. より自然な表現への言い換え提案\n3. 良かった点\n4. 次回挑戦すべき表現",
      },
      {
        label: "スピーチ構成プロンプト",
        text: "トピック：[トピックを入力]\n\nこのトピックで1分間（約120〜150語）のスピーチ構成を作ってください。イントロ・本題・まとめの3部構成で、私が自分の言葉で話せるようにポイントだけ箇条書きにしてください。",
      },
    ],
    tips: [
      "完璧を目指さない。「話し続けること」が最重要",
      "「えーと」の代わりに「Well...」「Let me think...」を使う練習をしよう",
      "録音を聞き直すのは勇気がいるが、最大の学習機会になる",
    ],
    hasTimer: true,
  },
  {
    id: 6,
    phase: "アウトプット・実践編",
    phaseNum: "02",
    icon: RotateCcw,
    title: "3-2-1 リテリング",
    subtitle: "4コマ漫画活用",
    tool: "Gemini",
    toolUrl: "https://gemini.google.com",
    toolColor: "lime",
    description: "Geminiにスピーチ内容を「セリフなしの4コマ漫画」に画像生成させる。日本語を介さず、絵のイメージから直接英語を出す回路を作る。同じ内容を3分→2分→1分と時間を縮めて話す。",
    purpose: "「絵を見て英語で説明する」ことで、日本語を経由しない英語思考回路を構築する。時間制限を設けることで、流暢さ（fluency）を鍛える。",
    steps: [
      "Step 5のスピーチ内容をGeminiに伝え、「セリフなしの4コマ漫画」として画像生成を依頼する",
      "生成された4コマ漫画を見ながら、3分間で英語でストーリーを語る（録音）",
      "同じ4コマを見ながら、今度は2分間で語る",
      "最後に1分間で語る（内容を圧縮・要約する力が身につく）",
      "3回の録音を比較して、どう変化したか確認する",
    ],
    prompts: [
      {
        label: "4コマ漫画生成プロンプト",
        text: "以下のストーリーを「セリフなし・テキストなし」の4コマ漫画として画像生成してください。シンプルなイラスト風で、各コマに何が起きているかが絵だけで伝わるようにしてください：\n\n[Step 5のスピーチ内容を要約して入力]",
      },
      {
        label: "リテリング評価プロンプト",
        text: "以下は4コマ漫画を見ながらの私の英語リテリング（[3分/2分/1分]版）の文字起こしです。\n\n[文字起こしを貼り付け]\n\n流暢さ・語彙の豊富さ・文法の正確さの観点でフィードバックをください。",
      },
    ],
    tips: [
      "絵を見て「これは英語でどう言う？」と考える習慣が英語思考の第一歩",
      "3分版は詳しく、1分版は要点だけ。情報の取捨選択力も鍛えられる",
      "同じ絵を使って毎日練習すると、流暢さが急速に向上する",
    ],
    retellingTimers: [180, 120, 60],
  },
  {
    id: 7,
    phase: "アウトプット・実践編",
    phaseNum: "02",
    icon: Zap,
    title: "ロールプレイ",
    subtitle: "仕上げ・実践対話",
    tool: "ChatGPT",
    toolUrl: "https://chat.openai.com",
    toolColor: "lime",
    description: "ChatGPTの音声モードを使用。特定のシチュエーション（カフェの店員と客など）になりきって会話する。実践的な対話スピードと、予期せぬ返しへの対応力を磨く。",
    purpose: "実際の会話では「予期せぬ返し」への対応が最も難しい。ChatGPTの音声モードでリアルタイム対話を練習することで、瞬時に反応する力を鍛える。",
    steps: [
      "ChatGPTを開き、音声モード（Voice Mode）に切り替える",
      "「You are a [役割]. I am a [自分の役割]. Let's have a conversation about [シチュエーション].」と設定する",
      "5〜10分間、ロールプレイを続ける",
      "会話が終わったら「Please give me feedback on my English」と依頼する",
      "フィードバックをもとに、同じシチュエーションで再度挑戦する",
    ],
    prompts: [
      {
        label: "ロールプレイ設定プロンプト（カフェ）",
        text: "You are a friendly barista at a busy café in New York. I am a customer who just walked in. Please start the conversation naturally. If I make grammar mistakes, continue the conversation naturally but correct me gently at the end of each exchange. Keep the conversation going for about 5 minutes.",
      },
      {
        label: "ロールプレイ設定プロンプト（ビジネス）",
        text: "You are a client from the US who is visiting our office for a business meeting. I am the host from the Japanese side. Please start with small talk and then transition to discussing our project. Correct my English mistakes naturally during the conversation.",
      },
      {
        label: "ロールプレイ設定プロンプト（旅行）",
        text: "You are a hotel receptionist at a 5-star hotel in London. I am a Japanese tourist checking in. Please start the check-in process. If I struggle to express something, give me a hint by rephrasing what I'm trying to say in correct English.",
      },
    ],
    tips: [
      "最初は簡単なシチュエーション（カフェ・ショッピング）から始めよう",
      "「I'm sorry, could you repeat that?」「What do you mean by...?」など、聞き返しフレーズも練習する",
      "毎日5分のロールプレイで、1ヶ月後には別人のように話せるようになる",
    ],
    scenarios: [
      { name: "カフェ注文", level: "初級", emoji: "☕" },
      { name: "ショッピング", level: "初級", emoji: "🛍️" },
      { name: "ホテルチェックイン", level: "中級", emoji: "🏨" },
      { name: "道案内", level: "中級", emoji: "🗺️" },
      { name: "ビジネス会議", level: "上級", emoji: "💼" },
      { name: "医療・緊急時", level: "上級", emoji: "🏥" },
    ],
  },
];

// ============================================================
// WPM Calculator Component
// ============================================================
function WPMCalculator() {
  const { progress, updateProgress } = useApp();
  const [wordCount, setWordCount] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState(progress.step3WPM || 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setIsRunning(true);
    setSeconds(0);
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (wordCount && seconds > 0) {
      const calculated = Math.round((parseInt(wordCount) / seconds) * 60);
      setWpm(calculated);
      updateProgress({ step3WPM: calculated });
      toast.success(`WPM計測完了: ${calculated} WPM`);
    }
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="bg-secondary/30 border border-border rounded-xl p-5">
      <h4 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <Timer size={16} className="text-primary" />
        WPM計測ツール
      </h4>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">英文の単語数</label>
          <input
            type="number"
            value={wordCount}
            onChange={e => setWordCount(e.target.value)}
            placeholder="例: 180"
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">経過時間</label>
          <div className="bg-background border border-border rounded px-3 py-2 text-sm font-mono text-primary">
            {formatTime(seconds)}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-all"
          >
            <Play size={14} /> 読み始める
          </button>
        ) : (
          <button
            onClick={stopTimer}
            className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-all"
          >
            <Square size={14} /> 読み終わった
          </button>
        )}
      </div>
      {wpm > 0 && (
        <div className="bg-background/60 border border-border rounded-lg p-4">
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-primary glow-text-cyan" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{wpm}</span>
            <span className="text-sm text-muted-foreground mb-1">WPM</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
            <div 
              className={`h-full rounded-full transition-all ${wpm >= 150 ? 'bg-accent' : wpm >= 100 ? 'bg-primary' : 'bg-destructive'}`}
              style={{ width: `${Math.min((wpm / 200) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {wpm < 100 ? "🔴 もう少し練習しよう（目標: 150+ WPM）" : 
             wpm < 150 ? "🟡 いい感じ！ネイティブまであと一歩" : 
             "🟢 ネイティブレベル達成！"}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Speech Timer Component
// ============================================================
function SpeechTimer({ duration, label }: { duration: number; label: string }) {
  const [seconds, setSeconds] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setSeconds(duration);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          toast.success(`${label} 完了！`);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const stop = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(duration);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const progress = ((duration - seconds) / duration) * 100;

  return (
    <div className="bg-background/60 border border-border rounded-lg p-4 flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-secondary" />
          <circle 
            cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
            className="text-accent transition-all"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono font-bold text-foreground">{formatTime(seconds)}</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="font-bold text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</div>
        <div className="text-xs text-muted-foreground mb-2">{duration / 60}分間で話す</div>
        {!isRunning ? (
          <button onClick={start} className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90 transition-all">
            <Play size={12} /> スタート
          </button>
        ) : (
          <button onClick={stop} className="flex items-center gap-1.5 bg-secondary text-foreground px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90 transition-all">
            <Square size={12} /> リセット
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Vocab Input Component (for Step 2)
// ============================================================
function VocabInput({ topic }: { topic: string }) {
  const { addVocabWord } = useApp();
  const [english, setEnglish] = useState("");
  const [japanese, setJapanese] = useState("");
  const [example, setExample] = useState("");

  const handleAdd = () => {
    if (!english.trim() || !japanese.trim()) {
      toast.error("英語と日本語は必須です");
      return;
    }
    addVocabWord({ english: english.trim(), japanese: japanese.trim(), example: example.trim(), topic: topic || "一般" });
    setEnglish(""); setJapanese(""); setExample("");
    toast.success(`「${english}」を単語帳に追加しました`);
  };

  return (
    <div className="bg-secondary/30 border border-border rounded-xl p-5">
      <h4 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <Plus size={16} className="text-accent" />
        単語帳に追加
      </h4>
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">英語</label>
          <input value={english} onChange={e => setEnglish(e.target.value)} placeholder="例: enthusiastic" className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">日本語</label>
          <input value={japanese} onChange={e => setJapanese(e.target.value)} placeholder="例: 熱狂的な" className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">例文（任意）</label>
          <input value={example} onChange={e => setExample(e.target.value)} placeholder="例: She is enthusiastic about..." className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
        </div>
      </div>
      <button onClick={handleAdd} className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-all">
        <Plus size={14} /> 単語帳に追加
      </button>
    </div>
  );
}

// ============================================================
// Prompt Card Component
// ============================================================
function PromptCard({ prompt }: { prompt: { label: string; text: string } }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(prompt.text);
    setCopied(true);
    toast.success("コピーしました");
    setTimeout(() => setCopied(false), 2000);
  }, [prompt.text]);

  return (
    <div className="bg-background/60 border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
        <span className="text-xs text-muted-foreground font-mono">{prompt.label}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
      <pre className="px-4 py-3 text-xs text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
        {prompt.text}
      </pre>
    </div>
  );
}

// ============================================================
// Main Step Page
// ============================================================
function StepPageContent() {
  const params = useParams<{ id: string }>();
  const stepId = parseInt(params.id || "1");
  const step = stepData.find(s => s.id === stepId);
  const { progress, updateProgress } = useApp();
  const [showPrompts, setShowPrompts] = useState(false);
  const [topicInput, setTopicInput] = useState(progress.currentTopic || "");

  if (!step) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">ステップが見つかりません</p>
          <Link href="/"><button className="text-primary hover:underline">ホームに戻る</button></Link>
        </div>
      </div>
    );
  }

  const Icon = step.icon;
  const isCyan = step.toolColor === "cyan";
  const isCompleted = (progress as unknown as Record<string, boolean>)[`step${step.id}Completed`];
  const prevStep = stepId > 1 ? stepId - 1 : null;
  const nextStep = stepId < 7 ? stepId + 1 : null;

  const handleComplete = () => {
    const key = `step${step.id}Completed` as keyof typeof progress;
    updateProgress({ [key]: !isCompleted } as Partial<typeof progress>);
    if (!isCompleted) {
      toast.success(`Step ${step.id} 完了！`);
    }
  };

  const handleTopicSave = () => {
    updateProgress({ currentTopic: topicInput });
    toast.success("トピックを保存しました");
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <NavBar />
      <div className="pt-16">
        {/* Step Header */}
        <div className={`border-b border-border ${isCyan ? "bg-primary/5" : "bg-accent/5"}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Link href="/"><span className="hover:text-foreground cursor-pointer">ホーム</span></Link>
              <span>/</span>
              <span className={isCyan ? "text-primary" : "text-accent"}>{step.phase}</span>
              <span>/</span>
              <span className="text-foreground">Step {step.id}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl flex-shrink-0 step-badge ${
                isCyan ? "bg-primary/20 border border-primary/40 text-primary" : "bg-accent/20 border border-accent/40 text-accent"
              }`}>
                {isCompleted ? <CheckCircle2 size={28} /> : step.id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    isCyan ? "text-primary border-primary/30 bg-primary/10" : "text-accent border-accent/30 bg-accent/10"
                  }`}>
                    PHASE {step.phaseNum}
                  </span>
                  <span className="text-xs text-muted-foreground">{step.phase}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Step {step.id}: {step.title}
                </h1>
                <p className="text-muted-foreground text-sm">{step.subtitle}</p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {step.toolUrl && (
                  <a href={step.toolUrl} target="_blank" rel="noopener noreferrer">
                    <button className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-all ${
                      isCyan 
                        ? "border-primary/40 text-primary hover:bg-primary/10" 
                        : step.tool === "ChatGPT" 
                          ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                          : "border-accent/40 text-accent hover:bg-accent/10"
                    }`}>
                      <ExternalLink size={12} />
                      {step.tool}を開く
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="glass-panel rounded-xl p-5 border border-border">
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 font-mono">OVERVIEW</h2>
                <p className="text-sm text-foreground/90 leading-relaxed mb-4">{step.description}</p>
                <div className={`border-l-2 pl-4 ${isCyan ? "border-primary" : "border-accent"}`}>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.purpose}</p>
                </div>
              </div>

              {/* Topic Input (Step 1 & 2) */}
              {step.hasTopicInput && (
                <div className="glass-panel rounded-xl p-5 border border-border">
                  <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 font-mono">TOPIC</h2>
                  <div className="flex gap-2">
                    <input
                      value={topicInput}
                      onChange={e => setTopicInput(e.target.value)}
                      placeholder="例: コーヒー、ランニング、映画鑑賞..."
                      className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <button onClick={handleTopicSave} className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-all">
                      保存
                    </button>
                  </div>
                  {progress.currentTopic && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      現在のトピック: <span className="text-primary font-semibold">{progress.currentTopic}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Steps */}
              <div className="glass-panel rounded-xl p-5 border border-border">
                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 font-mono">PROCEDURE</h2>
                <ol className="space-y-3">
                  {step.steps.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        isCyan ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                      }`}>{i + 1}</span>
                      <span className="text-sm text-foreground/90 leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* WPM Calculator */}
              {step.hasWPM && <WPMCalculator />}

              {/* Vocab Input */}
              {step.hasVocabInput && <VocabInput topic={progress.currentTopic} />}

              {/* Linking Examples */}
              {step.linkingExamples && (
                <div className="glass-panel rounded-xl p-5 border border-border">
                  <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 font-mono">LINKING EXAMPLES</h2>
                  <div className="space-y-2">
                    {step.linkingExamples.map((ex, i) => (
                      <div key={i} className="flex items-center gap-3 bg-background/60 rounded-lg px-4 py-3 border border-border/50">
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-foreground">{ex.original}</span>
                          <span className="text-muted-foreground mx-2">→</span>
                          <span className="terminal-text text-sm font-bold">{ex.linked}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">{ex.rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speech Timer (Step 5) */}
              {step.hasTimer && (
                <div className="glass-panel rounded-xl p-5 border border-border">
                  <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 font-mono">SPEECH TIMER</h2>
                  <SpeechTimer duration={60} label="1分間スピーチ" />
                </div>
              )}

              {/* Retelling Timers (Step 6) */}
              {step.retellingTimers && (
                <div className="glass-panel rounded-xl p-5 border border-border">
                  <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 font-mono">3-2-1 TIMER</h2>
                  <div className="space-y-3">
                    <SpeechTimer duration={180} label="3分版（詳しく語る）" />
                    <SpeechTimer duration={120} label="2分版（要点を絞る）" />
                    <SpeechTimer duration={60} label="1分版（核心だけ）" />
                  </div>
                </div>
              )}

              {/* Scenarios (Step 7) */}
              {step.scenarios && (
                <div className="glass-panel rounded-xl p-5 border border-border">
                  <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 font-mono">SCENARIOS</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {step.scenarios.map((sc, i) => (
                      <div key={i} className="bg-background/60 border border-border rounded-lg p-3 text-center">
                        <div className="text-2xl mb-1">{sc.emoji}</div>
                        <div className="text-sm font-semibold text-foreground mb-1">{sc.name}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                          sc.level === "初級" ? "bg-primary/20 text-primary" :
                          sc.level === "中級" ? "bg-amber-500/20 text-amber-400" :
                          "bg-destructive/20 text-destructive"
                        }`}>{sc.level}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompts */}
              <div className="glass-panel rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-all"
                >
                  <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider font-mono">
                    AI PROMPTS ({step.prompts.length})
                  </h2>
                  {showPrompts ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </button>
                {showPrompts && (
                  <div className="px-5 pb-5 space-y-3 border-t border-border">
                    <p className="text-xs text-muted-foreground pt-4">以下のプロンプトをコピーしてGemini/ChatGPTに貼り付けてください。</p>
                    {step.prompts.map((p, i) => <PromptCard key={i} prompt={p} />)}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Complete Button */}
              <button
                onClick={handleComplete}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isCompleted
                    ? "bg-secondary border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
                    : isCyan
                      ? "bg-primary text-primary-foreground glow-cyan hover:opacity-90"
                      : "bg-accent text-accent-foreground glow-lime hover:opacity-90"
                }`}
              >
                {isCompleted ? (
                  <><CheckCircle2 size={16} /> 完了済み（クリックで取消）</>
                ) : (
                  <><CheckCircle2 size={16} /> Step {step.id} を完了にする</>
                )}
              </button>

              {/* Tips */}
              <div className="glass-panel rounded-xl p-4 border border-border">
                <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3 font-mono">TIPS</h3>
                <ul className="space-y-2">
                  {step.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-xs text-foreground/80 leading-relaxed">
                      <span className={`mt-0.5 flex-shrink-0 ${isCyan ? "text-primary" : "text-accent"}`}>▶</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tool Link */}
              {step.toolUrl && (
                <a href={step.toolUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <div className={`glass-panel rounded-xl p-4 border transition-all hover:scale-[1.02] cursor-pointer ${
                    isCyan ? "border-primary/30 hover:border-primary/60" : 
                    step.tool === "ChatGPT" ? "border-emerald-500/30 hover:border-emerald-500/60" :
                    "border-accent/30 hover:border-accent/60"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 font-mono">USE TOOL</div>
                        <div className={`font-bold text-sm ${
                          isCyan ? "text-primary" : 
                          step.tool === "ChatGPT" ? "text-emerald-400" : 
                          "text-accent"
                        }`}>{step.tool}</div>
                      </div>
                      <ExternalLink size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                </a>
              )}

              {/* Navigation */}
              <div className="glass-panel rounded-xl p-4 border border-border">
                <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3 font-mono">NAVIGATION</h3>
                <div className="space-y-2">
                  {prevStep && (
                    <Link href={`/step/${prevStep}`}>
                      <button className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded hover:bg-secondary/50 transition-all">
                        <ArrowLeft size={12} />
                        Step {prevStep}: {stepData[prevStep - 1]?.title}
                      </button>
                    </Link>
                  )}
                  {nextStep && (
                    <Link href={`/step/${nextStep}`}>
                      <button className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded hover:bg-secondary/50 transition-all justify-between">
                        <span className="flex items-center gap-2">
                          <ArrowRight size={12} />
                          Step {nextStep}: {stepData[nextStep - 1]?.title}
                        </span>
                      </button>
                    </Link>
                  )}
                </div>
              </div>

              {/* All Steps */}
              <div className="glass-panel rounded-xl p-4 border border-border">
                <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3 font-mono">ALL STEPS</h3>
                <div className="space-y-1">
                  {stepData.map(s => {
                    const isStepCompleted = (progress as unknown as Record<string, boolean>)[`step${s.id}Completed`];
                    const isActive = s.id === stepId;
                    return (
                      <Link key={s.id} href={`/step/${s.id}`}>
                        <button className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all text-left ${
                          isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isStepCompleted ? "bg-accent text-accent-foreground" :
                            isActive ? "bg-primary text-primary-foreground" :
                            "bg-secondary text-muted-foreground"
                          }`}>{isStepCompleted ? "✓" : s.id}</span>
                          {s.title}
                        </button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StepPage() {
  return <StepPageContent />;
}
