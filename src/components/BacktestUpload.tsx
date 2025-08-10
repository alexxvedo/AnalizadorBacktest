"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { BacktestResult } from "@/types";

interface BacktestUploadProps {
  open: boolean;
  onClose: () => void;
}

export function BacktestUpload({ open, onClose }: BacktestUploadProps) {
  const { state, dispatch } = useApp();
  const [eaName, setEaName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugContent, setDebugContent] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);

    // Leer el contenido del archivo para debug
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setDebugContent(content.substring(0, 2000)); // Primeros 2000 caracteres
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/html") {
      handleFileSelect(file);
    }
  };

  const parseMT4Report = async (
    file: File
  ): Promise<Partial<BacktestResult>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, "text/html");

          const extractNumber = (text: string): number => {
            const cleanText = text.replace(/[^\d.,-]/g, "");
            const normalizedText = cleanText.replace(",", ".");
            return parseFloat(normalizedText) || 0;
          };

          const findInTable = (searchText: string): string => {
            const tables = doc.querySelectorAll("table");
            for (let i = 0; i < tables.length; i++) {
              const table = tables[i];
              const rows = table.querySelectorAll("tr");
              for (let j = 0; j < rows.length; j++) {
                const row = rows[j];
                const cells = row.querySelectorAll("td");
                for (let k = 0; k < cells.length; k++) {
                  const cell = cells[k];
                  if (cell.textContent?.includes(searchText)) {
                    const parent = cell.parentElement;
                    if (parent) {
                      const children = Array.from(parent.children);
                      const index = children.indexOf(cell);
                      if (index < children.length - 1) {
                        const nextElement = children[index + 1];
                        return nextElement.textContent?.trim() || "0";
                      }
                    }
                  }
                }
              }
            }
            return "0";
          };

          const extractTrades = () => {
            const trades: any[] = [];
            const tables = doc.querySelectorAll("table");

            for (let i = 0; i < tables.length; i++) {
              const table = tables[i];
              const rows = table.querySelectorAll("tr");

              // Buscar la tabla de operaciones (que tiene encabezados específicos)
              let isTradeTable = false;

              for (let j = 0; j < rows.length; j++) {
                const row = rows[j];
                const cells = row.querySelectorAll("td");
                if (cells.length > 0) {
                  const firstCell = cells[0].textContent?.trim();
                  if (firstCell === "#") {
                    // Found the trade table
                    isTradeTable = true;
                    break;
                  }
                }
              }

              if (isTradeTable) {
                for (let j = 1; j < rows.length; j++) {
                  // Skip header row
                  const row = rows[j];
                  const cells = row.querySelectorAll("td");

                  if (cells.length >= 10) {
                    // Minimum cells for basic trade data + profit + balance
                    const trade: any = {
                      number: cells[0]?.textContent?.trim(),
                      openTime: cells[1]?.textContent?.trim(),
                      // No usamos el tipo del informe porque está mal
                      order: cells[3]?.textContent?.trim(),
                      volume: extractNumber(cells[4]?.textContent || ""),
                      openPrice: extractNumber(cells[5]?.textContent || ""),
                      sl: extractNumber(cells[6]?.textContent || ""),
                      tp: extractNumber(cells[7]?.textContent || ""),
                      profit: extractNumber(
                        cells[cells.length - 2]?.textContent || ""
                      ), // Assuming profit is second to last
                      balance: extractNumber(
                        cells[cells.length - 1]?.textContent || ""
                      ), // Assuming balance is last
                    };

                    // Solo agregar operaciones con ganancia o pérdida (operaciones completadas)
                    if (trade.profit !== 0) {
                      trades.push(trade);
                    }
                  }
                }
                break; // Found and processed trade table, exit
              }
            }
            return trades;
          };

          // Extraer métricas usando findInTable
          const totalTradesText =
            findInTable("Total de transacciones") ||
            findInTable("Total Trades");
          const winningTradesText =
            findInTable("Transacciones rentables") ||
            findInTable("Profitable Trades");
          const losingTradesText =
            findInTable("Transacciones perdedoras") ||
            findInTable("Loss Trades");
          const winRateText =
            findInTable("Porcentaje de rentabilidad") ||
            findInTable("Profit Factor");
          const initialBalanceText =
            findInTable("Depósito inicial") || findInTable("Initial Deposit");
          const finalBalanceText =
            findInTable("Balance final") || findInTable("Final Balance");
          const totalProfitText =
            findInTable("Beneficio total") || findInTable("Total Profit");
          const profitFactorText =
            findInTable("Factor de beneficio") || findInTable("Profit Factor");
          const maxDrawdownText =
            findInTable("Máximo retroceso") || findInTable("Maximum Drawdown");
          const maxDrawdownPercentText =
            findInTable("Máximo retroceso %") ||
            findInTable("Maximum Drawdown %");
          const consecutiveWinsText =
            findInTable("Ganancia máxima consecutiva") ||
            findInTable("Maximum Consecutive Wins");
          const consecutiveLossesText =
            findInTable("Pérdida máxima consecutiva") ||
            findInTable("Maximum Consecutive Losses");

          // Extraer valores numéricos
          const totalTrades = extractNumber(totalTradesText);
          const winningTrades = extractNumber(winningTradesText);
          const losingTrades = extractNumber(losingTradesText);
          const winRate = extractNumber(winRateText);
          let initialBalance = extractNumber(initialBalanceText);
          if (initialBalance <= 0) {
            initialBalance = 10000;
          }
          const finalBalance = extractNumber(finalBalanceText);
          const totalProfit = extractNumber(totalProfitText);
          const profitFactor = extractNumber(profitFactorText);
          let maxDrawdown = extractNumber(maxDrawdownText);
          let maxDrawdownPercent = extractNumber(maxDrawdownPercentText);
          const consecutiveWins = extractNumber(consecutiveWinsText);
          const consecutiveLosses = extractNumber(consecutiveLossesText);

          // Extraer operaciones individuales (solo las que tienen ganancia/pérdida)
          const trades = extractTrades();

          // Calcular estadísticas basadas únicamente en operaciones válidas
          const actualWinningTrades = trades.filter(
            (trade) => trade.profit > 0
          ).length;
          const actualLosingTrades = trades.filter(
            (trade) => trade.profit < 0
          ).length;
          const actualTotalTrades = actualWinningTrades + actualLosingTrades;

          // Calcular win rate basado en operaciones válidas
          let calculatedWinRate = 0;
          if (actualTotalTrades > 0) {
            calculatedWinRate = (actualWinningTrades / actualTotalTrades) * 100;
          }

          // Calcular profit total basado en operaciones válidas
          let calculatedProfit = trades.reduce(
            (sum, trade) => sum + trade.profit,
            0
          );

          // Calcular balance final basado en operaciones válidas
          let calculatedFinalBalance = initialBalance + calculatedProfit;

          // Calcular profit factor basado en operaciones válidas
          let calculatedProfitFactor = 0;
          if (actualTotalTrades > 0) {
            const totalWinningAmount = trades
              .filter((trade) => trade.profit > 0)
              .reduce((sum, trade) => sum + trade.profit, 0);
            const totalLosingAmount = Math.abs(
              trades
                .filter((trade) => trade.profit < 0)
                .reduce((sum, trade) => sum + trade.profit, 0)
            );
            calculatedProfitFactor =
              totalLosingAmount > 0
                ? totalWinningAmount / totalLosingAmount
                : 0;
          }

          // Calcular consecutivas (máximo de ganancias y pérdidas seguidas)
          let maxConsecutiveWins = 0;
          let maxConsecutiveLosses = 0;
          let currentConsecutiveWins = 0;
          let currentConsecutiveLosses = 0;

          for (const trade of trades) {
            if (trade.profit > 0) {
              currentConsecutiveWins++;
              currentConsecutiveLosses = 0;
              if (currentConsecutiveWins > maxConsecutiveWins) {
                maxConsecutiveWins = currentConsecutiveWins;
              }
            } else if (trade.profit < 0) {
              currentConsecutiveLosses++;
              currentConsecutiveWins = 0;
              if (currentConsecutiveLosses > maxConsecutiveLosses) {
                maxConsecutiveLosses = currentConsecutiveLosses;
              }
            }
          }

          // Calcular Sharpe Ratio
          let calculatedSharpeRatio = 0;
          if (actualTotalTrades > 0) {
            const returns = trades.map(
              (trade) => trade.profit / initialBalance
            );
            const meanReturn =
              returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
            const variance =
              returns.reduce(
                (sum, ret) => sum + Math.pow(ret - meanReturn, 2),
                0
              ) / returns.length;
            const stdDev = Math.sqrt(variance);

            if (stdDev > 0) {
              calculatedSharpeRatio = meanReturn / stdDev;
            }
          }

          // Calcular max drawdown desde la curva de equity
          let maxEquity = initialBalance;
          let maxCalculatedDrawdown = 0;
          let maxCalculatedDrawdownPercent = 0;

          for (const trade of trades) {
            const currentEquity = trade.balance;

            if (currentEquity > maxEquity) {
              maxEquity = currentEquity;
            }

            const currentDrawdown = maxEquity - currentEquity;
            if (currentDrawdown > maxCalculatedDrawdown) {
              maxCalculatedDrawdown = currentDrawdown;
              if (maxEquity > 0) {
                maxCalculatedDrawdownPercent =
                  (maxCalculatedDrawdown / maxEquity) * 100;
              }
            }
          }

          // Usar el drawdown calculado si el extraído es 0 o menor
          if (maxDrawdown <= 0 && maxCalculatedDrawdown > 0) {
            maxDrawdown = maxCalculatedDrawdown;
            maxDrawdownPercent = maxCalculatedDrawdownPercent;
          }

          const result: Partial<BacktestResult> = {
            id: Date.now().toString(),
            symbol: state.selectedSymbol, // Uses selected symbol ID
            eaName: eaName.trim(),
            fileName: file.name,
            uploadDate: new Date(),

            // Métricas básicas
            totalTrades: actualTotalTrades, // Use actual total trades
            winningTrades: actualWinningTrades, // Use actual winning trades
            losingTrades: actualLosingTrades, // Use actual losing trades
            winRate: calculatedWinRate,

            // Métricas de rendimiento
            initialBalance,
            finalBalance: calculatedFinalBalance,
            profit: calculatedProfit,
            profitFactor: calculatedProfitFactor,
            expectedPayoff: calculatedProfit / actualTotalTrades || 0,

            // Métricas de riesgo
            maxDrawdown: maxDrawdown,
            maxDrawdownPercent: maxDrawdownPercent,
            consecutiveWins: maxConsecutiveWins,
            consecutiveLosses: maxConsecutiveLosses,

            // Métricas adicionales
            sharpeRatio: calculatedSharpeRatio, // Use potentially calculated value
            recoveryFactor: calculatedProfit / maxDrawdown || 0,
            riskRewardRatio: 0, // TODO: Calcular

            // Score calculado
            score: 0, // Se calculará después

            // Datos adicionales
            trades: trades,
            rawData: content.substring(0, 2000),
          };

          // Validar que tenemos datos mínimos
          if (actualTotalTrades === 0 && finalBalance === 0) {
            // Use actualTotalTrades
            throw new Error(
              "No se pudieron extraer datos suficientes del reporte. Verifica que el archivo sea un reporte válido de MT4."
            );
          }

          resolve(result);
        } catch (err) {
          reject(
            new Error(
              "Error al procesar el archivo HTML. Verifica que sea un reporte válido de MT4."
            )
          );
        }
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !eaName.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      if (!state.selectedSymbol) {
        throw new Error(
          "Debes seleccionar un símbolo antes de subir un backtest"
        );
      }

      const backtestData = await parseMT4Report(selectedFile);

      // Calcular score
      const { calculateScore } = await import("@/lib/scoring");
      const score = calculateScore(backtestData as BacktestResult);
      backtestData.score = score;

      dispatch({
        type: "ADD_BACKTEST",
        payload: backtestData as BacktestResult,
      });

      // Limpiar formulario
      setEaName("");
      setSelectedFile(null);
      setDebugContent("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setEaName("");
      setSelectedFile(null);
      setError(null);
      setDebugContent("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Subir Reporte de Backtest MT4
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Símbolo seleccionado:{" "}
            {state.selectedSymbol
              ? state.symbols.find((s) => s.id === state.selectedSymbol)?.name
              : "Ninguno"}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* EA Name Input */}
          <div>
            <Label htmlFor="ea-name" className="text-sm font-medium">
              Nombre del Expert Advisor
            </Label>
            <Input
              id="ea-name"
              value={eaName}
              onChange={(e) => setEaName(e.target.value)}
              placeholder="Ej: Estrategia ATR, Bot RSI, etc."
              className="mt-1"
            />
          </div>

          {/* File Upload Area */}
          <div>
            <Label className="text-sm font-medium">
              Archivo de Reporte MT4
            </Label>
            <div
              className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                selectedFile
                  ? "border-green-300 bg-green-50 dark:bg-green-950/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 text-green-500 mx-auto" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    Archivo seleccionado correctamente
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="mt-2"
                  >
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium">
                    Arrastra el archivo HTML aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Solo archivos HTML de reportes MT4
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Seleccionar archivo
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Debug Section */}
          {debugContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Vista previa del archivo
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  {showDebug ? "Ocultar" : "Mostrar"} vista previa
                </Button>
              </div>
              {showDebug && (
                <Textarea
                  value={debugContent}
                  readOnly
                  className="h-32 text-xs font-mono"
                  placeholder="Contenido del archivo..."
                />
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !eaName.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Subir Backtest
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
