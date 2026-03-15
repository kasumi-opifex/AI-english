/*
 * DESIGN: AIコックピット — テック・フューチャリスト
 * 各ステップの詳細ガイドページ
 * ターミナル風プロンプト表示、WPM計測、インタラクティブ要素
 * AI会話統合、Step7ロールプレイシチュエーション指定
 */
import { useParams, Link } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, BookOpen, MessageSquare, 
  Layers, Volume2, Mic, RotateCcw, Zap, Copy, Check,
  Play, Square, Timer, Plus, ChevronDown, ChevronUp, ExternalLink,
  Bot, Pencil, X, Sparkles, Loader2
} from "lucide-react";
import NavBar from "@/components/NavBar";
import { useApp } from "@/contexts/AppContext";
import AiChat from "@/components/AiChat";
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
    aiSystemPrompt: "あなたは英語学習をサポートするAIアシスタントです。ユーザーが日本語で日常の出来事や趣味を話してくれます。話を聞いて整理し、英語でも話せるようになりたいトピックを提案してください。親しみやすく、励ましながら会話してください。",
    aiInitialMessage: "こんにちは！今日あったことや最近ハマっていることを、日本語で自由に話してください。英語で話したいトピックを一緒に見つけましょう！",
    aiPlaceholder: "今日あったことや趣味について話してください...",
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
    aiSystemPrompt: "あなたは英語学習をサポートするAIアシスタントです。ユーザーのトピックに合わせた英単語・フレーズリストを作成してください。英語・日本語・例文の3列形式で出力し、実際の会話で使えるものを優先してください。",
    aiInitialMessage: "語彙リストを作成しましょう！学習したいトピックを教えてください。そのトピックで会話するために必要な単語・フレーズを20語リストアップします。",
    aiPlaceholder: "トピックを教えてください（例：コーヒー、旅行、映画）...",
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
    purpose: "同じトピックを繰り返し読むことで、語彙と文脈を同時に定着させる「ナロー・リーディング」メソッド。WPM測定で客観的な進捗を把握する。",
    steps: [
      "Geminiに「[トピック]について、初級・中級・上級レベルの英文をそれぞれ100〜150語で書いてください」と依頼する",
      "初級レベルから読み始め、WPM計測ツールで読書速度を測定する",
      "同じ英文を繰り返し読み、WPMが上がるまで練習する",
      "150WPM以上になったら次のレベルに進む",
    ],
    prompts: [
      {
        label: "レベル別英文生成プロンプト",
        text: "トピック：[トピックを入力]\n\n以下の3レベルで英文を書いてください：\n\n【初級 (A2)】100語程度：簡単な語彙・短文\n【中級 (B1)】120語程度：一般的な語彙・複文\n【上級 (B2)】150語程度：豊かな語彙・複雑な構文",
      },
      {
        label: "リーディング練習プロンプト",
        text: "上記の英文について、以下を教えてください：\n1. 難しい単語・表現の解説\n2. 文章の要点3つ\n3. 音読する際のポイント",
      },
    ],
    tips: [
      "最初は遅くてOK。スムーズに読めるようになってから速度を上げよう",
      "意味を理解しながら読む「意味読み」を意識する",
      "同じ英文を最低3回は繰り返し読もう",
    ],
    hasWPM: true,
    aiSystemPrompt: "あなたは英語リーディング指導のAIアシスタントです。ユーザーのトピックに合わせたレベル別英文（初級・中級・上級）を作成し、WPM向上のためのアドバイスをしてください。",
    aiInitialMessage: "ナロー・リーディングの英文を作成します！学習トピックと希望レベル（初級/中級/上級）を教えてください。",
    aiPlaceholder: "トピックとレベルを教えてください...",
  },
  {
    id: 4,
    phase: "準備・インプット編",
    phaseNum: "01",
    icon: Volume2,
    title: "リスニング",
    subtitle: "音の繋がりを確認",
    tool: "Gemini",
    toolUrl: "https://gemini.google.com",
    toolColor: "cyan",
    description: "生成した英文をAIに読み上げさせる。速度を0.5〜0.8倍に落とし、「Check it out → チェキラ」のようなリンキング（音の繋がり）を耳で確認する。",
    purpose: "ネイティブの発音では単語が繋がって聞こえる「リンキング」が多発する。スロー再生で音の繋がりを意識的に確認することで、リスニング力と発音を同時に鍛える。",
    steps: [
      "Step 3で生成した英文をGeminiに読み上げさせる（またはテキスト読み上げツールを使用）",
      "最初は0.5倍速で聞き、音の繋がりを確認する",
      "0.7倍速 → 0.8倍速 → 通常速度と段階的に上げていく",
      "リンキングが起きている箇所をメモし、自分でも発音してみる",
    ],
    prompts: [
      {
        label: "リンキング解説プロンプト",
        text: "以下の英文を読み上げる際のリンキング（音の繋がり）を解説してください。特に「子音+母音」「同じ子音の連続」「消える音」のパターンを教えてください：\n\n[英文を入力]",
      },
      {
        label: "発音練習プロンプト",
        text: "以下の英文について、日本人が発音しにくい箇所と、その練習方法を教えてください：\n\n[英文を入力]",
      },
    ],
    tips: [
      "「Check it out」→「チェキラウ」のように、繋がりを日本語で書いてみると覚えやすい",
      "シャドーイング（音声に合わせて声に出す）も効果的",
      "毎日5分でも継続することが大切",
    ],
    linkingExamples: [
      { original: "Check it out", linked: "チェキラウ", rule: "子音+母音" },
      { original: "What are you", linked: "ワラユ", rule: "連続リンキング" },
      { original: "I want to", linked: "アイウォナ", rule: "弱形" },
      { original: "Did you", linked: "ヂジュ", rule: "同化" },
      { original: "going to", linked: "ゴナ", rule: "縮約" },
    ],
    aiSystemPrompt: "あなたは英語発音・リスニング指導のAIアシスタントです。リンキング（音の繋がり）、弱形、同化などの音声変化を分かりやすく解説してください。英文のリンキング箇所を具体的に示し、日本人学習者が理解しやすいよう日本語で説明してください。",
    aiInitialMessage: "リンキング（音の繋がり）を学習しましょう！練習したい英文を入力してください。リンキングが起きる箇所を解説します。",
    aiPlaceholder: "練習したい英文を入力してください...",
  },
  {
    id: 5,
    phase: "アウトプット・実践編",
    phaseNum: "02",
    icon: Mic,
    title: "1分間スピーチ",
    subtitle: "口から出す練習",
    tool: "スマホ録音",
    toolUrl: "",
    toolColor: "lime",
    description: "スマホに向かってそのトピックについて1分間英語で話し、録音・文字起こしする。「知っている」状態から「口から出す」負荷を脳にかける。",
    purpose: "「知っている」と「話せる」は全く別物。1分間スピーチを録音することで、自分の弱点（語彙不足・文法ミス・詰まる箇所）を客観的に把握できる。",
    steps: [
      "スマホの録音アプリを開き、タイマーをセットする",
      "1分間、トピックについて英語で話し続ける（途中で止まっても続ける）",
      "録音を聞き返し、詰まった箇所・間違えた箇所をメモする",
      "AIに文字起こしした内容を添削してもらう",
    ],
    prompts: [
      {
        label: "スピーチ添削プロンプト",
        text: "以下は私が1分間英語でスピーチした内容の文字起こしです。文法・語彙・表現を添削し、より自然な英語に直してください。また、改善点を3つ教えてください：\n\n[文字起こし内容を入力]",
      },
      {
        label: "スピーチ構成プロンプト",
        text: "トピック：[トピックを入力]\n\n1分間スピーチの構成を教えてください。イントロ・本題・まとめの3部構成で、各パートで使えるフレーズも含めてください。",
      },
    ],
    tips: [
      "最初は詰まっても止まらないことが大切。「um」「well」「you know」などのフィラーを使おう",
      "録音を聞き返すのは勇気がいるが、最も効果的な上達法",
      "毎日同じトピックで話すと、どんどん流暢になる",
    ],
    hasTimer: true,
    aiSystemPrompt: "あなたは英語スピーキング指導のAIアシスタントです。ユーザーのスピーチ内容を添削し、より自然な英語表現を提案してください。また、1分間スピーチの構成や使えるフレーズも教えてください。励ましながら、具体的なフィードバックを提供してください。",
    aiInitialMessage: "1分間スピーチの練習をサポートします！録音した内容を文字起こしして貼り付けてください。添削と改善アドバイスをします。または、スピーチのネタや構成のアドバイスが必要な場合はトピックを教えてください。",
    aiPlaceholder: "スピーチの文字起こしを貼り付けるか、トピックを入力してください...",
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
    purpose: "絵を見て直接英語で話す練習は、日本語→英語の翻訳回路を使わずに英語を出力する力を鍛える。時間を縮めることで、情報の取捨選択力も向上する。",
    steps: [
      "Step 5のスピーチ内容をGeminiに伝え、「セリフなしの4コマ漫画」として画像生成を依頼する",
      "生成された4コマ漫画を見ながら、3分間で内容を英語で説明する",
      "同じ絵を見ながら、2分間で説明する（情報を絞る）",
      "最後に1分間で核心だけを話す",
    ],
    prompts: [
      {
        label: "4コマ漫画生成プロンプト",
        text: "以下のスピーチ内容を、セリフなしの4コマ漫画として画像生成してください。シンプルなイラストで、各コマが話の流れを表すようにしてください：\n\n[スピーチ内容を入力]",
      },
      {
        label: "リテリング評価プロンプト",
        text: "私が絵を見ながら英語でリテリングした内容を評価してください。以下の観点で：\n1. 情報の取捨選択は適切か\n2. 使った語彙・表現は適切か\n3. 流暢さはどうか\n\n[リテリング内容を入力]",
      },
    ],
    tips: [
      "3分版では詳しく、1分版では核心だけを話す意識を持つ",
      "絵を見て「これは英語でなんと言う？」と考える習慣をつける",
      "毎回同じ絵を使うことで、表現の引き出しが増える",
    ],
    retellingTimers: true,
    aiSystemPrompt: "あなたは英語スピーキング指導のAIアシスタントです。3-2-1リテリング練習をサポートします。ユーザーのスピーチ内容から4コマ漫画のシナリオを作成したり、リテリングの評価・フィードバックを提供してください。",
    aiInitialMessage: "3-2-1リテリングの練習をサポートします！Step 5のスピーチ内容を教えてください。4コマ漫画のシナリオを作成します。または、リテリングした内容を貼り付けてフィードバックを受けることもできます。",
    aiPlaceholder: "スピーチ内容を入力するか、リテリングした内容を貼り付けてください...",
  },
  {
    id: 7,
    phase: "アウトプット・実践編",
    phaseNum: "02",
    icon: Zap,
    title: "ロールプレイ",
    subtitle: "仕上げ",
    tool: "ChatGPT",
    toolUrl: "https://chat.openai.com",
    toolColor: "lime",
    description: "ChatGPTの音声モードを使用。特定のシチュエーション（カフェの店員と客など）になりきって会話する。実践的な対話スピードと、予期せぬ返しへの対応力を磨く。",
    purpose: "実際の会話では「予期せぬ返し」への対応が最も難しい。ChatGPTの音声モードでリアルタイム対話を練習することで、瞬時に反応する力を鍛える。",
    steps: [
      "シチュエーションを選択またはカスタム入力する",
      "ChatGPTを開き、音声モード（Voice Mode）に切り替える",
      "生成されたプロンプトをChatGPTに貼り付けてロールプレイを開始する",
      "5〜10分間、ロールプレイを続ける",
      "会話が終わったら「Please give me feedback on my English」と依頼する",
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
      { name: "カフェ注文", level: "初級", emoji: "☕", aiRole: "friendly barista at a busy café", userRole: "customer", context: "ordering coffee and chatting" },
      { name: "ショッピング", level: "初級", emoji: "🛍️", aiRole: "helpful store clerk at a clothing store", userRole: "customer", context: "shopping for clothes" },
      { name: "ホテルチェックイン", level: "中級", emoji: "🏨", aiRole: "hotel receptionist at a 5-star hotel in London", userRole: "Japanese tourist", context: "checking in and asking about hotel facilities" },
      { name: "道案内", level: "中級", emoji: "🗺️", aiRole: "friendly local resident", userRole: "tourist who is lost", context: "asking for directions to a famous landmark" },
      { name: "ビジネス会議", level: "上級", emoji: "💼", aiRole: "US client visiting for a business meeting", userRole: "Japanese host", context: "business discussion and negotiation" },
      { name: "医療・緊急時", level: "上級", emoji: "🏥", aiRole: "doctor at a hospital", userRole: "patient with symptoms", context: "explaining symptoms and getting medical advice" },
    ],
    aiSystemPrompt: "あなたは英語ロールプレイ練習のAIアシスタントです。ユーザーが指定したシチュエーションでロールプレイの準備をサポートします。適切なプロンプトを生成したり、ロールプレイ後のフィードバックを提供してください。",
    aiInitialMessage: "ロールプレイの準備をしましょう！シチュエーションを選択するか、カスタムシチュエーションを入力してください。ChatGPTに貼り付けるプロンプトを生成します。",
    aiPlaceholder: "シチュエーションを説明するか、ロールプレイ後のフィードバックを求めてください...",
    hasRoleplay: true,
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
  const pct = (seconds / duration) * 100;

  return (
    <div className="bg-background/60 border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
        <span className={`text-2xl font-bold font-mono ${seconds === 0 ? 'text-accent' : isRunning ? 'text-primary' : 'text-foreground'}`}>
          {formatTime(seconds)}
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full rounded-full transition-all ${seconds === 0 ? 'bg-accent' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-2">
        {!isRunning ? (
          <button onClick={start} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90 transition-all">
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

// Gemini API呼び出し（単語生成用）
async function callGeminiForVocab(apiKey: string, theme: string, model = "gemini-2.0-flash-lite"): Promise<Array<{english: string; japanese: string; example: string}>> {
  const GEMINI_MODEL = model;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const prompt = `トピック「${theme}」について英語で会話するために必要な英単語・フレーズを15個リストアップしてください。
必ず以下のJSON形式のみで出力してください（説明文は不要）：
[
  {"english": "英単語", "japanese": "日本語訳", "example": "例文（英語）"},
  ...
]
JSONのみ出力し、他のテキストは一切含めないでください。`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as {error?: {message?: string}})?.error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  
  // JSONを抽出（コードブロックがある場合も対応）
  const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (!jsonMatch) throw new Error("AIの応答をパースできませんでした");
  
  return JSON.parse(jsonMatch[0]) as Array<{english: string; japanese: string; example: string}>;
}

function VocabInput({ topic }: { topic: string }) {
  const { addVocabWord, vocabWords, apiSettings } = useApp();
  const [english, setEnglish] = useState("");
  const [japanese, setJapanese] = useState("");
  const [example, setExample] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<{added: number; skipped: number} | null>(null);

  const handleAdd = () => {
    if (!english.trim() || !japanese.trim()) {
      toast.error("英語と日本語は必須です");
      return;
    }
    addVocabWord({ english: english.trim(), japanese: japanese.trim(), example: example.trim(), topic: topic || "一般" });
    setEnglish(""); setJapanese(""); setExample("");
    toast.success(`「${english}」を単語帳に追加しました`);
  };

  const handleAiGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Step 1 でテーマを設定してください");
      return;
    }
    if (!apiSettings.geminiApiKey) {
      toast.error("Gemini APIキーが設定されていません。設定ページで入力してください。");
      return;
    }
    setIsGenerating(true);
    setLastResult(null);
    try {
      const words = await callGeminiForVocab(apiSettings.geminiApiKey, topic, apiSettings.geminiModel || "gemini-2.0-flash-lite");
      // 重複チェック（英単語の小文字比較）
      const existingEnglish = new Set(vocabWords.map(w => w.english.toLowerCase().trim()));
      let added = 0;
      let skipped = 0;
      for (const w of words) {
        if (!w.english || !w.japanese) continue;
        if (existingEnglish.has(w.english.toLowerCase().trim())) {
          skipped++;
        } else {
          addVocabWord({ english: w.english.trim(), japanese: w.japanese.trim(), example: w.example?.trim() || "", topic: topic || "一般" });
          existingEnglish.add(w.english.toLowerCase().trim());
          added++;
        }
      }
      setLastResult({ added, skipped });
      toast.success(`${added}語を単語帳に追加しました${skipped > 0 ? `（${skipped}語は重複のためスキップ）` : ""}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI自動生成ボタン */}
      <div className="bg-primary/10 border border-primary/30 rounded-xl p-5">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Sparkles size={16} className="text-primary" />
          AIで関連単語を自動生成
        </h4>
        {topic ? (
          <p className="text-xs text-muted-foreground mb-4">
            今週のテーマ <span className="text-primary font-semibold">「{topic}」</span> に関連する英単語をAIが生成し、単語帳に自動追加します（重複はスキップ）。
          </p>
        ) : (
          <p className="text-xs text-amber-400 mb-4">
            ⚠️ Step 1 でテーマを設定してからご利用ください。
          </p>
        )}
        <button
          onClick={handleAiGenerate}
          disabled={isGenerating || !topic.trim() || !apiSettings.geminiApiKey}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 glow-cyan"
        >
          {isGenerating ? (
            <><Loader2 size={14} className="animate-spin" /> 生成中...</>
          ) : (
            <><Sparkles size={14} /> AIに関連単語を生成させる</>
          )}
        </button>
        {lastResult && (
          <div className="mt-3 text-xs">
            <span className="text-accent font-semibold">✓ {lastResult.added}語追加</span>
            {lastResult.skipped > 0 && <span className="text-muted-foreground ml-2">{lastResult.skipped}語スキップ（重複）</span>}
          </div>
        )}
        {!apiSettings.geminiApiKey && (
          <p className="mt-2 text-xs text-amber-400">
            ⚠️ <Link href="/settings" className="underline">設定ページ</Link>でGemini APIキーを入力してください。
          </p>
        )}
      </div>

      {/* 手動追加フォーム */}
      <div className="bg-secondary/30 border border-border rounded-xl p-5">
        <h4 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Plus size={16} className="text-accent" />
          単語を手動で追加
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
// Roleplay Scenario Selector (Step 7)
// ============================================================
type ScenarioType = {
  name: string;
  level: string;
  emoji: string;
  aiRole: string;
  userRole: string;
  context: string;
};

function RoleplaySelector({ scenarios }: { scenarios: ScenarioType[] }) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customAiRole, setCustomAiRole] = useState("");
  const [customUserRole, setCustomUserRole] = useState("");
  const [customContext, setCustomContext] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePrompt = (sc: ScenarioType | null, isCustom: boolean) => {
    if (isCustom) {
      if (!customAiRole || !customUserRole) return;
      const prompt = `You are ${customAiRole}. I am ${customUserRole}. ${customContext ? `We are ${customContext}.` : ""} Please start the conversation naturally. If I make grammar mistakes, continue the conversation naturally but correct me gently at the end of each exchange. Keep the conversation going for about 5-10 minutes. After our conversation, please give me detailed feedback on my English.`;
      setGeneratedPrompt(prompt);
    } else if (sc) {
      const prompt = `You are ${sc.aiRole}. I am ${sc.userRole}. We are ${sc.context}. Please start the conversation naturally. If I make grammar mistakes, continue the conversation naturally but correct me gently at the end of each exchange. Keep the conversation going for about 5-10 minutes. After our conversation, please give me detailed feedback on my English.`;
      setGeneratedPrompt(prompt);
    }
  };

  const handleSelectScenario = (sc: ScenarioType) => {
    setSelectedScenario(sc);
    setCustomMode(false);
    generatePrompt(sc, false);
  };

  const handleGenerateCustom = () => {
    generatePrompt(null, true);
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success("プロンプトをコピーしました");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-accent/30">
      <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
        <Zap size={14} className="text-accent" />
        ROLEPLAY SCENARIO
      </h2>

      {/* Preset Scenarios */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-3">プリセットシチュエーションを選択：</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {scenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => handleSelectScenario(sc)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedScenario?.name === sc.name && !customMode
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-background/60 text-foreground hover:border-accent/40"
              }`}
            >
              <div className="text-xl mb-1">{sc.emoji}</div>
              <div className="text-xs font-semibold">{sc.name}</div>
              <div className={`text-xs mt-1 px-1.5 py-0.5 rounded-full inline-block ${
                sc.level === "初級" ? "bg-primary/20 text-primary" :
                sc.level === "中級" ? "bg-amber-500/20 text-amber-400" :
                "bg-destructive/20 text-destructive"
              }`}>{sc.level}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Scenario */}
      <div className="mb-4">
        <button
          onClick={() => { setCustomMode(!customMode); setSelectedScenario(null); setGeneratedPrompt(""); }}
          className={`flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg border ${
            customMode ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
          }`}
        >
          <Pencil size={13} />
          カスタムシチュエーションを作成
        </button>
      </div>

      {customMode && (
        <div className="bg-secondary/30 rounded-lg p-4 border border-border mb-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">AIの役割 *</label>
            <input
              value={customAiRole}
              onChange={e => setCustomAiRole(e.target.value)}
              placeholder="例: a friendly barista at a café in Tokyo"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">あなたの役割 *</label>
            <input
              value={customUserRole}
              onChange={e => setCustomUserRole(e.target.value)}
              placeholder="例: a customer who wants to order a special drink"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">シチュエーションの詳細（任意）</label>
            <input
              value={customContext}
              onChange={e => setCustomContext(e.target.value)}
              placeholder="例: having a conversation about the best coffee brewing methods"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={handleGenerateCustom}
            disabled={!customAiRole || !customUserRole}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 glow-lime"
          >
            <Zap size={13} /> プロンプトを生成
          </button>
        </div>
      )}

      {/* Generated Prompt */}
      {generatedPrompt && (
        <div className="bg-background/60 border border-accent/30 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
            <span className="text-xs text-accent font-mono font-semibold">
              ✓ ChatGPTに貼り付けるプロンプト
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs bg-accent text-accent-foreground px-3 py-1 rounded hover:opacity-90 transition-all"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "コピー済み" : "コピー"}
            </button>
          </div>
          <pre className="px-4 py-3 text-xs text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
            {generatedPrompt}
          </pre>
          <div className="px-4 py-3 border-t border-border bg-secondary/20">
            <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-2 text-xs text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded hover:bg-emerald-500/10 transition-all">
                <ExternalLink size={12} />
                ChatGPTを開いて貼り付ける
              </button>
            </a>
          </div>
        </div>
      )}
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
  const { progress, updateProgress, recordActivity, weeklyTheme, updateWeeklyTheme } = useApp();
  const [showPrompts, setShowPrompts] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [topicInput, setTopicInput] = useState(weeklyTheme.theme || "");

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
      recordActivity();
      toast.success(`Step ${step.id} 完了！`);
    }
  };

  const handleTopicSave = () => {
    updateWeeklyTheme({ theme: topicInput, startDate: new Date().toISOString().split("T")[0] });
    updateProgress({ currentTopic: topicInput });
    toast.success("今週のテーマを設定しました！");
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
              <div className="flex-shrink-0 flex items-center gap-2 flex-wrap">
                {/* AI Chat Toggle */}
                <button
                  onClick={() => setShowAiChat(!showAiChat)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-all ${
                    showAiChat
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <Bot size={12} />
                  {showAiChat ? "AIを閉じる" : "AIに聞く"}
                </button>
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

              {/* Topic Input (Step 1 のみ編集可能) */}
              {step.hasTopicInput && (
                <div className="glass-panel rounded-xl p-5 border border-primary/30 bg-primary/5">
                  <h2 className="font-bold text-sm text-primary uppercase tracking-wider mb-1 font-mono flex items-center gap-2">
                    <Zap size={14} />
                    今週のテーマを設定
                  </h2>
                  <p className="text-xs text-muted-foreground mb-3">ここで設定したテーマがStep 2以降で使われます。</p>
                  <div className="flex gap-2">
                    <input
                      value={topicInput}
                      onChange={e => setTopicInput(e.target.value)}
                      placeholder="例: コーヒー、ランニング、映画鑑賞..."
                      className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <button onClick={handleTopicSave} className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-all glow-cyan">
                      設定する
                    </button>
                  </div>
                  {weeklyTheme.theme && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      現在のテーマ: <span className="text-primary font-semibold">「{weeklyTheme.theme}」</span>
                      {weeklyTheme.startDate && <span className="ml-2">（{weeklyTheme.startDate} 〜）</span>}
                    </div>
                  )}
                </div>
              )}

              {/* Current Theme Display (Step 2以降 — 読み取り専用) */}
              {!step.hasTopicInput && weeklyTheme.theme && (
                <div className="glass-panel rounded-xl p-4 border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-primary" />
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">今週のテーマ</span>
                  </div>
                  <p className="text-base font-bold text-primary mt-1">「{weeklyTheme.theme}」</p>
                  <p className="text-xs text-muted-foreground mt-0.5">テーマの変更は Step 1 で行えます。</p>
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
              {step.hasVocabInput && <VocabInput topic={weeklyTheme.theme || progress.currentTopic} />}

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

              {/* Roleplay Scenario Selector (Step 7) */}
              {step.hasRoleplay && step.scenarios && (
                <RoleplaySelector scenarios={step.scenarios as ScenarioType[]} />
              )}

              {/* AI Chat Panel */}
              {showAiChat && (
                <div className="h-[500px]">
                  <AiChat
                    title={`Step ${step.id} AI アシスタント`}
                    systemPrompt={step.aiSystemPrompt}
                    initialMessage={step.aiInitialMessage}
                    placeholder={step.aiPlaceholder}
                    aiOverride={step.id === 7 ? "chatgpt" : "gemini"}
                    onActivity={recordActivity}
                  />
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

              {/* AI Chat Quick Button */}
              <button
                onClick={() => setShowAiChat(!showAiChat)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border ${
                  showAiChat
                    ? "bg-accent/10 border-accent/40 text-accent"
                    : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                }`}
              >
                <Bot size={16} />
                {showAiChat ? "AIチャットを閉じる" : "AIチャットを開く"}
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
