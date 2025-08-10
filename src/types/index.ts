export interface Trade {
  number: string;
  openTime: string;
  order: string;
  volume: number;
  openPrice: number;
  sl: number;
  tp: number;
  profit: number;
  balance: number;
}

export interface BacktestResult {
  id: string;
  symbol: string;
  eaName: string;
  fileName: string;
  uploadDate: Date;

  // Métricas básicas
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;

  // Métricas de rendimiento
  initialBalance: number;
  finalBalance: number;
  profit: number;
  profitFactor: number;
  expectedPayoff: number;

  // Métricas de riesgo
  maxDrawdown: number;
  maxDrawdownPercent: number;
  consecutiveWins: number;
  consecutiveLosses: number;

  // Métricas adicionales
  sharpeRatio: number;
  recoveryFactor: number;
  riskRewardRatio: number;

  // Score calculado
  score: number;

  // Datos adicionales
  trades?: Trade[];
  rawData?: string;
}

export interface Symbol {
  id: string;
  name: string;
  description?: string;
  backtests: BacktestResult[];
  createdAt: Date;
}

export interface EA {
  id: string;
  name: string;
  symbol: string;
  backtests: BacktestResult[];
  averageScore: number;
  bestScore: number;
  totalBacktests: number;
  comment?: string;
}

export interface ScoreWeights {
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  sharpeRatio: number;
  recoveryFactor: number;
  riskRewardRatio: number;
}
