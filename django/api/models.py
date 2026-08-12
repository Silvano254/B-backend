from django.db import models

class AccountProfile(models.Model):
    account_name = models.CharField(max_length=100, default='Binance Account')
    account_number = models.CharField(max_length=50, default='UID: --')
    usdt_balance = models.FloatField(default=0.0)
    today_pnl = models.FloatField(default=0.0)
    today_pnl_percent = models.FloatField(default=0.0)
    futures_margin_usdt = models.FloatField(default=0.0)
    win_rate = models.FloatField(default=0.0)
    total_trades = models.IntegerField(default=0)
    signal_accuracy = models.FloatField(default=0.0)
    api_key_status = models.CharField(max_length=30, default='NOT_CONNECTED')
    api_key_masked = models.CharField(max_length=100, default='Not Configured')
    auto_trade_enabled = models.BooleanField(default=False)
    max_risk_per_trade = models.FloatField(default=2.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.account_name} ({self.account_number})"

class ExecutedOrder(models.Model):
    order_id = models.CharField(max_length=100, unique=True)
    symbol = models.CharField(max_length=20)
    type = models.CharField(max_length=10) # LONG or SHORT
    entry_price = models.FloatField()
    exit_price = models.FloatField(null=True, blank=True)
    profit_usdt = models.FloatField(default=0.0)
    profit_percent = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, default='WIN')
    closed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.symbol} {self.type} - {self.status}"

class GeneratedSignal(models.Model):
    symbol = models.CharField(max_length=20)
    signal_type = models.CharField(max_length=10) # LONG or SHORT
    entry_price = models.FloatField()
    take_profit1 = models.FloatField()
    take_profit2 = models.FloatField()
    stop_loss = models.FloatField()
    confidence = models.IntegerField()
    risk_level = models.CharField(max_length=20)
    timeframe = models.CharField(max_length=10)
    ai_reasoning = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Signal {self.symbol} {self.signal_type} ({self.confidence}%)"
