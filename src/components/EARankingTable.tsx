"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Upload,
  ChevronDown,
  ChevronRight,
  Trash2,
  MessageSquare,
  Edit,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  calculateScore,
  getScoreColor,
  getScoreBadge,
  calculateEAStats,
} from "@/lib/scoring";
import { BacktestUpload } from "./BacktestUpload";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { BacktestResult } from "@/types";

export function EARankingTable() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "averageScore" | "bestScore" | "totalBacktests"
  >("averageScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [expandedEA, setExpandedEA] = useState<string | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState<string | null>(
    null
  );
  const [commentText, setCommentText] = useState("");

  // Obtener el símbolo seleccionado
  const selectedSymbol = state.symbols.find(
    (s) => s.id === state.selectedSymbol
  );

  // Resetear el diálogo cuando cambie el símbolo seleccionado
  React.useEffect(() => {
    setShowUploadDialog(false);
  }, [state.selectedSymbol]);

  // Filtrar EAs por símbolo seleccionado
  const filteredAndSortedEAs = React.useMemo(() => {
    let filtered = state.eas;

    // Filtrar por símbolo seleccionado
    if (state.selectedSymbol) {
      filtered = filtered.filter((ea) => ea.symbol === state.selectedSymbol);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((ea) =>
        ea.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "averageScore":
          comparison = a.averageScore - b.averageScore;
          break;
        case "bestScore":
          comparison = a.bestScore - b.bestScore;
          break;
        case "totalBacktests":
          comparison = a.totalBacktests - b.totalBacktests;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [state.eas, state.selectedSymbol, searchTerm, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronRight className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const toggleExpanded = (eaId: string) => {
    setExpandedEA(expandedEA === eaId ? null : eaId);
  };

  const handleDeleteEA = (eaId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este Expert Advisor?")) {
      dispatch({ type: "DELETE_EA", payload: eaId });
    }
  };

  const handleAddComment = (eaId: string) => {
    setShowCommentDialog(eaId);
    setCommentText("");
  };

  const handleSaveComment = () => {
    if (showCommentDialog && commentText.trim()) {
      dispatch({
        type: "UPDATE_EA_COMMENT",
        payload: { eaId: showCommentDialog, comment: commentText.trim() },
      });
      setShowCommentDialog(null);
      setCommentText("");
    }
  };

  // Si no hay símbolo seleccionado
  if (!state.selectedSymbol) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Selecciona un Símbolo</h3>
            <p className="text-muted-foreground mb-6">
              Haz clic en un símbolo en el panel lateral para ver sus Expert
              Advisors
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{selectedSymbol?.name}</h1>
              <p className="text-muted-foreground">
                Expert Advisors y Backtests
              </p>
            </div>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Subir Backtest
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <ChevronRight className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Buscar Expert Advisor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-48"
            >
              <option value="averageScore">Puntuación Promedio</option>
              <option value="bestScore">Mejor Puntuación</option>
              <option value="totalBacktests">Número de Backtests</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {filteredAndSortedEAs.length === 0 && !searchTerm ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No hay Expert Advisors
                </h3>
                <p className="text-muted-foreground">
                  Sube tu primer backtest para comenzar
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSort("averageScore")}
                  >
                    <div className="flex items-center">
                      Puntuación
                      {getSortIcon("averageScore")}
                    </div>
                  </TableHead>
                  <TableHead>Porcentaje de Éxito</TableHead>
                  <TableHead>Máximo Retroceso</TableHead>
                  <TableHead>Beneficio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedEAs.map((ea, index) => {
                  const isExpanded = expandedEA === ea.id;
                  const bestBacktest = ea.backtests.reduce(
                    (best: BacktestResult, current: BacktestResult) =>
                      current.score > best.score ? current : best
                  );

                  return (
                    <React.Fragment key={ea.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => toggleExpanded(ea.id)}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{ea.name}</TableCell>
                        <TableCell>
                          <span
                            className={`font-bold ${getScoreColor(
                              ea.averageScore
                            )}`}
                          >
                            {ea.averageScore.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {bestBacktest
                            ? `${bestBacktest.winRate.toFixed(1)}%`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {bestBacktest
                            ? `${bestBacktest.maxDrawdownPercent.toFixed(1)}%`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {bestBacktest ? (
                            <span
                              className={
                                bestBacktest.profit >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {formatCurrency(bestBacktest.profit)}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddComment(ea.id);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEA(ea.id);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Details */}
                      {isExpanded && bestBacktest && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <div className="bg-muted/30 p-6">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Métricas Principales
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Total de Operaciones:</span>
                                      <span>{bestBacktest.totalTrades}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Operaciones Ganadoras:</span>
                                      <span>{bestBacktest.winningTrades}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Operaciones Perdedoras:</span>
                                      <span>{bestBacktest.losingTrades}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Factor de Beneficio:</span>
                                      <span>
                                        {bestBacktest.profitFactor.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Balance
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Inicial:</span>
                                      <span>
                                        {formatCurrency(
                                          bestBacktest.initialBalance
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Final:</span>
                                      <span>
                                        {formatCurrency(
                                          bestBacktest.finalBalance
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Beneficio Total:</span>
                                      <span
                                        className={
                                          bestBacktest.profit >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }
                                      >
                                        {formatCurrency(bestBacktest.profit)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Riesgo</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Máximo Retroceso:</span>
                                      <span className="text-red-600">
                                        {formatCurrency(
                                          bestBacktest.maxDrawdown
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Máximo Retroceso %:</span>
                                      <span className="text-red-600">
                                        {bestBacktest.maxDrawdownPercent.toFixed(
                                          2
                                        )}
                                        %
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Beneficio Esperado:</span>
                                      <span>
                                        {formatCurrency(
                                          bestBacktest.expectedPayoff
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Secuencias
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Ganancias Consecutivas:</span>
                                      <span>
                                        {bestBacktest.consecutiveWins}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Pérdidas Consecutivas:</span>
                                      <span>
                                        {bestBacktest.consecutiveLosses}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Ratio de Sharpe:</span>
                                      <span>
                                        {bestBacktest.sharpeRatio?.toFixed(2) ||
                                          "N/A"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {ea.comment && (
                                  <div className="mt-4">
                                    <h4 className="font-semibold mb-2">
                                      Comentario
                                    </h4>
                                    <div className="bg-muted p-3 rounded-md text-sm">
                                      {ea.comment}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {bestBacktest.trades &&
                                bestBacktest.trades.length > 0 && (
                                  <div className="mt-6">
                                    <h4 className="font-semibold mb-3">
                                      Evolución de la Cuenta
                                    </h4>
                                    <ResponsiveContainer
                                      width="100%"
                                      height={200}
                                    >
                                      <AreaChart
                                        data={bestBacktest.trades.map(
                                          (trade, index) => ({
                                            index: index + 1,
                                            balance: trade.balance,
                                            profit: trade.profit,
                                          })
                                        )}
                                      >
                                        <defs>
                                          <linearGradient
                                            id="balanceGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                          >
                                            <stop
                                              offset="5%"
                                              stopColor="#8884d8"
                                              stopOpacity={0.8}
                                            />
                                            <stop
                                              offset="95%"
                                              stopColor="#8884d8"
                                              stopOpacity={0.1}
                                            />
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                          strokeDasharray="3 3"
                                          className="opacity-30"
                                        />
                                        <XAxis
                                          dataKey="index"
                                          className="text-xs"
                                          tick={{ fontSize: 12 }}
                                        />
                                        <YAxis
                                          className="text-xs"
                                          tick={{ fontSize: 12 }}
                                          tickFormatter={(value) =>
                                            formatCurrency(value).replace(
                                              "$",
                                              ""
                                            )
                                          }
                                        />
                                        <Tooltip
                                          contentStyle={{
                                            backgroundColor:
                                              "hsl(var(--background))",
                                            border:
                                              "1px solid hsl(var(--border))",
                                            borderRadius: "6px",
                                            boxShadow:
                                              "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                          }}
                                          formatter={(value, name) => [
                                            formatCurrency(Number(value)),
                                            name === "balance"
                                              ? "Balance"
                                              : "Profit",
                                          ]}
                                        />
                                        <Area
                                          type="monotone"
                                          dataKey="balance"
                                          stroke="#8884d8"
                                          strokeWidth={2}
                                          fill="url(#balanceGradient)"
                                        />
                                      </AreaChart>
                                    </ResponsiveContainer>
                                  </div>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <BacktestUpload
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
      />

      {/* Dialog para comentarios */}
      <Dialog
        open={!!showCommentDialog}
        onOpenChange={() => setShowCommentDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Comentario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Escribe tu comentario sobre esta estrategia..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCommentDialog(null)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveComment}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
