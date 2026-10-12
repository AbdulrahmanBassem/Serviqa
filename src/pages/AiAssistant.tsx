import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Bot, 
  Send, 
  Loader2, 
  AlertCircle, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useClients } from "../features/clients/api/clientHooks";
import { useVehicles } from "../features/vehicles/api/vehicleHooks";
import { useJobs } from "../features/jobs/api/jobHooks";
import { useInventory } from "../features/inventory/api/inventoryHooks";
import styles from "./AiAssistant.module.css";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp?: string;
}

const PROMPT_SUGGESTIONS = [
  { label: "Diagnose OBD-II P0420", prompt: "What are the common causes and diagnostic steps for OBD-II code P0420 (Catalyst System Efficiency Below Threshold)?" },
  { label: "Check low stock parts", prompt: "Which parts in our inventory are currently low or out of stock?" },
  { label: "Summarize active jobs", prompt: "Can you provide a summary of all active repairs currently underway in our shop?" },
  { label: "Jobs waiting for parts", prompt: "Which jobs are currently stalled or waiting for parts to arrive?" },
  { label: "Torque spec & fluid advice", prompt: "What are general safety torque specifications for lug nuts and cylinder head bolts?" }
];

const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
const getCurrentTimestamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const AiAssistant = () => {
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { data: jobs } = useJobs();
  const { data: inventory } = useInventory();

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1", 
      role: "ai", 
      content: "Hello! I am **Serviqa AI**, your intelligent automotive diagnostic partner and shop management assistant. I am synchronized with your live repairs, vehicle fleet, client records, and parts inventory. How can I help you today?",
      timestamp: "12:00 PM"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm("Clear this conversation history?")) {
      setMessages([
        { 
          id: generateMessageId(), 
          role: "ai", 
          content: "Chat cleared. I am ready for your next diagnostic or shop query.",
          timestamp: getCurrentTimestamp()
        }
      ]);
    }
  };

  const executePrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    setError(null);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      setError("VITE_GEMINI_API_KEY is missing in your .env file.");
      return;
    }

    const nowStr = getCurrentTimestamp();
    const userMsg: Message = { 
      id: generateMessageId(), 
      role: "user", 
      content: promptText.trim(),
      timestamp: nowStr
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const systemInstruction = `
        You are Serviqa AI, a master automotive diagnostic technician and enterprise shop management expert.
        You provide pinpoint diagnostic advice (OBD-II trouble codes, wiring checks, torque specs, service procedures).
        You also have direct access to this shop's live database in JSON format below.
        Use this data to accurately answer questions regarding inventory levels, active jobs, client records, and registered vehicles.
        Format your answers cleanly using Markdown (bold headings, bullet points, code blocks for specs/codes, and tables when comparing data).
        
        CRITICAL GUARDRAIL: You are strictly limited to discussing automotive topics, vehicle repairs, and this shop's data. If the user asks about ANY topic outside of automotive repair or shop management, politely decline and steer them back to vehicle service and shop operations.
        
        LIVE SHOP DATA:
        Clients (${clients?.length || 0}): ${JSON.stringify(clients || [])}
        Vehicles (${vehicles?.length || 0}): ${JSON.stringify(vehicles || [])}
        Jobs (${jobs?.length || 0}): ${JSON.stringify(jobs || [])}
        Inventory (${inventory?.length || 0}): ${JSON.stringify(inventory || [])}
      `;

      const genAI = new GoogleGenerativeAI(apiKey);
      // Attempt gemini-1.5-flash with fallback
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.6-flash", 
        systemInstruction 
      });

      const history = messages.slice(1).map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(userMsg.content);
      
      const aiMsg: Message = { 
        id: generateMessageId(), 
        role: "ai", 
        content: result.response.text(),
        timestamp: getCurrentTimestamp()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: unknown) {
      console.error("AI Error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate a response from Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executePrompt(input);
  };

  return (
    <div className={styles.container}>
      {/* Header with Title and Live Sync Pill */}
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.botIconWrapper}>
            <Bot size={22} />
          </div>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Mechanic AI Copilot</h1>
            <span className={styles.subtitle}>Automotive diagnostics & workshop intelligence</span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.contextPill} title="Connected to active shop database">
            <span className={styles.pulseDot} />
            <span>
              {jobs?.length || 0} Jobs • {vehicles?.length || 0} Fleet • {inventory?.length || 0} Parts
            </span>
          </div>

          <button 
            onClick={handleClearChat} 
            className={styles.clearBtn} 
            title="Reset chat conversation"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className={styles.chatArea}>
        {error && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", backgroundColor: "#fef2f2", color: "var(--color-danger)", padding: "0.85rem 1rem", borderRadius: "var(--radius-lg)", border: "1px solid #fecaca" }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Suggestion Prompts Strip */}
        {messages.length <= 2 && (
          <div className={styles.suggestionContainer}>
            <span className={styles.suggestionLabel}>Suggested Mechanic Prompts</span>
            <div className={styles.chipsWrapper}>
              {PROMPT_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  className={styles.chipBtn}
                  onClick={() => executePrompt(item.prompt)}
                  disabled={isLoading}
                >
                  <Sparkles size={12} color="var(--color-primary-500)" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`${styles.messageWrapper} ${msg.role === "user" ? styles.messageUser : styles.messageAi}`}
          >
            <div className={`${styles.bubble} ${msg.role === "user" ? styles.bubbleUser : styles.bubbleAi}`}>
              {msg.role === "ai" ? (
                <>
                  <div className={styles.markdown}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <div className={styles.bubbleFooter}>
                    <button 
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className={`${styles.copyBtn} ${copiedId === msg.id ? styles.copyBtnSuccess : ""}`}
                      title="Copy response to clipboard"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={12} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.messageAi}`}>
            <div className={`${styles.bubble} ${styles.bubbleAi}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Loader2 size={18} className="animate-spin" color="var(--color-primary-600)" />
              <span style={{ fontSize: "0.85rem", color: "var(--color-slate-500)", fontStyle: "italic" }}>
                Analyzing workshop database and diagnostic references...
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask about torque specs, trouble codes, or current stock..." 
            className={styles.input} 
            disabled={isLoading} 
            aria-label="Ask AI Assistant"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading} 
            className={styles.sendBtn}
            title="Send prompt"
            aria-label="Send prompt"
          >
            <Send size={18} style={{ transform: "translateX(-1px)" }} />
          </button>
        </form>
      </div>
    </div>
  );
};