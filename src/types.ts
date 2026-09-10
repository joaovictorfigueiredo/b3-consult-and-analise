export interface PortfolioItem {
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  previousClose: number;
  currency: string;
  history?: { date: string; close: number }[];
  isLoading?: boolean;
  isError?: boolean;
}

export interface SimulationParams {
  initialEquity: number;
  monthlyContribution: number;
  years: number;
  annualDividendYield: number;
  annualCapitalGrowth: number;
}

export interface SimulationYearData {
  year: number;
  totalContributed: number;
  projectedEquity: number;
  accumulatedDividends: number;
  monthlyPassiveIncome: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface MarketStock {
  ticker: string;
  name: string;
  price: number;
  previousClose: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  change: number;
  changePercent: number;
  currency: string;
  history?: { date: string; close: number }[];
  source?: string;
  lastUpdated?: string;
}
