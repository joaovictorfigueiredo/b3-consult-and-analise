import React, { useState, useRef, useEffect } from "react";
import { PortfolioItem, ChatMessage } from "../types";
import { Bot, User, Send, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";

interface AiAdvisorTabProps {
  portfolio: PortfolioItem[];
}

export const AiAdvisorTab: React.FC<AiAdvisorTabProps> = ({ portfolio }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 Olá! Sou o seu **Consultor de Investimentos Pessoal com IA Gemini**.\n\n" +
        "Tenho acesso aos dados em tempo real da sua carteira (ativos B3 e internacionais, preços médios e pesos de alocação).\n\n" +
        "Posso te ajudar com:\n" +
        "• **Análise de Risco & Concentração setorial**\n" +
        "• **Impacto Macroeconômico (Taxa Selic, juros dos EUA e inflação)**\n" +
        "• **Diretrizes de Rebalanceamento Estratégico de Longo Prazo**\n" +
        "• **Geração de Renda Passiva e Proventos**\n\n" +
        "*Como posso apoiar a sua tomada de decisão hoje?*",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Construct consolidated portfolio summary string for Gemini context
  const buildPortfolioSummary = () => {
    let totalInvested = 0;
    let totalCurrent = 0;

    const itemsSummary = portfolio.map((item) => {
      const inv = item.quantity * item.avgPrice;
      const cur = item.quantity * (item.currentPrice > 0 ? item.currentPrice : item.avgPrice);
      totalInvested += inv;
      totalCurrent += cur;

      const retPct = item.avgPrice > 0 ? ((item.currentPrice / item.avgPrice) - 1) * 100 : 0;

      return `- ${item.ticker} (${item.name}): ${item.quantity} ações | Preço Médio: R$ ${item.avgPrice.toFixed(2)} | Preço Atual: R$ ${item.currentPrice.toFixed(2)} | Valor Atual: R$ ${cur.toFixed(2)} | Retorno: ${retPct >= 0 ? "+" : ""}${retPct.toFixed(2)}%`;
    });

    const totalPL = totalCurrent - totalInvested;
    const totalPLPct = totalInvested > 0 ? ((totalCurrent / totalInvested) - 1) * 100 : 0;

    return (
      `Patrimônio Total: R$ ${totalCurrent.toFixed(2)}\n` +
      `Total Aportado: R$ ${totalInvested.toFixed(2)}\n` +
      `Lucro/Prejuízo Total: R$ ${totalPL.toFixed(2)} (${totalPLPct.toFixed(2)}%)\n` +
      `Ativos em Custódia:\n${itemsSummary.join("\n")}`
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const summary = buildPortfolioSummary();
      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          portfolioSummary: summary,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta da API: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text || "Não foi possível obter resposta do consultor.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error("Advisor error:", err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "⚠️ **Nota do Consultor:** Não foi possível contactar a API do Gemini neste momento. " +
          "Certifique-se de que a variável `GEMINI_API_KEY` esteja configurada.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-210px)] min-h-[580px]">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          🤖 Assistente de IA Integrado (Google Gemini)
        </h2>
        <p className="text-xs text-gray-400">
          Consultoria estratégica, diagnósticos fundamentalistas e visão macroeconômica baseados na sua carteira
        </p>
      </div>

      {/* Aviso Regulatório de Compliance */}
      <div className="bg-blue-950/40 border border-blue-900/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-200">
        <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Aviso Legal de Suporte à Decisão:</span>{" "}
          Esta inteligência artificial atua exclusivamente como ferramenta analítica e educacional.
          Não são emitidas ordens de compra ou venda direta e as análises não configuram recomendação
          individualizada de investimento nos termos da CVM.
        </div>
      </div>

      {/* Sugestões Rápidas de Prompt */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            label: "🛡️ Análise de Risco e Concentração",
            prompt:
              "Faça um diagnóstico completo de risco e concentração da minha carteira. Quais ativos pesam mais e onde há risco setorial?",
          },
          {
            label: "🏦 Cenário de Juros (Selic & Fed)",
            prompt:
              "Como o atual ciclo de juros (Selic no Brasil e taxas do Fed nos EUA) impacta os ativos presentes na minha carteira?",
          },
          {
            label: "⚖️ Sugestão de Rebalanceamento",
            prompt:
              "Considerando uma filosofia de longo prazo de preservação e crescimento, quais diretrizes de rebalanceamento você sugere para a minha carteira?",
          },
          {
            label: "💰 Avaliação de Dividendos",
            prompt:
              "Avalie a capacidade de geração de dividendos e proventos dos ativos da minha carteira. Quais são as melhores pagadoras?",
          },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => handleSendMessage(item.prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg border border-gray-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-gray-900/80 rounded-2xl border border-gray-800 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isAi = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAi ? "justify-start" : "justify-end"}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isAi
                    ? "bg-gray-950 border border-gray-800 text-gray-200"
                    : "bg-blue-600 text-white shadow-md"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-4 opacity-75 text-[10px]">
                  <span className="font-semibold">
                    {isAi ? "Consultor IA Gemini" : "Você (Investidor)"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap font-sans text-sm">{msg.content}</div>
              </div>
              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 text-xs text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>O Gemini está analisando os dados consolidados da sua carteira...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-2">
        <input
          type="text"
          placeholder="Escreva sua pergunta para o consultor financeiro IA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          className="flex-1 bg-transparent border-0 text-sm text-white placeholder-gray-500 px-3 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
          title="Enviar pergunta"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
