# chat/routing.py
from django.urls import re_path

from .consumers import Chat

websocket_urlpatterns = [
    re_path(r"ws/chat/room/", Chat.as_asgi()),
]