export type SignalType = 'LONG' | 'SHORT';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface TradingSignal {
  id: string;
  symbol: string;
  type: SignalType;
  entryPrice: number;
  takeProfit1: number;
  takeProfit2: number;
  stopLoss: number;
  confidence: number;
  risk: RiskLevel;
  timeframe: Timeframe;
  indicators: {
    rsi: number;
    macd: string;
    emaTrend: 'Bullish' | 'Bearish' | 'Neutral';
    volumeSpike: boolean;
  };
  aiReasoning?: string;
  createdAt: string;
  status: 'ACTIVE' | 'WIN' | 'LOSS' | 'CANCELLED';
}

export interface BinanceTicker {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  sparkline: number[];
}

export interface AccountState {
  accountName: string;
  accountNumber: string;
  usdtBalance: number;
  todayPnL: number;
  todayPnLPercent: number;
  futuresMarginUsdt: number;
  winRate: number;
  totalTrades: number;
  signalAccuracy: number;
  apiKeyStatus: 'CONNECTED_READONLY' | 'CONNECTED_TRADE' | 'NOT_CONNECTED';
  apiKeyMasked: string;
  autoTradeEnabled: boolean;
  maxRiskPerTrade: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AIAnalysis {
  confidenceScore: number;
  marketCondition: 'Trending Up' | 'Trending Down' | 'Ranging' | 'Volatile';
  reasoning: string;
  keyDrivers: string[];
  recommendation: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
}

export interface NotificationItem {
  id: string;
  title: string;
  symbol: string;
  type: SignalType;
  confidence: number;
  time: string;
  read: boolean;
  message: string;
}
