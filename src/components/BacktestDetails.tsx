"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  AlertTriangle,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Award,
} from "lucide-react";
import { BacktestResult } from "@/types";
import { getScoreColor, getScoreBadge } from "@/lib/scoring";

interface BacktestDetailsProps {
  backtest: BacktestResult;
  onClose: () => void;
}

export function BacktestDetails({ backtest, onClose }: BacktestDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getProfitColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const calculateAdditionalMetrics = () => {
    const avgWin =
      backtest.winningTrades > 0 ? backtest.profit / backtest.winningTrades : 0;
    const avgLoss =
      backtest.losingTrades > 0
        ? Math.abs(backtest.profit - backtest.winningTrades * avgWin) /
          backtest.losingTrades
        : 0;
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
    const expectancy =
      (backtest.winRate / 100) * avgWin -
      (1 - backtest.winRate / 100) * avgLoss;
    const sharpeRatio =
      backtest.profit > 0 && backtest.maxDrawdown > 0
        ? backtest.profit / backtest.maxDrawdown
        : 0;

    return {
      avgWin,
      avgLoss,
      riskRewardRatio,
      expectancy,
      sharpeRatio,
    };
  };

  const metrics = calculateAdditionalMetrics();

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col text-zinc-100">
        <div className="flex items-center justify-between p-6 border-b border-zinc-700">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">
              {backtest.eaName}
            </h2>
            <p className="text-zinc-400">
              {backtest.symbol} • {backtest.fileName}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700"
          >
            Cerrar
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-4 bg-zinc-800 border-b border-zinc-700">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 text-zinc-400"
              >
                Resumen
              </TabsTrigger>
              <TabsTrigger
                value="metrics"
                className="data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 text-zinc-400"
              >
                Métricas
              </TabsTrigger>
              <TabsTrigger
                value="trades"
                className="data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 text-zinc-400"
              >
                Operaciones
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                className="data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 text-zinc-400"
              >
                Análisis
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="overview" className="space-y-6">
                {/* Score Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Score del Backtest
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div
                          className={`text-4xl font-bold ${getScoreColor(
                            backtest.score
                          )}`}
                        >
                          {backtest.score.toFixed(2)}
                        </div>
                        <Badge variant="outline">
                          {getScoreBadge(backtest.score)}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <Progress
                          value={backtest.score * 100}
                          className="h-3"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          Score basado en win rate, profit factor, drawdown y
                          otras métricas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Beneficio Total
                        </span>
                      </div>
                      <div
                        className={`text-2xl font-bold ${getProfitColor(
                          backtest.profit
                        )}`}
                      >
                        {formatCurrency(backtest.profit)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatPercent(
                          (backtest.profit / backtest.initialBalance) * 100
                        )}{" "}
                        del capital inicial
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Win Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPercent(backtest.winRate)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {backtest.winningTrades} de {backtest.totalTrades}{" "}
                        operaciones
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">
                          Profit Factor
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {backtest.profitFactor.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Ratio ganancias/pérdidas
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">
                          Max Drawdown
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatPercent(backtest.maxDrawdownPercent)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(backtest.maxDrawdown)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Chart Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Rendimiento del Capital
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">
                        Gráfico de rendimiento (próximamente)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Trading Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Métricas de Trading
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Total Operaciones
                          </div>
                          <div className="text-lg font-bold">
                            {backtest.totalTrades}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Operaciones Ganadoras
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {backtest.winningTrades}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Operaciones Perdedoras
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            {backtest.losingTrades}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Win Rate
                          </div>
                          <div className="text-lg font-bold">
                            {formatPercent(backtest.winRate)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Métricas de Riesgo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Max Drawdown
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            {formatPercent(backtest.maxDrawdownPercent)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Recovery Factor
                          </div>
                          <div className="text-lg font-bold">
                            {backtest.recoveryFactor.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Consecutive Wins
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {backtest.consecutiveWins}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Consecutive Losses
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            {backtest.consecutiveLosses}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Advanced Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Métricas Avanzadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Avg Win
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(metrics.avgWin)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Avg Loss
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            {formatCurrency(metrics.avgLoss)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Risk/Reward Ratio
                          </div>
                          <div className="text-lg font-bold">
                            {metrics.riskRewardRatio.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Expectancy
                          </div>
                          <div
                            className={`text-lg font-bold ${getProfitColor(
                              metrics.expectancy
                            )}`}
                          >
                            {formatCurrency(metrics.expectancy)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Capital Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Métricas de Capital
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Capital Inicial
                          </div>
                          <div className="text-lg font-bold">
                            {formatCurrency(backtest.initialBalance)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Capital Final
                          </div>
                          <div className="text-lg font-bold">
                            {formatCurrency(backtest.finalBalance)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            ROI
                          </div>
                          <div
                            className={`text-lg font-bold ${getProfitColor(
                              (backtest.profit / backtest.initialBalance) * 100
                            )}`}
                          >
                            {formatPercent(
                              (backtest.profit / backtest.initialBalance) * 100
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Expected Payoff
                          </div>
                          <div
                            className={`text-lg font-bold ${getProfitColor(
                              backtest.expectedPayoff
                            )}`}
                          >
                            {formatCurrency(backtest.expectedPayoff)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trades" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Operaciones del Backtest ({backtest.trades?.length ||
                        0}{" "}
                      operaciones)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {backtest.trades && backtest.trades.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Volumen</TableHead>
                              <TableHead>Precio</TableHead>
                              <TableHead>SL</TableHead>
                              <TableHead>TP</TableHead>
                              <TableHead>Beneficio</TableHead>
                              <TableHead>Balance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {backtest.trades.map((trade, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {trade.number}
                                </TableCell>
                                <TableCell>{trade.openTime}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    {trade.order}
                                  </Badge>
                                </TableCell>
                                <TableCell>{trade.volume}</TableCell>
                                <TableCell>
                                  {trade.openPrice.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  {trade.sl > 0 ? trade.sl.toFixed(2) : "-"}
                                </TableCell>
                                <TableCell>
                                  {trade.tp > 0 ? trade.tp.toFixed(2) : "-"}
                                </TableCell>
                                <TableCell
                                  className={getProfitColor(trade.profit)}
                                >
                                  {formatCurrency(trade.profit)}
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(trade.balance)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <BarChart3 className="h-8 w-8 text-gray-400" />
                          <p className="text-gray-500">
                            No se pudieron extraer operaciones individuales
                          </p>
                          <p className="text-sm text-gray-400">
                            Verifica que el archivo HTML contenga la tabla de
                            operaciones
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Performance Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Análisis de Rendimiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Consistencia</span>
                          <Badge
                            variant={
                              backtest.winRate >= 60
                                ? "default"
                                : backtest.winRate >= 40
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {backtest.winRate >= 60
                              ? "Excelente"
                              : backtest.winRate >= 40
                              ? "Buena"
                              : "Baja"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Rentabilidad</span>
                          <Badge
                            variant={
                              backtest.profitFactor >= 2
                                ? "default"
                                : backtest.profitFactor >= 1.5
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {backtest.profitFactor >= 2
                              ? "Alta"
                              : backtest.profitFactor >= 1.5
                              ? "Media"
                              : "Baja"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Gestión de Riesgo</span>
                          <Badge
                            variant={
                              backtest.maxDrawdownPercent <= 10
                                ? "default"
                                : backtest.maxDrawdownPercent <= 20
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {backtest.maxDrawdownPercent <= 10
                              ? "Excelente"
                              : backtest.maxDrawdownPercent <= 20
                              ? "Buena"
                              : "Alta"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Recomendaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {backtest.winRate < 50 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                              <strong>Win Rate bajo:</strong> Considera mejorar
                              la estrategia de entrada
                            </p>
                          </div>
                        )}
                        {backtest.profitFactor < 1.5 && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800">
                              <strong>Profit Factor bajo:</strong> Revisa la
                              gestión de riesgo y salidas
                            </p>
                          </div>
                        )}
                        {backtest.maxDrawdownPercent > 20 && (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                            <p className="text-sm text-orange-800">
                              <strong>Drawdown alto:</strong> Reduce el tamaño
                              de posición
                            </p>
                          </div>
                        )}
                        {backtest.consecutiveLosses > 5 && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                              <strong>Racha de pérdidas:</strong> Implementa
                              stop loss más estricto
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
