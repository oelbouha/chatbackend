import json

from django.db.models import Q
from django.contrib.auth.models import User
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ValidationError

# from channels.auth import UserLazyObject
from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync

from chat.models import Message, UserChannel, Room, StatusChoices, TypeChoices
from chat import redis_instance


class Chat(JsonWebsocketConsumer):

    STATUS = {}
    ACTION = {}
    MESSAGE = {}

    def connect(self):
        if self.scope['user'].is_authenticated:
            redis_instance.sadd(f"chat:{self.scope['user'].id}", self.channel_name)
            self.accept()
            # TODO send to all freinds goes here
            
        else:
            self.close()


    def disconnect(self, code):
        if self.scope['user'].is_authenticated:
            redis_instance.srem(f"chat:{self.scope['user'].id}", self.channel_name)
        return super().disconnect(code)


    def receive_json(self, content, **kwargs):
        
        print("content: ", content)
        try:
            self.parser(content)
            if content['m'] in ['recv', 'sn']:
                self.handle_message_status_methods(content['m'])
            elif content['m'] in ['typ', 'styp', 'rcd', 'srcd']:
                self.handle_user_actions_methods(content['m'])
            else:
                self.handle_messages_method()
        except ValidationError as e:
            self.send_json({
                'm': 'err',
                'err': e.message
            })


    def chat_message(self, event):
        print("event: ", event)
        self.send_json(content=event['data'])


    def parser(self, json_data):
        
        try:
            if (not 'm' in json_data):
                raise ValidationError('method key not found')

            if not json_data['m'] in ['sn', 'recv', 'typ', 'rcd', 'styp', 'srcd', 'msg']:
                raise ValidationError('invalid method')

            clt = json_data['clt']
            clt_id = int(clt)
            client = User.objects.get(id=clt_id)
        
            if json_data['m'] in ['sn', 'recv']:
                self.parse_status_methods(json_data, client)
            elif json_data['m'] in ['typ', 'rcd', 'styp', 'srcd']:
                self.ACTION['client'] = client
            else:
                self.parse_message_method(json_data, client)

        except KeyError:
            raise ValidationError('client key not found')

        except ValueError:
            raise ValidationError('client must be a number')
        
        except User.DoesNotExist:
            raise ValidationError('client not found')


    def parse_status_methods(self, json_data, client):
        try:
            msg = json_data['msg']
            msg_id = int(msg)
            message = Message.objects.get(id=msg_id)
            self.STATUS['client'] = client
            self.STATUS['message'] = message

        except KeyError:
            raise ValidationError('message key not found')

        except ValueError:
            raise ValidationError('message must be a number')
    
        except Message.DoesNotExist:
            raise ValidationError('message with the given id not found')
        

    def parse_message_method(self, json_data, client):
        try:
            print("json_data: ", json_data)
            type = json_data['tp']
            content = json_data['cnt']
            id = json_data['identifier']
            room = Room.objects.get(
                Q(user1=client) | Q(user1=self.scope['user']),
                Q(user2=self.scope['user']) | Q(user2=client),
            )

            if not type in TypeChoices:
                raise ValidationError("invalid message type")

            if (type != TypeChoices.TEXT) and (not 'f' in content): # TODO handle file preview parsing
                raise ValidationError("missing file in attachment message")

            self.MESSAGE['client'] = client
            self.MESSAGE['id'] = id
            self.MESSAGE['room'] = room
            self.MESSAGE['type'] = type
            self.MESSAGE['content'] = content

        except KeyError:
            raise ValidationError("type | content | identifier key not found")

        except Room.DoesNotExist:
            raise ValidationError("no room between you and the recipient")


    def handle_message_status_methods(self, method):
        self.STATUS['message'].status = StatusChoices.RECEIVED if method == 'recv' else StatusChoices.SEEN
        self.STATUS['message'].save()

        data = {
            'm': method,
            'clt': self.scope['user'].id,
            'msg': self.STATUS['message'].id,
        }
        self.send_to_client(self.STATUS['client'], data)


    def handle_user_actions_methods(self, method):
        data = {
            'm': method,
            'clt': self.scope['user'].id,
        }
        self.send_to_client(self.ACTION['client'], data)


    def handle_messages_method(self):
        message = Message.objects.create(
            sender=self.scope['user'],
            recipient=self.MESSAGE['client'],
            room=self.MESSAGE['room'],
            type=self.MESSAGE['type'],
            content=self.MESSAGE['content'],
        )

        self.send_json({
            'm': 'st',
            'clt': self.MESSAGE['client'].id,
            'msg': message.id,
            'identifier': self.MESSAGE['id']
        })

        data = {
            'm': 'msg',
            'clt': self.scope['user'].id,
            'tp': self.MESSAGE['type'],
            'cnt': self.MESSAGE['content'],
            'msg': message.id,
        }
        self.send_to_client(self.MESSAGE['client'], data)


    def send_to_client(self, client, data):
        channels = redis_instance.smembers(f"chat:{client.id}")

        for channel in channels:
            async_to_sync(self.channel_layer.send)(channel,{
                "type": "chat.message",
                "data": data
            })


    def send_connected_to_friends(self):
        pass
'''
methods = st, sn, recv, typ, rcd, atta, msg, styp, srcd, err
st --> sent
sn --> seen
recv --> recieved
typ --> typing
styp -> stop typing
rcd --> recording
srcd --> stop recording
atta --> attachment
msg --> message

{
    m: st
    tp: (atta, msg, vc, vd, img) (to specify the type of sent data then impliment different)
    clt: client id
    id: msg_id 
}

{
    m: recv
    clt: user_id
    msg: msg_id
}

{
    m: sn
    clt: user_id
    msg: msg_id
}


{
    m: typ
    clt: user_id
}

{
    m: styp
    clt: user_id
}


{
    m: rcd
    clt: user_id
}

{
    m: srcd
    clt: user_id
}

{
    m: msg
    clt: user_id
    tp: message_type (txt, vc, att, image, video)
    cnt: message_content
    msg: msg_id // exist only if a server send a msg method to client
}


{
    method: err
    err: error content
}
'''


'''
    models :
        message:
            - sender
            - recipient
            - type -> (text, voice)
            - content (convert the audio message to base64 'the max duration of audio is 60s' )
            - status -> (sent, recieved, seen)
            - date
            - time

        attachment:
            ...

STATUS
ACTION
MESSAGE



notifications:
    - game invitation
    - tournament
    - friend request
    - connected user
    
keys:
    method: notif
    source: game - user - chat - tourn



    tournament:
        match infos -> id, opponent, tournament
    game invite:
        sender user id
    friend request:
        sender user id
    connected user:
        online user id
    



'''

# TODO change message status with choices