from django.urls import path
from . import views

urlpatterns = [
    path('health', views.health_check, name='health_check'),
    path('account', views.account_info, name='account_info'),
    path('account/apikeys', views.update_api_keys, name='update_api_keys'),
    path('autotrade/toggle', views.toggle_auto_trade, name='toggle_auto_trade'),
    path('history', views.get_trade_history, name='get_trade_history'),
]
