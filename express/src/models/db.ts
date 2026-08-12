import mongoose from 'mongoose';

// User Account Schema
const AccountSchema = new mongoose.Schema(
  {
    accountName: { type: String, default: 'Binance Account' },
    accountNumber: { type: String, default: 'UID: --' },
    usdtBalance: { type: Number, default: 0.0 },
    todayPnL: { type: Number, default: 0.0 },
    todayPnLPercent: { type: Number, default: 0.0 },
    futuresMarginUsdt: { type: Number, default: 0.0 },
    winRate: { type: Number, default: 0.0 },
    totalTrades: { type: Number, default: 0 },
    signalAccuracy: { type: Number, default: 0.0 },
    apiKeyStatus: { type: String, default: 'NOT_CONNECTED' },
    apiKeyMasked: { type: String, default: 'Not Configured' },
    autoTradeEnabled: { type: Boolean, default: false },
    maxRiskPerTrade: { type: Number, default: 2.0 },
  },
  { timestamps: true }
);

// Executed Order Trade History Schema
const ExecutedOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    symbol: { type: String, required: true },
    type: { type: String, enum: ['LONG', 'SHORT'], required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, required: true },
    profitUsdt: { type: Number, default: 0.0 },
    profitPercent: { type: Number, default: 0.0 },
    status: { type: String, enum: ['WIN', 'LOSS'], default: 'WIN' },
    closedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Registered User Auth Schema
const UserAuthSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    authMethod: { type: String, default: 'PASSWORD' },
  },
  { timestamps: true }
);

export const AccountModel = mongoose.model('Account', AccountSchema);
export const ExecutedOrderModel = mongoose.model('ExecutedOrder', ExecutedOrderSchema);
export const UserAuthModel = mongoose.model('UserAuth', UserAuthSchema);
