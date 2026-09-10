import React, { useState, useEffect, useRef } from "react";
import { PlusCircle, Trash2, RotateCcw, TrendingUp, HelpCircle, Loader2, Sparkles, Check } from "lucide-react";
import { PortfolioItem } from "../types";

interface SidebarProps {
  portfolio: PortfolioItem[];
  onAddOrUpdate: (ticker: string, quantity: number, avgPrice: number) => void;
  onRemove: (ticker: string) => void;
  onResetDefault: () => void;
  onOpenCode: () => void;
}

// Normaliza ticker da B3
function normalizeTicker(raw: string): string {
  const clean = raw.trim().toUpperCase();
  if (/^[A-Z]{4}(3|4|5|6|11|12|34)$/.test(clean)) {
    return `${clean}.SA`;
  }
  return clean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  portfolio,
  onAddOrUpdate,
  onRemove,
  onResetDefault,
  onOpenCode,
}) => {
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [avgPrice, setAvgPrice] = useState("35.00");
  const [errorMsg, setErrorMsg] = useState("");
  
  // Real-time market price state
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [marketStockName, setMarketStockName] = useState<string>("");
  const [priceAutoFilled, setPriceAutoFilled] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Efeito para buscar cotação da B3 assim que o usuário digita o ticker
  useEffect(() => {
    const raw = ticker.trim().toUpperCase();
    if (!raw || raw.length < 3) {
      setMarketPrice(null);
      setMarketStockName("");
      setPriceAutoFilled(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const normalized = normalizeTicker(raw);
      setIsFetchingPrice(true);
      try {
        const res = await fetch(`/api/stocks/quote?ticker=${encodeURIComponent(normalized)}&range=1mo`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.price > 0) {
            setMarketPrice(data.price);
            setMarketStockName(data.name || normalized);
            // Preenche automaticamente o Preço Médio com o valor atual da B3
            setAvgPrice(data.price.toFixed(2));
            setPriceAutoFilled(true);
          }
        }
      } catch (err) {
        console.warn("Sidebar quote fetch failed:", err);
      } finally {
        setIsFetchingPrice(false);
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [ticker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTicker = normalizeTicker(ticker);
    const qty = parseInt(quantity, 10);
    const price = parseFloat(avgPrice);

    if (!cleanTicker) {
      setErrorMsg("Informe o ticker do ativo.");
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg("A quantidade deve ser maior que zero.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setErrorMsg("O preço médio deve ser maior que zero.");
      return;
    }

    setErrorMsg("");
    onAddOrUpdate(cleanTicker, qty, price);
    setTicker("");
    setMarketPrice(null);
    setMarketStockName("");
    setPriceAutoFilled(false);
  };

  const handleUseCurrentPrice = () => {
    if (marketPrice !== null) {
      setAvgPrice(marketPrice.toFixed(2));
      setPriceAutoFilled(true);
    }
  };

  return (
    <aside className="w-full md:w-80 bg-gray-900 border-r border-gray-800 flex flex-col p-5 text-gray-200 no-print">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-base tracking-tight leading-tight">
            Gestão da Carteira
          </h2>
          <p className="text-xs text-gray-400">B3 & Mercado Global</p>
        </div>
      </div>

      {/* Form Cadastro Ativo com preenchimento automático de cotação */}
      <div className="mt-5 bg-gray-950/60 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-blue-400" /> Cadastrar / Editar Ativo
          </h3>
          {isFetchingPrice && (
            <span className="text-[10px] text-blue-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Buscando B3...
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Ticker do Ativo:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: PETR4, VALE3, ITUB4, AAPL"
                value={ticker}
                onChange={(e) => {
                  setTicker(e.target.value);
                  setPriceAutoFilled(false);
                }}
                className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            
            {marketStockName && marketPrice !== null ? (
              <div className="mt-1.5 p-1.5 bg-blue-950/40 rounded-lg border border-blue-900/50 flex items-center justify-between text-[11px] text-blue-200">
                <span className="truncate max-w-[170px]">🏢 {marketStockName}</span>
                <span className="font-bold text-emerald-400">R$ {marketPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                <HelpCircle className="w-3 h-3 text-gray-500" /> B3 reconhece automático (ex: PETR4)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Qtd Ações:</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <label>Preço Médio:</label>
                {priceAutoFilled && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5" title="Preço captado da cotação atual">
                    <Sparkles className="w-2.5 h-2.5" /> Auto B3
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={avgPrice}
                onChange={(e) => {
                  setAvgPrice(e.target.value);
                  setPriceAutoFilled(false);
                }}
                className={`w-full px-3 py-2 text-sm bg-gray-900 border rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono transition-colors ${
                  priceAutoFilled ? "border-emerald-500/60 bg-emerald-950/10 text-emerald-300 font-bold" : "border-gray-700"
                }`}
                title="Preço médio preenchido com a cotação atual do mercado, aberto para você editar se desejar"
              />
            </div>
          </div>

          {/* Aviso e botão para restaurar cotação se editado */}
          {marketPrice !== null && (
            <div className="text-[11px] text-gray-400 flex items-center justify-between bg-gray-900/90 p-2 rounded-lg border border-gray-800">
              <span className="text-gray-400">
                Mercado: <strong className="text-white">R$ {marketPrice.toFixed(2)}</strong>
              </span>
              {parseFloat(avgPrice) !== marketPrice && (
                <button
                  type="button"
                  onClick={handleUseCurrentPrice}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline text-[10px] cursor-pointer"
                >
                  Usar Cotação Atual
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-900/50">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            Salvar na Carteira
          </button>
        </form>
      </div>

      {/* Quick Ativos Cadastrados */}
      <div className="mt-5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Posições ({portfolio.length})
          </span>
          <button
            onClick={onResetDefault}
            title="Restaurar carteira modelo"
            className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Restaurar
          </button>
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {portfolio.map((item) => (
            <div
              key={item.ticker}
              className="flex items-center justify-between px-3 py-2 bg-gray-950/40 rounded-lg border border-gray-800 text-xs hover:border-gray-700 transition-colors"
            >
              <div>
                <span className="font-bold text-white">{item.ticker}</span>
                <span className="text-gray-400 ml-2">
                  {item.quantity} un. @ R$ {item.avgPrice.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => onRemove(item.ticker)}
                className="text-gray-400 hover:text-red-400 transition-colors p-1 cursor-pointer"
                title={`Remover ${item.ticker}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* VS Code & Python Banner */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-900/50 rounded-xl p-3">
          <p className="text-xs text-blue-200 font-semibold mb-1 flex items-center gap-1.5">
            🐍 Rodar no VS Code (Streamlit)
          </p>
          <p className="text-[11px] text-gray-400 mb-2">
            Código completo disponível em <code>app.py</code>.
          </p>
          <button
            onClick={onOpenCode}
            className="w-full py-1.5 px-3 rounded-lg bg-blue-700/60 hover:bg-blue-600/80 text-blue-100 text-xs font-medium transition-colors border border-blue-500/40 cursor-pointer text-center block"
          >
            Ver Código Python (app.py)
          </button>
        </div>
      </div>
    </aside>
  );
};
