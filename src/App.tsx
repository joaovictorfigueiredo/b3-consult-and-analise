import React, { useState, useEffect } from "react";
import { PortfolioItem } from "./types";
import { Sidebar } from "./components/Sidebar";
import { PortfolioOverview } from "./components/PortfolioOverview";
import { ReportsTab } from "./components/ReportsTab";
import { AiAdvisorTab } from "./components/AiAdvisorTab";
import { MarketSearchTab } from "./components/MarketSearchTab";
import { PythonCodeModal } from "./components/PythonCodeModal";
import {
  LayoutDashboard,
  FileBarChart2,
  Bot,
  Code2,
  TrendingUp,
  Download,
  Search,
} from "lucide-react";

const INITIAL_PORTFOLIO: PortfolioItem[] = [
  {
    ticker: "PETR4.SA",
    name: "Petrobras PN",
    quantity: 100,
    avgPrice: 32.5,
    currentPrice: 38.45,
    previousClose: 38.2,
    currency: "BRL",
  },
  {
    ticker: "VALE3.SA",
    name: "Vale ON",
    quantity: 80,
    avgPrice: 62.0,
    currentPrice: 58.2,
    previousClose: 58.5,
    currency: "BRL",
  },
  {
    ticker: "ITUB4.SA",
    name: "Itaú Unibanco PN",
    quantity: 150,
    avgPrice: 30.2,
    currentPrice: 35.6,
    previousClose: 35.4,
    currency: "BRL",
  },
  {
    ticker: "WEGE3.SA",
    name: "WEG ON",
    quantity: 60,
    avgPrice: 48.0,
    currentPrice: 52.8,
    previousClose: 52.3,
    currency: "BRL",
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    quantity: 10,
    avgPrice: 185.0,
    currentPrice: 232.5,
    previousClose: 230.1,
    currency: "USD",
  },
];

export default function App() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem("b3_portfolio");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PORTFOLIO;
  });

  const [activeTab, setActiveTab] = useState<"overview" | "market" | "reports" | "advisor">("overview");
  const [selectedTicker, setSelectedTicker] = useState<string>("PETR4.SA");
  const [selectedRange, setSelectedRange] = useState<string>("1y");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem("b3_portfolio", JSON.stringify(portfolio));
  }, [portfolio]);

  // Fetch prices for a ticker
  const fetchQuote = async (ticker: string, range: string = "1y") => {
    try {
      const res = await fetch(`/api/stocks/quote?ticker=${encodeURIComponent(ticker)}&range=${range}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn(`Failed to fetch quote for ${ticker}:`, e);
    }
    return null;
  };

  // Refresh all quotes
  const refreshAllQuotes = async () => {
    setIsRefreshing(true);
    const updated = await Promise.all(
      portfolio.map(async (item) => {
        const quote = await fetchQuote(item.ticker, item.ticker === selectedTicker ? selectedRange : "1y");
        if (quote) {
          return {
            ...item,
            name: quote.name || item.name,
            currentPrice: quote.price || item.currentPrice,
            previousClose: quote.previousClose || item.previousClose,
            history: quote.history || item.history,
            currency: quote.currency || item.currency,
          };
        }
        return item;
      })
    );
    setPortfolio(updated);
    setIsRefreshing(false);
  };

  // Initial load quotes & history
  useEffect(() => {
    refreshAllQuotes();
  }, []);

  // Update history when selectedTicker or selectedRange changes
  useEffect(() => {
    let isMounted = true;
    const loadSelectedHistory = async () => {
      const quote = await fetchQuote(selectedTicker, selectedRange);
      if (quote && isMounted) {
        setPortfolio((prev) =>
          prev.map((item) =>
            item.ticker === selectedTicker
              ? {
                  ...item,
                  currentPrice: quote.price || item.currentPrice,
                  history: quote.history,
                }
              : item
          )
        );
      }
    };
    loadSelectedHistory();
    return () => {
      isMounted = false;
    };
  }, [selectedTicker, selectedRange]);

  const handleAddOrUpdate = async (ticker: string, quantity: number, avgPrice: number) => {
    const existingIndex = portfolio.findIndex((i) => i.ticker === ticker);
    const quote = await fetchQuote(ticker, "1y");

    const newItem: PortfolioItem = {
      ticker,
      name: quote?.name || ticker,
      quantity,
      avgPrice,
      currentPrice: quote?.price || avgPrice,
      previousClose: quote?.previousClose || avgPrice,
      currency: quote?.currency || (ticker.includes(".SA") ? "BRL" : "USD"),
      history: quote?.history,
    };

    if (existingIndex >= 0) {
      const copy = [...portfolio];
      copy[existingIndex] = newItem;
      setPortfolio(copy);
    } else {
      setPortfolio([...portfolio, newItem]);
    }
    setSelectedTicker(ticker);
  };

  const handleRemove = (ticker: string) => {
    const updated = portfolio.filter((i) => i.ticker !== ticker);
    setPortfolio(updated);
    if (selectedTicker === ticker && updated.length > 0) {
      setSelectedTicker(updated[0].ticker);
    }
  };

  const handleResetDefault = () => {
    setPortfolio(INITIAL_PORTFOLIO);
    setSelectedTicker(INITIAL_PORTFOLIO[0].ticker);
  };

  // Calculate current total portfolio value for the simulator
  const currentTotalValue = portfolio.reduce(
    (acc, curr) => acc + curr.quantity * (curr.currentPrice > 0 ? curr.currentPrice : curr.avgPrice),
    0
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-gray-800 bg-gray-900/95 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 font-bold text-base">
            📈
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base sm:text-lg tracking-tight flex items-center gap-2">
              B3 & Global Invest Advisor
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/50 text-blue-300 border border-blue-700/50">
                Streamlit + yfinance + Gemini AI
              </span>
            </h1>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Consultor e analisador pessoal de ações da B3 e mercado internacional
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowCodeModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Código Python (app.py)</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar + Tabbed Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          portfolio={portfolio}
          onAddOrUpdate={handleAddOrUpdate}
          onRemove={handleRemove}
          onResetDefault={handleResetDefault}
          onOpenCode={() => setShowCodeModal(true)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Streamlit-styled Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 bg-gray-900 p-1.5 rounded-xl border border-gray-800 w-fit no-print">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Visão Geral da Carteira</span>
            </button>

            <button
              onClick={() => setActiveTab("market")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "market"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>🔍 Consultar Ações (B3 & Global)</span>
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "reports"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileBarChart2 className="w-3.5 h-3.5" />
              <span>Relatórios (com Impressão)</span>
            </button>

            <button
              onClick={() => setActiveTab("advisor")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "advisor"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Assistente IA Gemini</span>
            </button>
          </div>

          {/* Active Tab Views */}
          {activeTab === "overview" && (
            <PortfolioOverview
              portfolio={portfolio}
              selectedTicker={selectedTicker}
              onSelectTicker={setSelectedTicker}
              onRefreshQuotes={refreshAllQuotes}
              isRefreshing={isRefreshing}
              selectedRange={selectedRange}
              onChangeRange={setSelectedRange}
            />
          )}

          {activeTab === "market" && (
            <MarketSearchTab
              onAddToPortfolio={(ticker, qty, price) => {
                handleAddOrUpdate(ticker, qty, price);
                setActiveTab("overview");
              }}
            />
          )}

          {activeTab === "reports" && (
            <ReportsTab currentPortfolioValue={currentTotalValue} />
          )}

          {activeTab === "advisor" && <AiAdvisorTab portfolio={portfolio} />}
        </main>
      </div>

      {/* Code Modal for app.py & VS Code instructions */}
      <PythonCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </div>
  );
}
