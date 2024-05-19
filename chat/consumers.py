from channels.generic.websocket import JsonWebsocketConsumer
from chat.models import ChatGroup, Message
from django.db.models import Q
from django.contrib.auth.models import User
from asgiref.sync import async_to_sync
import json


class ChatConsumer(JsonWebsocketConsumer):
    group_name: str
    group: ChatGroup
    recipient : User
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        print("Disconnect Message: ", close_code)


    def receive_json(self, content, **kwargs):
        if not 'message' in content:
            self.set_group_and_recipient(content)
            async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
        else:
            message = Message.objects.create(
                group=self.group,
                sender=self.scope['user'],
                recipient=self.recipient,
                content=content['message']
            )

            event = {
                "type": "chat.message",
                "message": content['message'],
                "sender": self.scope['user'].username
            }
            async_to_sync(self.channel_layer.group_send)(self.group_name, event)


    def chat_message(self, event):
        data = json.dumps({
            'message': event['message'],
            'sender': event['sender']
        })
        print(data)
        self.send(text_data=data)



    def set_group_and_recipient(self, content):
        if not 'recipient' in content:
            self.close(reason="bad data")

        try:
            recipient = User.objects.get(username=content['recipient'])
        except:
            self.close(reason="user not found")

        try:
            group = ChatGroup.objects.get(
                Q(user_one=recipient, user_two=self.scope['user'])
                | Q(user_two=recipient, user_one=self.scope['user']))

        except ChatGroup.DoesNotExist:
            group = ChatGroup.objects.create(user_one=self.scope['user'], user_two=recipient)

        self.group_name = str(group.id)
        self.group = group
        self.recipient = recipient


        


# parse query string
# get group by id



