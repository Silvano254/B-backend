from rest_framework import serializers
from .models import AccountProfile, ExecutedOrder, GeneratedSignal

class AccountProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountProfile
        fields = [
            'account_name',
            'account_number',
            'usdt_balance',
            'today_pnl',
            'today_pnl_percent',
            'futures_margin_usdt',
            'win_rate',
            'total_trades',
            'signal_accuracy',
            'api_key_status',
            'api_key_masked',
            'auto_trade_enabled',
            'max_risk_per_trade',
        ]

class ExecutedOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutedOrder
        fields = '__all__'

class GeneratedSignalSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedSignal
        fields = '__all__'
