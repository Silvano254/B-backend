import crypto from 'crypto';
import { BinanceTicker, Candle, AccountState } from '../types.js';

const BINANCE_BASE_URL = process.env.BINANCE_BASE_URL || 'https://api.binance.com';

// Clean initial state (no hardcoded mock user/balances)
let accountState: AccountState = {
  accountName: 'Binance Account',
  accountNumber: 'UID: --',
  usdtBalance: 0.0,
  todayPnL: 0.0,
  todayPnLPercent: 0.0,
  futuresMarginUsdt: 0.0,
  winRate: 0.0,
  totalTrades: 0,
  signalAccuracy: 0.0,
  apiKeyStatus: 'NOT_CONNECTED',
  apiKeyMasked: 'Not Configured',
  autoTradeEnabled: false,
  maxRiskPerTrade: 2.0,
};

let userApiKey = process.env.BINANCE_API_KEY || '';
let userSecretKey = process.env.BINANCE_SECRET_KEY || '';

if (userApiKey && userSecretKey) {
  accountState.apiKeyStatus = 'CONNECTED_READONLY';
  accountState.apiKeyMasked = `${userApiKey.slice(0, 6)}...${userApiKey.slice(-4)}`;
}

export function getAccountState(): AccountState {
  return accountState;
}

export function createBinanceSignature(queryString: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

export function updateApiKeys(apiKey: string, secretKey: string, permissions: 'READONLY' | 'AUTOTRADE'): AccountState {
  userApiKey = apiKey;
  userSecretKey = secretKey;
  accountState = {
    ...accountState,
    apiKeyStatus: permissions === 'AUTOTRADE' ? 'CONNECTED_TRADE' : 'CONNECTED_READONLY',
    apiKeyMasked: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`,
    autoTradeEnabled: permissions === 'AUTOTRADE',
  };
  return accountState;
}

export function toggleAutoTrade(enabled: boolean, maxRiskPercent?: number): AccountState {
  accountState = {
    ...accountState,
    autoTradeEnabled: enabled,
    maxRiskPerTrade: maxRiskPercent ?? accountState.maxRiskPerTrade,
  };
  return accountState;
}

export async function fetchLiveBinanceTickers(): Promise<BinanceTicker[]> {
  const res = await fetch(`${BINANCE_BASE_URL}/api/v3/ticker/24hr`, {
    signal: AbortSignal.timeout(5000),
  });
  
  if (!res.ok) {
    throw new Error(`Binance API returned status ${res.status}`);
  }

  const data = await res.json();
  const targetSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT'];
  const filtered = data.filter((item: { symbol: string }) => targetSymbols.includes(item.symbol));

  return filtered.map((item: any) => {
    const price = parseFloat(item.lastPrice);
    const changePct = parseFloat(item.priceChangePercent);
    return {
      symbol: item.symbol,
      price,
      change24h: Number(changePct.toFixed(2)),
      high24h: parseFloat(item.highPrice),
      low24h: parseFloat(item.lowPrice),
      volume24h: parseFloat(item.quoteVolume),
      sparkline: [],
    };
  });
}

export async function fetchKlinesForSymbol(symbol: string, timeframe: string): Promise<Candle[]> {
  const intervalMap: Record<string, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d',
  };
  const interval = intervalMap[timeframe] || '15m';
  const url = `${BINANCE_BASE_URL}/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=50`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch klines from Binance for ${symbol}`);
  }

  const rawCandles = await res.json();
  return rawCandles.map((c: any) => ({
    time: c[0],
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4]),
    volume: parseFloat(c[5]),
  }));
}

export async function executeBinanceOrder(
  symbol: string,
  side: 'BUY' | 'SELL',
  quantityOrUsdt: number
) {
  if (!userApiKey || !userSecretKey) {
    throw new Error('Binance API keys not configured. Please link your keys first.');
  }

  const timestamp = Date.now();
  const queryString = `symbol=${symbol.toUpperCase()}&side=${side}&type=MARKET&quoteOrderQty=${quantityOrUsdt}&timestamp=${timestamp}`;
  const signature = createBinanceSignature(queryString, userSecretKey);

  const res = await fetch(`${BINANCE_BASE_URL}/api/v3/order?${queryString}&signature=${signature}`, {
    method: 'POST',
    headers: {
      'X-MBX-APIKEY': userApiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.msg || 'Binance order placement failed.');
  }

  return responseData;
}
