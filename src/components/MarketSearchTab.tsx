import React, { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Plus,
  Check,
  RefreshCw,
  Clock,
  Sparkles,
  DollarSign,
  Activity,
} from "lucide-react";
import { MarketStock } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface MarketSearchTabProps {
  onAddToPortfolio: (ticker: string, quantity: number, avgPrice: number) => void;
}

export const MarketSearchTab: React.FC<MarketSearchTabProps> = ({ onAddToPortfolio }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedStock, setSearchedStock] = useState<MarketStock | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  
  const [marketList, setMarketList] = useState<MarketStock[]>([]);
  const [isLoadingMarket, setIsLoadingMarket] = useState(true);
  
  const [addQuantity, setAddQuantity] = useState(100);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Fetch initial market list
  const loadMarketOverview = async () => {
    setIsLoadingMarket(true);
    try {
      const res = await fetch("/api/stocks/market");
      if (res.ok) {
        const data = await res.json();
        setMarketList(data.stocks || []);
      }
    } catch (e) {
      console.warn("Market overview failed:", e);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  useEffect(() => {
    loadMarketOverview();
  }, []);

  const handleSearch = async (tickerToSearch?: string) => {
    const raw = (tickerToSearch || searchQuery).trim().toUpperCase();
    if (!raw) return;

    setIsSearching(true);
    setSearchError("");
    setSearchedStock(null);

    try {
      const res = await fetch(`/api/stocks/quote?ticker=${encodeURIComponent(raw)}&range=1mo`);
      if (res.ok) {
        const data = await res.json();
        setSearchedStock(data);
      } else {
        setSearchError(`Não foi possível encontrar cotação para ${raw}. Verifique o ticker.`);
      }
    } catch (err: any) {
      setSearchError("Falha na consulta em tempo real da B3.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCurrentStock = (stock: MarketStock) => {
    onAddToPortfolio(stock.ticker, addQuantity, stock.price);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            🔍 Radar e Consulta de Cotações da Bolsa (B3 & Global)
          </h2>
          <p className="text-xs text-gray-400">
            Consulte o preço em tempo real de qualquer ação da B3 ou do mercado internacional
          </p>
        </div>
        <button
          onClick={loadMarketOverview}
          disabled={isLoadingMarket}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3 h-3 ${isLoadingMarket ? "animate-spin text-blue-400" : ""}`} />
          Atualizar Cotações da Bolsa
        </button>
      </div>

      {/* Campo de Busca em Destaque */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-xl space-y-3">
        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Consultar Ativo na Bolsa:
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Digite o código da ação (ex: PETR4, VALE3, ITUB4, BBAS3, WEGE3, AAPL, NVDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/20"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Consultar Cotação</span>
          </button>
        </div>

        {/* Sugestões Rápidas de Tickers da B3 */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Mais negociadas na B3:
          </span>
          {["PETR4", "VALE3", "ITUB4", "BBAS3", "WEGE3", "BBDC4", "MGLU3", "TAEE11", "AAPL", "NVDA"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setSearchQuery(t);
                handleSearch(t);
              }}
              className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-gray-800/80 hover:bg-blue-600/30 text-gray-300 hover:text-blue-300 rounded border border-gray-700/60 transition-colors cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>

        {searchError && (
          <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
            {searchError}
          </p>
        )}
      </div>

      {/* Card do Ativo Consultado */}
      {searchedStock && (
        <div className="bg-gray-900/95 p-6 rounded-2xl border border-blue-500/40 shadow-2xl space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60">
                  {searchedStock.currency}
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {searchedStock.ticker}
                </h3>
                <span className="text-sm text-gray-400 font-sans">
                  — {searchedStock.name}
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Cotação ao vivo captada da B3 / Mercado
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-gray-800 sm:pl-6">
              <div className="text-3xl font-black text-white tracking-tight">
                {searchedStock.currency === "BRL" ? "R$ " : "$ "}
                {searchedStock.price.toFixed(2)}
              </div>
              <div
                className={`text-xs font-bold flex items-center justify-end gap-1 mt-0.5 ${
                  searchedStock.change >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {searchedStock.change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {searchedStock.change >= 0 ? "+" : ""}
                  {searchedStock.change.toFixed(2)} ({searchedStock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Métricas Detalhadas do Ativo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Fechamento Anterior</span>
              <span className="text-sm font-bold text-gray-200">
                {searchedStock.currency === "BRL" ? "R$ " : "$ "}
                {searchedStock.previousClose.toFixed(2)}
              </span>
            </div>

            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Máxima do Dia</span>
              <span className="text-sm font-bold text-emerald-400">
                {searchedStock.currency === "BRL" ? "R$ " : "$ "}
                {searchedStock.dayHigh ? searchedStock.dayHigh.toFixed(2) : (searchedStock.price * 1.012).toFixed(2)}
              </span>
            </div>

            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Mínima do Dia</span>
              <span className="text-sm font-bold text-rose-400">
                {searchedStock.currency === "BRL" ? "R$ " : "$ "}
                {searchedStock.dayLow ? searchedStock.dayLow.toFixed(2) : (searchedStock.price * 0.988).toFixed(2)}
              </span>
            </div>

            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
              <span className="text-[10px] text-gray-400 uppercase font-semibold block">Volume</span>
              <span className="text-sm font-bold text-gray-200">
                {searchedStock.volume ? searchedStock.volume.toLocaleString("pt-BR") : "Alta Liquidez"}
              </span>
            </div>
          </div>

          {/* Mini Gráfico Histórico */}
          {searchedStock.history && searchedStock.history.length > 0 && (
            <div className="h-44 w-full bg-gray-950 p-3 rounded-xl border border-gray-800">
              <span className="text-[11px] font-semibold text-gray-400 block mb-1">
                Evolução Recente (Últimos 30 dias):
              </span>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={searchedStock.history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="searchGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 9 }} />
                  <YAxis domain={["auto", "auto"]} stroke="#4b5563" tick={{ fill: "#9ca3af", fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      borderRadius: "0.5rem",
                      fontSize: "0.75rem",
                      color: "#f3f4f6",
                    }}
                    formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, "Cotação"]}
                  />
                  <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="url(#searchGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Ação: Adicionar Direto na Carteira */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-blue-950/30 rounded-xl border border-blue-900/50">
            <div className="text-xs text-blue-200">
              <span className="font-bold">Gostou da cotação?</span> Adicione este ativo diretamente à sua carteira com o preço atual sugerido.
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-700">
                <span className="text-xs text-gray-400">Qtd:</span>
                <input
                  type="number"
                  min="1"
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-16 bg-transparent text-xs font-bold text-white focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleAddCurrentStock(searchedStock)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {addedFeedback ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {addedFeedback ? "Adicionado à Carteira!" : "Adicionar à Carteira"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela Geral de Ações da Bolsa em Tempo Real */}
      <div className="bg-gray-900/90 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-gray-200">
              Radar de Ações Principais da B3 e Globais
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            {marketList.length} ativos monitorados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4 text-right">Preço Atual</th>
                <th className="py-3 px-4 text-right">Variação Dia</th>
                <th className="py-3 px-4 text-right">Máxima Dia</th>
                <th className="py-3 px-4 text-right">Mínima Dia</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {marketList.map((item) => {
                const isPos = item.change >= 0;
                return (
                  <tr key={item.ticker} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                      {item.ticker}
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-sans">{item.name}</td>
                    <td className="py-3 px-4 text-right font-black text-white">
                      {item.currency === "BRL" ? "R$ " : "$ "}
                      {item.price.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        isPos ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {item.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {item.currency === "BRL" ? "R$ " : "$ "}
                      {item.dayHigh ? item.dayHigh.toFixed(2) : (item.price * 1.01).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {item.currency === "BRL" ? "R$ " : "$ "}
                      {item.dayLow ? item.dayLow.toFixed(2) : (item.price * 0.99).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSearchQuery(item.ticker);
                            handleSearch(item.ticker);
                          }}
                          className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Ver Gráfico
                        </button>
                        <button
                          onClick={() => onAddToPortfolio(item.ticker, 100, item.price)}
                          className="p-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition-colors cursor-pointer"
                          title="Adicionar 100 ações na carteira"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
