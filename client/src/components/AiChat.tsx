/*
 * DESIGN: AIコックピット — テック・フューチャリスト
 * AI会話コンポーネント：Gemini / ChatGPT API 直接呼び出し
 * ブラウザから直接APIを叩く（フロントエンドのみ）
 */
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, AlertCircle, Settings, RotateCcw, Copy, Check } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Link } from "wouter";
import { toast } from "sonner";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiChatProps {
  systemPrompt?: string;
  initialMessage?: string;
  placeholder?: string;
  title?: string;
  aiOverride?: "gemini" | "chatgpt";
  onActivity?: () => void;
}

// ── Gemini API ──────────────────────────────────────────────
async function callGemini(apiKey: string, messages: Message[], systemPrompt: string, model = "gemini-2.0-flash-lite"): Promise<string> {
  const GEMINI_MODEL = model;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const contents = messages.map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = { contents };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "(応答なし)";
}

// ── ChatGPT API ─────────────────────────────────────────────
async function callChatGPT(apiKey: string, messages: Message[], systemPrompt: string): Promise<string> {
  const url = "https://api.openai.com/v1/chat/completions";

  const msgs: { role: string; content: string }[] = [];
  if (systemPrompt) msgs.push({ role: "system", content: systemPrompt });
  msgs.push(...messages.map(m => ({ role: m.role, content: m.content })));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: msgs }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `ChatGPT API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "(応答なし)";
}

// ── Message Bubble ──────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} group`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
      }`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={`max-w-[80%] relative ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary/15 border border-primary/20 text-foreground rounded-tr-sm"
            : "bg-secondary/60 border border-border text-foreground rounded-tl-sm"
        }`}>
          {msg.content}
        </div>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function AiChat({
  systemPrompt = "",
  initialMessage = "",
  placeholder = "メッセージを入力...",
  title = "AI アシスタント",
  aiOverride,
  onActivity,
}: AiChatProps) {
  const { apiSettings, recordActivity } = useApp();
  const [messages, setMessages] = useState<Message[]>(() =>
    initialMessage ? [{ role: "assistant", content: initialMessage }] : []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState<"gemini" | "chatgpt">(
    aiOverride ?? apiSettings.preferredAI
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeKey = selectedAI === "gemini" ? apiSettings.geminiApiKey : apiSettings.chatgptApiKey;
  const hasKey = !!activeKey;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !hasKey) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      let reply: string;
      if (selectedAI === "gemini") {
        reply = await callGemini(apiSettings.geminiApiKey, newMessages, systemPrompt, apiSettings.geminiModel || "gemini-2.0-flash-lite");
      } else {
        reply = await callChatGPT(apiSettings.chatgptApiKey, newMessages, systemPrompt);
      }
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      recordActivity();
      onActivity?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      toast.error(msg);
      setMessages(prev => [...prev, { role: "assistant", content: `エラー: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages(initialMessage ? [{ role: "assistant", content: initialMessage }] : []);
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-accent" />
          <span className="text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Selector */}
          {!aiOverride && (
            <div className="flex bg-background/50 rounded-lg p-0.5 border border-border">
              {(["gemini", "chatgpt"] as const).map(ai => (
                <button
                  key={ai}
                  onClick={() => setSelectedAI(ai)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    selectedAI === ai ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ai === "gemini" ? "Gemini" : "ChatGPT"}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleReset}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
            title="会話をリセット"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* No API Key Warning */}
      {!hasKey && (
        <div className="mx-4 mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-xs text-yellow-400 flex items-start gap-2">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>
            {selectedAI === "gemini" ? "Gemini" : "ChatGPT"} のAPIキーが設定されていません。
            <Link href="/settings" className="underline ml-1 hover:text-yellow-300">設定ページ</Link>
            でAPIキーを入力してください。
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Bot size={32} className="mx-auto mb-3 opacity-30" />
            <p>メッセージを送信して会話を始めましょう</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-accent" />
            </div>
            <div className="bg-secondary/60 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 size={14} className="animate-spin text-accent" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-secondary/10">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasKey ? placeholder : "APIキーを設定してください"}
            disabled={!hasKey || loading}
            rows={1}
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none disabled:opacity-50 leading-relaxed"
            style={{ maxHeight: "120px", overflowY: "auto" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || !hasKey}
            className="flex-shrink-0 w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Enter で送信 / Shift+Enter で改行</p>
      </div>
    </div>
  );
}
