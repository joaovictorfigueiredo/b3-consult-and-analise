import React, { useState } from "react";
import { PortfolioItem } from "../types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface PortfolioOverviewProps {
  portfolio: PortfolioItem[];
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
  onRefreshQuotes: () => void;
  isRefreshing: boolean;
  selectedRange: string;
  onChangeRange: (range: string) => void;
}

const PIE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  portfolio,
  selectedTicker,
  onSelectTicker,
  onRefreshQuotes,
  isRefreshing,
  selectedRange,
  onChangeRange,
}) => {
  // Financial computations
  let totalInvested = 0;
  let totalCurrentValue = 0;

  const enrichedItems = portfolio.map((item) => {
    const invested = item.quantity * item.avgPrice;
    const current = item.quantity * (item.currentPrice > 0 ? item.currentPrice : item.avgPrice);
    const plValue = current - invested;
    const plPercent = item.avgPrice > 0 ? ((item.currentPrice / item.avgPrice) - 1) * 100 : 0;

    totalInvested += invested;
    totalCurrentValue += current;

    return {
      ...item,
      invested,
      current,
      plValue,
      plPercent,
    };
  });

  const totalPL = totalCurrentValue - totalInvested;
  const totalPLPercent = totalInvested > 0 ? ((totalCurrentValue / totalInvested) - 1) * 100 : 0;
  const isPositivePL = totalPL >= 0;

  // Selected item data for line chart
  const activeItem = enrichedItems.find((i) => i.ticker === selectedTicker) || enrichedItems[0];
  const historyData = activeItem?.history || [];

  // Pie chart data
  const pieData = enrichedItems.map((i) => ({
    name: i.ticker,
    value: Math.max(0, i.current),
  }));

  return (
    <div className="space-y-6">
      {/* Top Bar with Refresh & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            📊 Visão Geral da Carteira
          </h2>
          <p className="text-xs text-gray-400">
            Cálculo automático de cotações, patrimônio líquido e indicadores delta de rentabilidade
          </p>
        </div>
        <button
          onClick={onRefreshQuotes}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors disabled:opacity-50 cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
          {isRefreshing ? "Atualizando via yfinance..." : "Atualizar Cotações"}
        </button>
      </div>

      {/* 4 Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Patrimônio Total */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            <span>Patrimônio Atual</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            R$ {totalCurrentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-blue-400 font-medium mt-2 flex items-center gap-1">
            <span>💼 {portfolio.length} ativos em custódia</span>
          </div>
        </div>

        {/* Card 2: Total Investido */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            <span>Total Aportado</span>
            <span className="text-[11px] font-normal text-gray-400">Preço Médio</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 font-medium mt-2">
            Custo total de aquisição
          </div>
        </div>

        {/* Card 3: Lucro / Prejuízo R$ */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            <span>Lucro / Prejuízo (R$)</span>
            {isPositivePL ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              isPositivePL ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositivePL ? "+" : ""}R${" "}
            {totalPL.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div
            className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
              isPositivePL ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            <span>{isPositivePL ? "▲ Valorização positiva" : "▼ Retração do capital"}</span>
          </div>
        </div>

        {/* Card 4: Rentabilidade Geral % */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-5 rounded-2xl border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            <span>Rentabilidade Total</span>
            <span className="text-[11px] font-normal text-gray-400">% Carteira</span>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              isPositivePL ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositivePL ? "+" : ""}
            {totalPLPercent.toFixed(2)}%
          </div>
          <div
            className={`text-xs font-semibold mt-2 ${
              isPositivePL ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            Retorno acumulado sobre o capital
          </div>
        </div>
      </div>

      {/* Tabela de Posições */}
      <div className="bg-gray-900/90 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-200">
            Posições Individuais na B3 e Mercado Global
          </h3>
          <span className="text-xs text-gray-400">
            Clique em um ativo para carregar o gráfico histórico
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4 text-right">Qtd</th>
                <th className="py-3 px-4 text-right">Preço Médio</th>
                <th className="py-3 px-4 text-right">Preço Atual</th>
                <th className="py-3 px-4 text-right">Total Investido</th>
                <th className="py-3 px-4 text-right">Valor Atual</th>
                <th className="py-3 px-4 text-right">Lucro/Prejuízo</th>
                <th className="py-3 px-4 text-right">Retorno %</th>
                <th className="py-3 px-4 text-right">Peso %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {enrichedItems.map((item) => {
                const isSelected = item.ticker === selectedTicker;
                const itemPLPos = item.plValue >= 0;
                const weight = totalCurrentValue > 0 ? (item.current / totalCurrentValue) * 100 : 0;

                return (
                  <tr
                    key={item.ticker}
                    onClick={() => onSelectTicker(item.ticker)}
                    className={`cursor-pointer transition-colors hover:bg-blue-950/20 ${
                      isSelected ? "bg-blue-950/40 border-l-4 border-blue-500 font-medium" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                      {item.ticker}
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-sans max-w-[140px] truncate">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-200">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      R$ {item.avgPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      R$ {item.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      R$ {item.invested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-white">
                      R$ {item.current.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        itemPLPos ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {itemPLPos ? "+" : ""}R${" "}
                      {itemPLValueFormat(item.plValue)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        itemPLPos ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {itemPLPos ? "+" : ""}
                      {item.plPercent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300">
                      {weight.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção Gráfica: Gráfico de Linha + Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Linha Interativo do Ativo Selecionado */}
        <div className="lg:col-span-2 bg-gray-900/90 p-5 rounded-2xl border border-gray-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">
                  Histórico de Cotações: {activeItem?.ticker} ({activeItem?.name})
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Preço Atual: R$ {activeItem?.currentPrice.toFixed(2)} • Seu Preço Médio: R${" "}
                {activeItem?.avgPrice.toFixed(2)}
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800 w-fit">
              {[
                { label: "1 Mês", value: "1mo" },
                { label: "3 Meses", value: "3mo" },
                { label: "6 Meses", value: "6mo" },
                { label: "1 Ano", value: "1y" },
                { label: "2 Anos", value: "2y" },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => onChangeRange(r.value)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    selectedRange === r.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            {historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#4b5563"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    tickFormatter={(val) => {
                      const parts = val.split("-");
                      return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : val;
                    }}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    stroke="#4b5563"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    tickFormatter={(val) => `R$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                      color: "#f3f4f6",
                    }}
                    formatter={(val: any) => [`R$ ${Number(val).toFixed(2)}`, "Cotação"]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  {activeItem?.avgPrice && (
                    <ReferenceLine
                      y={activeItem.avgPrice}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{
                        value: `P.M. R$ ${activeItem.avgPrice.toFixed(2)}`,
                        fill: "#f59e0b",
                        fontSize: 10,
                        position: "insideBottomRight",
                      }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#priceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">Carregando histórico do ativo {activeItem?.ticker}...</p>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico Donut de Alocação */}
        <div className="bg-gray-900/90 p-5 rounded-2xl border border-gray-800 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <PieChartIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Alocação por Ativo</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Proporção de cada ativo no patrimônio total da carteira
          </p>

          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke="#111827"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#374151",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                    color: "#f3f4f6",
                  }}
                  formatter={(val: any) => [
                    `R$ ${Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    "Valor Atual",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-2 max-h-28 overflow-y-auto">
            {enrichedItems.map((item, idx) => (
              <div key={item.ticker} className="flex items-center gap-1.5 text-[11px] text-gray-300">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="font-bold">{item.ticker}:</span>
                <span className="text-gray-400">
                  {totalCurrentValue > 0 ? ((item.current / totalCurrentValue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function itemPLValueFormat(val: number): string {
  return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
