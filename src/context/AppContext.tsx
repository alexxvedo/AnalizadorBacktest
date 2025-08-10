"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { Symbol, BacktestResult, EA } from "../types";
import { calculateScore, calculateEAStats } from "../lib/scoring";

interface AppState {
  symbols: Symbol[];
  selectedSymbol: string | null;
  backtests: BacktestResult[];
  eas: EA[];
}

type AppAction =
  | { type: "ADD_SYMBOL"; payload: Symbol }
  | { type: "DELETE_SYMBOL"; payload: string }
  | { type: "SELECT_SYMBOL"; payload: string }
  | { type: "ADD_BACKTEST"; payload: BacktestResult }
  | { type: "DELETE_BACKTEST"; payload: string }
  | { type: "UPDATE_BACKTEST"; payload: BacktestResult }
  | { type: "DELETE_EA"; payload: string }
  | { type: "UPDATE_EA_COMMENT"; payload: { eaId: string; comment: string } };

const initialState: AppState = {
  symbols: [],
  selectedSymbol: null,
  backtests: [],
  eas: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_SYMBOL":
      return {
        ...state,
        symbols: [...state.symbols, action.payload],
      };

    case "DELETE_SYMBOL":
      return {
        ...state,
        symbols: state.symbols.filter((s) => s.id !== action.payload),
        backtests: state.backtests.filter((b) => b.symbol !== action.payload),
        selectedSymbol:
          state.selectedSymbol === action.payload ? null : state.selectedSymbol,
      };

    case "SELECT_SYMBOL":
      return {
        ...state,
        selectedSymbol: action.payload,
      };

    case "ADD_BACKTEST": {
      const newBacktest = {
        ...action.payload,
        score: calculateScore(action.payload),
      };

      const updatedBacktests = [...state.backtests, newBacktest];

      // Recalcular EAs
      const easMap = new Map<string, BacktestResult[]>();
      updatedBacktests.forEach((backtest) => {
        const key = `${backtest.symbol}-${backtest.eaName}`;
        if (!easMap.has(key)) {
          easMap.set(key, []);
        }
        easMap.get(key)!.push(backtest);
      });

      const updatedEAs: EA[] = Array.from(easMap.entries()).map(
        ([key, backtests]) => {
          const [symbol, eaName] = key.split("-");
          const stats = calculateEAStats(backtests);
          return {
            id: key,
            name: eaName,
            symbol,
            backtests,
            averageScore: stats?.averageScore || 0,
            bestScore: stats?.bestScore || 0,
            totalBacktests: stats?.totalBacktests || 0,
          };
        }
      );

      return {
        ...state,
        backtests: updatedBacktests,
        eas: updatedEAs,
      };
    }

    case "DELETE_BACKTEST": {
      const updatedBacktests = state.backtests.filter(
        (b) => b.id !== action.payload
      );

      // Recalcular EAs
      const easMap = new Map<string, BacktestResult[]>();
      updatedBacktests.forEach((backtest) => {
        const key = `${backtest.symbol}-${backtest.eaName}`;
        if (!easMap.has(key)) {
          easMap.set(key, []);
        }
        easMap.get(key)!.push(backtest);
      });

      const updatedEAs: EA[] = Array.from(easMap.entries()).map(
        ([key, backtests]) => {
          const [symbol, eaName] = key.split("-");
          const stats = calculateEAStats(backtests);
          return {
            id: key,
            name: eaName,
            symbol,
            backtests,
            averageScore: stats?.averageScore || 0,
            bestScore: stats?.bestScore || 0,
            totalBacktests: stats?.totalBacktests || 0,
          };
        }
      );

      return {
        ...state,
        backtests: updatedBacktests,
        eas: updatedEAs,
      };
    }

    case "UPDATE_BACKTEST": {
      const updatedBacktest = {
        ...action.payload,
        score: calculateScore(action.payload),
      };

      const updatedBacktests = state.backtests.map((b) =>
        b.id === action.payload.id ? updatedBacktest : b
      );

      // Recalcular EAs
      const easMap = new Map<string, BacktestResult[]>();
      updatedBacktests.forEach((backtest) => {
        const key = `${backtest.symbol}-${backtest.eaName}`;
        if (!easMap.has(key)) {
          easMap.set(key, []);
        }
        easMap.get(key)!.push(backtest);
      });

      const updatedEAs: EA[] = Array.from(easMap.entries()).map(
        ([key, backtests]) => {
          const [symbol, eaName] = key.split("-");
          const stats = calculateEAStats(backtests);
          return {
            id: key,
            name: eaName,
            symbol,
            backtests,
            averageScore: stats?.averageScore || 0,
            bestScore: stats?.bestScore || 0,
            totalBacktests: stats?.totalBacktests || 0,
          };
        }
      );

      return {
        ...state,
        backtests: updatedBacktests,
        eas: updatedEAs,
      };
    }

    case "DELETE_EA": {
      const eaToDelete = state.eas.find((ea) => ea.id === action.payload);
      if (!eaToDelete) return state;

      // Eliminar todos los backtests de este EA
      const updatedBacktests = state.backtests.filter(
        (backtest) =>
          !(
            backtest.symbol === eaToDelete.symbol &&
            backtest.eaName === eaToDelete.name
          )
      );

      // Recalcular EAs
      const easMap = new Map<string, BacktestResult[]>();
      updatedBacktests.forEach((backtest) => {
        const key = `${backtest.symbol}-${backtest.eaName}`;
        if (!easMap.has(key)) {
          easMap.set(key, []);
        }
        easMap.get(key)!.push(backtest);
      });

      const updatedEAs: EA[] = Array.from(easMap.entries()).map(
        ([key, backtests]) => {
          const [symbol, eaName] = key.split("-");
          const stats = calculateEAStats(backtests);
          return {
            id: key,
            name: eaName,
            symbol,
            backtests,
            averageScore: stats?.averageScore || 0,
            bestScore: stats?.bestScore || 0,
            totalBacktests: stats?.totalBacktests || 0,
          };
        }
      );

      return {
        ...state,
        backtests: updatedBacktests,
        eas: updatedEAs,
      };
    }

    case "UPDATE_EA_COMMENT": {
      const updatedEAs = state.eas.map((ea) =>
        ea.id === action.payload.eaId
          ? { ...ea, comment: action.payload.comment }
          : ea
      );

      return {
        ...state,
        eas: updatedEAs,
      };
    }

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Function to load state from localStorage
  const loadState = (): AppState => {
    if (typeof window !== "undefined") {
      // Ensure window is defined (client-side)
      const savedState = localStorage.getItem("analizadorBacktestState");
      if (savedState) {
        try {
          const parsedState: AppState = JSON.parse(savedState);
          // Ensure dates are re-hydrated if necessary (e.g., uploadDate)
          parsedState.backtests.forEach((bt) => {
            if (typeof bt.uploadDate === "string") {
              bt.uploadDate = new Date(bt.uploadDate);
            }
          });
          return parsedState;
        } catch (e) {
          console.error("Failed to parse state from localStorage", e);
          return initialState;
        }
      }
    }
    return initialState;
  };

  // Use a function for initial state to load from localStorage only once
  const [state, dispatch] = useReducer(appReducer, initialState, loadState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ensure window is defined (client-side)
      localStorage.setItem("analizadorBacktestState", JSON.stringify(state));
    }
  }, [state]); // Dependency array: run effect when 'state' changes

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
