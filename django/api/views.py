from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import AccountProfile, ExecutedOrder
from .serializers import AccountProfileSerializer, ExecutedOrderSerializer

def get_or_create_account():
    profile = AccountProfile.objects.first()
    if not profile:
        profile = AccountProfile.objects.create()
    return profile

@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok', 'service': 'Django REST API Backend'})

@api_view(['GET'])
def account_info(request):
    profile = get_or_create_account()
    serializer = AccountProfileSerializer(profile)
    # Map snake_case to camelCase for frontend compatibility
    data = serializer.data
    return Response({
        'accountName': data['account_name'],
        'accountNumber': data['account_number'],
        'usdtBalance': data['usdt_balance'],
        'todayPnL': data['today_pnl'],
        'todayPnLPercent': data['today_pnl_percent'],
        'futuresMarginUsdt': data['futures_margin_usdt'],
        'winRate': data['win_rate'],
        'totalTrades': data['total_trades'],
        'signalAccuracy': data['signal_accuracy'],
        'apiKeyStatus': data['api_key_status'],
        'apiKeyMasked': data['api_key_masked'],
        'autoTradeEnabled': data['auto_trade_enabled'],
        'maxRiskPerTrade': data['max_risk_per_trade'],
    })

@api_view(['POST'])
def update_api_keys(request):
    api_key = request.data.get('apiKey')
    secret_key = request.data.get('secretKey')
    permissions = request.data.get('permissions', 'READONLY')

    if not api_key or not secret_key:
        return Response({'error': 'API Key and Secret Key required'}, status=status.HTTP_400_BAD_REQUEST)

    profile = get_or_create_account()
    profile.api_key_status = 'CONNECTED_TRADE' if permissions == 'AUTOTRADE' else 'CONNECTED_READONLY'
    profile.api_key_masked = f"{api_key[:6]}...{api_key[-4:]}"
    profile.auto_trade_enabled = permissions == 'AUTOTRADE'
    profile.save()

    return Response({
        'success': True,
        'message': f"Binance API key linked successfully ({permissions})",
        'account': {
            'accountName': profile.account_name,
            'accountNumber': profile.account_number,
            'usdtBalance': profile.usdt_balance,
            'todayPnL': profile.today_pnl,
            'todayPnLPercent': profile.today_pnl_percent,
            'futuresMarginUsdt': profile.futures_margin_usdt,
            'winRate': profile.win_rate,
            'totalTrades': profile.total_trades,
            'signalAccuracy': profile.signal_accuracy,
            'apiKeyStatus': profile.api_key_status,
            'apiKeyMasked': profile.api_key_masked,
            'autoTradeEnabled': profile.auto_trade_enabled,
            'maxRiskPerTrade': profile.max_risk_per_trade,
        }
    })

@api_view(['POST'])
def toggle_auto_trade(request):
    enabled = request.data.get('enabled', False)
    max_risk = request.data.get('maxRiskPercent')

    profile = get_or_create_account()
    profile.auto_trade_enabled = bool(enabled)
    if max_risk is not None:
        profile.max_risk_per_trade = float(max_risk)
    profile.save()

    return Response({'success': True, 'autoTradeEnabled': profile.auto_trade_enabled})

@api_view(['GET'])
def get_trade_history(request):
    orders = ExecutedOrder.objects.all().order_by('-closed_at')
    total_pnl = sum(o.profit_usdt for o in orders)
    wins = orders.filter(status='WIN').count()
    losses = orders.filter(status='LOSS').count()
    total = wins + losses
    win_rate = round((wins / total) * 100, 1) if total > 0 else 0.0

    history_list = [
        {
            'id': o.order_id,
            'symbol': o.symbol,
            'type': o.type,
            'entryPrice': o.entry_price,
            'exitPrice': o.exit_price or o.entry_price,
            'profitUsdt': o.profit_usdt,
            'profitPercent': o.profit_percent,
            'status': o.status,
            'closedAt': o.closed_at.isoformat(),
        }
        for o in orders
    ]

    return Response({
        'totalPnL': total_pnl,
        'winCount': wins,
        'lossCount': losses,
        'winRate': win_rate,
        'history': history_list,
    })
