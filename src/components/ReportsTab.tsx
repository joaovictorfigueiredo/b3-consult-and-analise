import React, { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Calendar, TrendingUp, DollarSign, Award, ArrowUpRight, Printer } from "lucide-react";
import { SimulationYearData } from "../types";

interface ReportsTabProps {
  currentPortfolioValue: number;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ currentPortfolioValue }) => {
  const [initialEquity, setInitialEquity] = useState(
    currentPortfolioValue > 0 ? Math.round(currentPortfolioValue) : 10000
  );
  const [monthlyContribution, setMonthlyContribution] = useState(1500);
  const [years, setYears] = useState(10);
  const [annualDY, setAnnualDY] = useState(6.5);
  const [annualGrowth, setAnnualGrowth] = useState(8.0);

  // Simulation engine
  const totalMonths = years * 12;
  const annualTotalReturnRate = (annualDY + annualGrowth) / 100;
  const monthlyTotalRate = Math.pow(1 + annualTotalReturnRate, 1 / 12) - 1;
  const monthlyDYRate = Math.pow(1 + annualDY / 100, 1 / 12) - 1;

  let currentBalance = initialEquity;
  let totalContributed = initialEquity;
  let accumulatedDividends = 0;

  const yearDataList: SimulationYearData[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    // Dividends for the month
    const divMonth = currentBalance * monthlyDYRate;
    accumulatedDividends += divMonth;

    // Total growth (capital growth + reinvested dividends) + monthly contribution
    currentBalance = currentBalance * (1 + monthlyTotalRate) + monthlyContribution;
    totalContributed += monthlyContribution;

    if (m % 12 === 0 || m === totalMonths) {
      const yr = Math.ceil(m / 12);
      yearDataList.push({
        year: yr,
        totalContributed: Math.round(totalContributed),
        projectedEquity: Math.round(currentBalance),
        accumulatedDividends: Math.round(accumulatedDividends),
        monthlyPassiveIncome: Math.round((currentBalance * (annualDY / 100)) / 12),
      });
    }
  }

  const finalYear = yearDataList[yearDataList.length - 1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print-only Executive Header */}
      <div className="print-only mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Relatório Executivo de Desempenho & Projeção Financeira
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          B3 & Global Invest Advisor • Data de Emissão: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-700 bg-gray-100 p-3 rounded">
          <div><strong>Patrimônio Inicial:</strong> R$ {initialEquity.toLocaleString("pt-BR")}</div>
          <div><strong>Aporte Mensal:</strong> R$ {monthlyContribution.toLocaleString("pt-BR")}</div>
          <div><strong>Horizonte:</strong> {years} Anos (DY: {annualDY}% | Valorização: {annualGrowth}%)</div>
        </div>
      </div>

      {/* Screen Header with Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            📈 Relatórios Mensais e Anuais & Simulador de Aportes
          </h2>
          <p className="text-xs text-gray-400">
            Consolidação de desempenho financeiro com simulação de fechamentos de períodos, valorização e efeito dos juros compostos com dividendos
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer w-fit"
          title="Imprimir relatório ou salvar como PDF"
        >
          <Printer className="w-4 h-4" />
          <span>🖨️ Imprimir Relatório / Salvar em PDF</span>
        </button>
      </div>

      {/* Simulator Inputs & Key Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator Controls */}
        <div className="bg-gray-900/90 p-5 rounded-2xl border border-gray-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">Parâmetros da Projeção</h3>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Patrimônio Inicial (R$):
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={initialEquity}
              onChange={(e) => setInitialEquity(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Aporte Mensal Planejado (R$):
            </label>
            <input
              type="number"
              min="0"
              step="200"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-gray-950 border border-gray-700 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Horizonte de Tempo:</span>
              <span className="font-bold text-blue-400">{years} Anos</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Dividend Yield Anual Médio (%):</span>
              <span className="font-bold text-emerald-400">{annualDY}% a.a.</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="0.5"
              value={annualDY}
              onChange={(e) => setAnnualDY(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Valorização Anual de Capital (%):</span>
              <span className="font-bold text-amber-400">{annualGrowth}% a.a.</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={annualGrowth}
              onChange={(e) => setAnnualGrowth(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
          </div>

          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 text-[11px] text-gray-400">
            <span className="font-bold text-gray-300">Retorno Total Composto:</span> {(annualDY + annualGrowth).toFixed(1)}% ao ano
          </div>
        </div>

        {/* Projection Chart & Summary Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900 p-4 rounded-xl border border-emerald-900/40">
              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                Patrimônio Projetado
              </div>
              <div className="text-xl font-black text-white">
                R$ {finalYear.projectedEquity.toLocaleString("pt-BR")}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Efeito Juros Compostos
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-950/40 to-gray-900 p-4 rounded-xl border border-blue-900/40">
              <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
                Total em Aportes
              </div>
              <div className="text-xl font-black text-white">
                R$ {finalYear.totalContributed.toLocaleString("pt-BR")}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Capital desembolsado
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-950/40 to-gray-900 p-4 rounded-xl border border-amber-900/40">
              <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                Renda Mensal Passiva
              </div>
              <div className="text-xl font-black text-amber-300">
                R$ {finalYear.monthlyPassiveIncome.toLocaleString("pt-BR")}/mês
              </div>
              <div className="text-[11px] text-amber-400 mt-1">
                Com base no DY estimado
              </div>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="bg-gray-900/90 p-5 rounded-2xl border border-gray-800 shadow-xl">
            <h3 className="font-bold text-sm text-white mb-1">
              Curva de Acumulação Patrimonial vs Aportes
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Comparativo entre o dinheiro aportado do seu bolso e a multiplicação pelo reinvestimento de proventos
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={yearDataList}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <XAxis
                    dataKey="year"
                    stroke="#4b5563"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    tickFormatter={(val) => `Ano ${val}`}
                  />
                  <YAxis
                    stroke="#4b5563"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `R$ ${(val / 1000000).toFixed(1)}M`
                        : `R$ ${(val / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                      color: "#f3f4f6",
                    }}
                    formatter={(val: any, name: any) => [
                      `R$ ${Number(val).toLocaleString("pt-BR")}`,
                      name === "projectedEquity"
                        ? "Patrimônio Projetado"
                        : name === "totalContributed"
                        ? "Total Aportado"
                        : "Dividendos Acumulados",
                    ]}
                    labelFormatter={(label) => `Ano ${label}`}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    formatter={(val) =>
                      val === "projectedEquity"
                        ? "Patrimônio Total"
                        : val === "totalContributed"
                        ? "Total Aportado"
                        : "Dividendos Reinvestidos"
                    }
                  />
                  <Bar
                    dataKey="totalContributed"
                    fill="#374151"
                    radius={[4, 4, 0, 0]}
                    name="totalContributed"
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedEquity"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#10b981" }}
                    name="projectedEquity"
                  />
                  <Line
                    type="monotone"
                    dataKey="accumulatedDividends"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    name="accumulatedDividends"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Fechamentos Anuais */}
      <div className="bg-gray-900/90 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-bold text-sm text-gray-200">
            Tabela de Fechamentos Anuais da Projeção Financeira
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Período</th>
                <th className="py-3 px-4 text-right">Total Aportado</th>
                <th className="py-3 px-4 text-right">Dividendos Acumulados</th>
                <th className="py-3 px-4 text-right">Patrimônio Acumulado</th>
                <th className="py-3 px-4 text-right">Renda Passiva Mensal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {yearDataList.map((item) => (
                <tr key={item.year} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">Ano {item.year}</td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    R$ {item.totalContributed.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-right text-amber-400 font-semibold">
                    R$ {item.accumulatedDividends.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                    R$ {item.projectedEquity.toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-300 font-semibold">
                    R$ {item.monthlyPassiveIncome.toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
