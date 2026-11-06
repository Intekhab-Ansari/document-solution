"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  ArrowRight,
  Bot,
  User,
  ShieldCheck,
  Minimize2,
  Maximize2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Zap,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { queryAssistant, AssistantResponse } from "@/lib/ai/assistant-engine";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  timestamp: Date;
  text?: string;
  response?: AssistantResponse;
}

export function AiAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initial = queryAssistant("");
      setMessages([
        {
          id: "welcome",
          sender: "assistant",
          timestamp: new Date(),
          response: initial,
        },
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Listen for custom "open-ai-assistant" event
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      setIsOpen(true);
      setIsMinimized(false);

      if (customEvent.detail?.query) {
        handleUserQuery(customEvent.detail.query);
      }
    };

    window.addEventListener("open-ai-assistant", handleOpenEvent);
    return () => window.removeEventListener("open-ai-assistant", handleOpenEvent);
  }, []);

  // Global keyboard shortcut: Ctrl+J / Cmd+J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setIsMinimized(false);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleUserQuery = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      timestamp: new Date(),
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    // Provide instant client-side response with slight organic latency feel
    setTimeout(() => {
      const assistantResp = queryAssistant(trimmed);
      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "assistant",
        timestamp: new Date(),
        response: assistantResp,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 280);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUserQuery(inputQuery);
  };

  const handleLaunchTool = (href: string, isExternal?: boolean) => {
    if (isExternal) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
      // Auto-minimize on small screens so user sees the newly opened workspace
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  const handleClearHistory = () => {
    const initial = queryAssistant("");
    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        timestamp: new Date(),
        response: initial,
      },
    ]);
  };

  return (
    <>
      {/* Floating Bottom-Left Trigger Pill (Clean & Refined SaaS Style) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-40 group flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-full bg-zinc-900/95 hover:bg-zinc-850 border border-zinc-750 hover:border-zinc-600 text-zinc-300 hover:text-white shadow-lg shadow-black/40 hover:shadow-xl transition-all cursor-pointer backdrop-blur-md active:scale-95 border-zinc-800 hover:border-zinc-700"
          title="Open IntekEdit AI Assistant (Ctrl + J)"
          aria-label="Open AI Assistant"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Bot className="w-3.5 h-3.5" />
          </div>

          <span className="text-xs font-medium whitespace-nowrap">
            Ask AI
          </span>

          <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50 text-zinc-400">
            Ctrl+J
          </kbd>
        </button>
      )}

      {/* Main AI Assistant Floating Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 ease-out flex flex-col ${
            isMinimized
              ? "bottom-4 left-4 sm:bottom-6 sm:left-6 w-72 sm:w-80 h-14 rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/40 bg-zinc-950/95 backdrop-blur-2xl"
              : "bottom-3 sm:bottom-6 left-3 sm:left-6 w-[calc(100vw-24px)] sm:w-[480px] max-h-[88vh] h-[640px] rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(16,185,129,0.2)] border border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl ring-1 ring-white/10"
          }`}
        >
          {/* Radiant Top Glow Line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shrink-0" />

          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/60 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                    IntekEdit AI Copilot
                  </h2>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 uppercase tracking-wider shrink-0">
                    Client AI
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  100% On-Device Engine • Zero Uploads
                </p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title={isMinimized ? "Expand window" : "Minimize window"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Close AI Assistant (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Visible when not minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 scrollbar-none text-xs sm:text-[13px]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    {/* User Message Bubble */}
                    {msg.sender === "user" ? (
                      <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-md">
                        {msg.text}
                      </div>
                    ) : (
                      /* Assistant Message Card */
                      <div className="max-w-[95%] space-y-3">
                        <div className="p-3.5 sm:p-4 rounded-2xl rounded-tl-sm bg-zinc-900/90 border border-zinc-800/90 text-zinc-200 shadow-md space-y-2.5">
                          {/* Title */}
                          {msg.response?.title && (
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                              <h3 className="font-bold text-white text-xs sm:text-sm">
                                {msg.response.title}
                              </h3>
                            </div>
                          )}

                          {/* Message Body */}
                          <p className="text-zinc-300 leading-relaxed">
                            {msg.response?.message}
                          </p>

                          {/* Steps List */}
                          {msg.response?.steps && msg.response.steps.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                                Recommended Steps:
                              </span>
                              <div className="space-y-1">
                                {msg.response.steps.map((step, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-zinc-300 text-xs">
                                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pro Tips */}
                          {msg.response?.tips && msg.response.tips.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300/90 text-[11px] space-y-1">
                              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Pro Tip
                              </span>
                              {msg.response.tips.map((tip, idx) => (
                                <p key={idx} className="text-zinc-300">
                                  {tip}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Primary Action Button (Direct Field Launcher) */}
                          {msg.response?.action && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleLaunchTool(
                                    msg.response!.action!.href,
                                    msg.response!.action!.isExternal
                                  )
                                }
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer group bg-gradient-to-r ${
                                  msg.response.action.accentClass || "from-emerald-500 to-teal-500"
                                } active:scale-95`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <Zap className="w-4 h-4 fill-white shrink-0 group-hover:scale-110 transition-transform" />
                                  <span className="truncate">{msg.response.action.label}</span>
                                </span>

                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  {msg.response.action.badge && (
                                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-black/30 font-bold">
                                      {msg.response.action.badge}
                                    </span>
                                  )}
                                  {msg.response.action.isExternal ? (
                                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                  ) : (
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                  )}
                                </div>
                              </button>
                            </div>
                          )}

                          {/* Secondary Quick Action Buttons */}
                          {msg.response?.secondaryActions && msg.response.secondaryActions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {msg.response.secondaryActions.map((sec, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleLaunchTool(sec.href, sec.isExternal)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white border border-zinc-700/50 text-[11px] font-medium transition-colors cursor-pointer"
                                >
                                  <span>{sec.label}</span>
                                  <ChevronRight className="w-3 h-3 text-zinc-500" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quick Follow-Up Chips */}
                        {msg.response?.quickFollowUps && msg.response.quickFollowUps.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {msg.response.quickFollowUps.map((prompt, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleUserQuery(prompt)}
                                className="px-2.5 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-300 border border-zinc-800 hover:border-emerald-500/40 text-[11px] transition-all cursor-pointer"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Animated Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl rounded-tl-sm bg-zinc-900/70 border border-zinc-800/80 w-fit text-zinc-400 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    <span>Analyzing your request and configuring tool...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-zinc-800/80 bg-zinc-950 shrink-0">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask or command (e.g. 'Compress to 150KB', 'Edit text')..."
                    className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-emerald-500/50 rounded-xl pl-3.5 pr-11 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim()}
                    className="absolute right-1.5 p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-sm"
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-zinc-500 font-mono">
                  <span>Press Enter to send</span>
                  <span className="flex items-center gap-1 text-emerald-400/80">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Private Memory Sandbox
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

