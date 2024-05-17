from channels.generic.websocket import WebsocketConsumer
from urllib.parse import parse_qs
import json


class ChatConsumer(WebsocketConsumer):

    def connect(self):
        # for key in self.scope:
        #     print(key)
        print(self.scope['url_route']['kwargs'])
        print(self.scope['query_string'].decode('utf-8'))
        result = parse_qs(self.scope['query_string'].decode('utf-8'))
        print(result['id'][0])
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data=None , bytes_data=None):
        self.send(text_data)
        print(self.channel_layer.cap)
        