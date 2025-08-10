import { BacktestResult, ScoreWeights } from "@/types";

export const DEFAULT_WEIGHTS: ScoreWeights = {
  winRate: 0.2,
  profitFactor: 0.2,
  maxDrawdown: 0.2,
  consecutiveWins: 0.15,
  consecutiveLosses: 0.15,
  sharpeRatio: 0.0,
  recoveryFactor: 0.1,
  riskRewardRatio: 0.0,
};

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export function calculateScore(
  backtest: BacktestResult,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): number {
  // Normalizar métricas
  const normalizedWinRate = backtest.winRate / 100; // Convertir porcentaje a decimal
  const normalizedProfitFactor = Math.min(backtest.profitFactor / 5, 1); // Normalizar a 5 como máximo
  const normalizedMaxDrawdown = 1 - backtest.maxDrawdownPercent / 100; // Invertir (menor es mejor)
  const normalizedConsecutiveWins = Math.min(backtest.consecutiveWins / 20, 1); // Normalizar a 20 como máximo
  const normalizedConsecutiveLosses =
    1 - Math.min(backtest.consecutiveLosses / 10, 1); // Invertir (menor es mejor)
  const normalizedSharpeRatio = Math.min(
    Math.max(backtest.sharpeRatio / 3, 0),
    1
  ); // Normalizar a 3 como máximo
  const normalizedRecoveryFactor = Math.min(backtest.recoveryFactor / 10, 1); // Normalizar a 10 como máximo
  const normalizedRiskRewardRatio = Math.min(backtest.riskRewardRatio / 3, 1); // Normalizar a 3 como máximo

  // Calcular score ponderado
  const score =
    normalizedWinRate * weights.winRate +
    normalizedProfitFactor * weights.profitFactor +
    normalizedMaxDrawdown * weights.maxDrawdown +
    normalizedConsecutiveWins * weights.consecutiveWins +
    normalizedConsecutiveLosses * weights.consecutiveLosses +
    normalizedSharpeRatio * weights.sharpeRatio +
    normalizedRecoveryFactor * weights.recoveryFactor +
    normalizedRiskRewardRatio * weights.riskRewardRatio;

  return Math.round(score * 100) / 100; // Redondear a 2 decimales
}

export function getScoreColor(score: number): string {
  if (score >= 0.8) return "text-green-600";
  if (score >= 0.6) return "text-blue-600";
  if (score >= 0.4) return "text-yellow-600";
  return "text-red-600";
}

export function getScoreBadge(score: number): string {
  if (score >= 0.8) return "Excelente";
  if (score >= 0.6) return "Bueno";
  if (score >= 0.4) return "Regular";
  return "Pobre";
}

export function calculateEAStats(backtests: BacktestResult[]) {
  if (backtests.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      totalBacktests: 0,
    };
  }

  const scores = backtests.map((b) => b.score);
  const averageScore =
    scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const bestScore = Math.max(...scores);

  return {
    averageScore: Math.round(averageScore * 100) / 100,
    bestScore: Math.round(bestScore * 100) / 100,
    totalBacktests: backtests.length,
  };
}
