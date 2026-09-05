import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Loader2, AlertCircle } from "lucide-react";
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
}

export const AiAssistant = () => {
  // 1. Fetch live shop data silently in the background
  const { data: clients } = useClients();
  const { data: vehicles } = useVehicles();
  const { data: jobs } = useJobs();
  const { data: inventory } = useInventory();

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: "I am connected to your live shop data. Ask me about your inventory, active jobs, or diagnostic procedures." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setError(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError("VITE_GEMINI_API_KEY is missing in your .env file.");
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Compile the live data into a System Prompt
      const systemInstruction = `
        You are Serviqa, an expert automotive mechanic and shop management AI. 
        You provide accurate diagnostic advice (OBD-II codes, torque specs, procedures).
        You also have access to the shop's live database in JSON format below. 
        Use this data to answer questions about inventory, jobs, clients, and vehicles.
        Be concise, professional, and do not reveal the raw JSON structure to the user.

        CRITICAL GUARDRAIL: You are strictly limited to discussing automotive topics, vehicle repairs, and this shop's data. If the user asks about ANY topic outside of automotive repair or shop management (e.g., cooking, politics, general trivia, coding), you MUST refuse to answer. Respond politely by saying: "I am specialized in automotive diagnostics and shop management. I can only assist with vehicle repairs and your shop's data."
        
        LIVE SHOP DATA:
        Clients: ${JSON.stringify(clients)}
        Vehicles: ${JSON.stringify(vehicles)}
        Jobs: ${JSON.stringify(jobs)}
        Inventory: ${JSON.stringify(inventory)}
      `;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3.6-flash",
        systemInstruction 
      });

      // 3. Convert our local message state into Gemini's expected format
      const history = messages.slice(1).map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(userMsg.content);
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "ai", 
        content: result.response.text() 
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: unknown) {
      console.error("AI Error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate a response from Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}><Bot size={28} color="var(--color-primary-600)" /> Shop Assistant</h1>
      </div>

      <div className={styles.chatArea}>
        {error && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", backgroundColor: "#fef2f2", color: "var(--color-danger)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
            <AlertCircle size={20} /><span>{error}</span>
          </div>
        )}
        
        {messages.map((msg) => (
        <div key={msg.id} className={`${styles.messageWrapper} ${msg.role === "user" ? styles.messageUser : styles.messageAi}`}>
            <div className={`${styles.bubble} ${msg.role === "user" ? styles.bubbleUser : styles.bubbleAi}`}>
            {msg.role === "ai" ? (
                <div className={styles.markdown}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
            ) : (
                msg.content
            )}
            </div>
        </div>
        ))}
        
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.messageAi}`}>
            <div className={`${styles.bubble} ${styles.bubbleAi}`}>
              <Loader2 size={20} className="animate-spin" color="var(--color-slate-500)" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="E.g., What does P0420 mean? or Do we have 5W-30 in stock?" className={styles.input} disabled={isLoading} />
          <button type="submit" disabled={!input.trim() || isLoading} className={styles.sendBtn}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};