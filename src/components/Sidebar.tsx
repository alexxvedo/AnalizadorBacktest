"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Target } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Symbol } from "@/types";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const { state, dispatch } = useApp();
  const [newSymbolName, setNewSymbolName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddSymbol = () => {
    if (!newSymbolName.trim()) return;

    const newSymbol: Symbol = {
      id: Date.now().toString(),
      name: newSymbolName.trim(),
      description: undefined,
      backtests: [],
      createdAt: new Date(),
    };

    dispatch({ type: "ADD_SYMBOL", payload: newSymbol });
    setNewSymbolName("");
    setIsDialogOpen(false);
  };

  const handleDeleteSymbol = (symbolId: string) => {
    dispatch({ type: "DELETE_SYMBOL", payload: symbolId });
  };

  const handleSelectSymbol = (symbolId: string) => {
    dispatch({ type: "SELECT_SYMBOL", payload: symbolId });
  };

  const getEACount = (symbolId: string) => {
    return state.eas.filter((ea) => ea.symbol === symbolId).length;
  };

  return (
    <div className="w-64 h-screen border-r bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Símbolos</h2>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Símbolo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symbol-name">Nombre</Label>
                  <Input
                    id="symbol-name"
                    value={newSymbolName}
                    onChange={(e) => setNewSymbolName(e.target.value)}
                    placeholder="Ej: EURUSD, DAX"
                    onKeyDown={(e) => e.key === "Enter" && handleAddSymbol()}
                  />
                </div>
                <Button onClick={handleAddSymbol} className="w-full">
                  Agregar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Symbols List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {state.symbols.map((symbol) => {
          const isSelected = state.selectedSymbol === symbol.id;
          const eaCount = getEACount(symbol.id);

          return (
            <Card
              key={symbol.id}
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => handleSelectSymbol(symbol.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">{symbol.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {eaCount}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSymbol(symbol.id);
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {state.symbols.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay símbolos</p>
            <p className="text-xs">Agrega tu primer símbolo</p>
          </div>
        )}
      </div>
    </div>
  );
}
