import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Sparkles, User, Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatWithGemini, type ChatMessage } from "@/lib/mock-ai";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "How does thread density affect fabric quality?",
  "What is the difference between Plain and Twill weave?",
  "How accurate is the computer vision model?",
  "What is ISO 7211-2 standard?",
];

const RESPONSES: Record<string, string> = {
  quality: "Thread density (Threads Per Inch or TPI) is a direct indicator of fabric weight, strength, and hand-feel. Higher thread density generally yields more durable, smoother, and finer fabrics, whereas lower density is common in breathable, lightweight materials like gauze or open linen.",
  weave: "Plain weave is the simplest weave pattern where warp and weft threads cross at right angles (over one, under one), offering high durability. Twill weave has a diagonal rib pattern (like denim's Twill 3/1 or cotton twill's Twill 2/1), providing more flexibility, drape, and soil resistance.",
  accuracy: "ThreadCounty's convolutional computer vision model is benchmarked at 99.8% alignment with laboratory optical microscope counts under standard lighting. We support natural cotton, linen, silk, wool, and synthetics.",
  iso: "ISO 7211-2 specifies methods for the determination of number of threads per unit length in woven fabrics. ThreadCounty's warp and weft count calculations are aligned with these international methods to ensure reports can be used directly for quality assurance.",
  pricing: "We offer Free (5 scans/mo), Student ($9/mo, 50 scans), Professional ($49/mo, 500 scans + batch support), and Enterprise (Unlimited) plans. You can upgrade or downgrade anytime via the pricing page.",
  hello: "Hello! I am your ThreadCounty Textile Assistant. How can I help you analyze fabric integrity today?",
  hi: "Hi there! I am your ThreadCounty Textile Assistant. How can I help you analyze fabric integrity today?",
  default: "I can help with textile science and ThreadCounty features! Try asking about: \n- Weave patterns (plain, twill, satin)\n- Thread count/density (TPI)\n- ISO compliance standards\n- Subscription pricing and plans"
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "bot",
      text: "Welcome to ThreadCounty! I'm your AI Textile Assistant powered by Gemini. Ask me anything about fabric structures, thread density, weave patterns, or how to use the platform.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [geminiHistory, setGeminiHistory] = useState<ChatMessage[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Build Gemini conversation history from UI messages
      const history: ChatMessage[] = geminiHistory;
      const reply = await chatWithGemini(text, history);

      // Update history for next turn
      setGeminiHistory((prev) => [
        ...prev,
        { role: "user", parts: [{ text }] },
        { role: "model", parts: [{ text: reply }] },
      ]);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "bot",
          text: reply,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: "bot",
          text: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-12 items-center gap-2 rounded-full bg-foreground px-4 text-background shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <MessageSquare className="size-5" />
          <span className="text-xs font-semibold tracking-wider uppercase">Textile AI</span>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-brand"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="flex h-[480px] w-[350px] flex-col overflow-hidden rounded-md border border-border bg-card/95 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border bg-foreground px-4 py-3 text-background">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              <div>
                <h3 className="text-xs font-semibold tracking-wider uppercase">Textile Assistant</h3>
                <p className="text-[9px] text-background/60 font-mono">ONLINE · AI ENGINE</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-sm p-1 hover:bg-background/10 text-background/80">
              <X className="size-4" />
            </button>
          </header>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((m) => {
                const isBot = m.sender === "bot";
                return (
                  <div key={m.id} className={`flex gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}>
                    <div className={`grid size-7 shrink-0 place-items-center rounded-sm text-[10px] ${isBot ? "bg-brand/20 text-brand" : "bg-foreground text-background"}`}>
                      {isBot ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                    </div>
                    <div className={`max-w-[75%] rounded-md px-3.5 py-2 text-xs leading-relaxed ${isBot ? "bg-surface text-foreground border border-border" : "bg-foreground text-background"}`}>
                      <p className="whitespace-pre-line">{m.text}</p>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="grid size-7 shrink-0 place-items-center rounded-sm bg-brand/20 text-brand text-[10px]">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="rounded-md border border-border bg-surface px-3.5 py-2.5 text-xs text-muted-foreground flex gap-1 items-center">
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                    <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="mt-6 space-y-2">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Suggested questions</p>
                <div className="space-y-1.5">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="flex w-full items-center justify-between rounded-sm border border-border bg-card px-2.5 py-2 text-left text-[11px] text-muted-foreground hover:border-brand hover:text-foreground transition-colors"
                    >
                      <span>{q}</span>
                      <ArrowRight className="size-3 shrink-0 ml-1 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="border-t border-border p-3 flex gap-2 bg-surface"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="h-9 text-xs rounded-sm border-border bg-card"
            />
            <Button type="submit" size="sm" className="h-9 px-3 rounded-sm bg-foreground text-background hover:bg-foreground/90">
              <Send className="size-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
