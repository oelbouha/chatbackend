import json

from django.db.models import Q
from django.contrib.auth.models import User

from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync

from chat.models import Message, UserChannel




class Chat(JsonWebsocketConsumer):

    STATUS = {}
    ACTION = {}
    MESSAGE = {}

    def connect(self):
        chann = UserChannel.objects.create(
            channel_name=self.channel_name,
            user=self.scope['user']
        )
        self.accept()


    def disconnect(self, code):
        UserChannel.objects.filter(user=self.scope['user']).delete()
        return super().disconnect(code)


    def receive_json(self, content, **kwargs):
        valid, message = self.parser(content)
        if not valid:
            self.send_json({
                'm': 'err',
                'err': message
            })
        else:
            if content['m'] in ['recv', 'sn']:
                self.handle_message_status_methods(content['m'])
            elif content['m'] in ['typ', 'styp', 'rcd', 'srcd']:
                self.handle_user_actions_methods(content['m'])
            else:
                self.handle_messages_method()


    def chat_message(self, event):
        self.send_json(content=event['data'])


    def parser(self, json_data):
        if (not 'm' in json_data) or (not 'clt' in json_data):
            return (False, 'the method/client key not found')
        
        clt = json_data['clt']
        try:
            clt_id = int(clt)
        except ValueError:
            return (False, 'client must be a number')
        
        try:
            client = User.objects.get(id=clt_id)
        except User.DoesNotExist:
            return (False, 'client with the given id not found')

        if not json_data['m'] in ['sn', 'recv', 'typ', 'rcd', 'styp', 'srcd', 'msg']:
            return (False, 'invalid method')

        valid, message = (True, "")
    
        if json_data['m'] in ['sn', 'recv']:
            valid, message = self.parse_status_methods(json_data, client)
        elif json_data['m'] in ['typ', 'rcd', 'styp', 'srcd']:
            self.ACTION['client'] = client
            return (True, "")
        else:
            valid, message = self.parse_message_method(json_data, client)
        return (valid, message)

 
    def parse_status_methods(self, json_data, client):

        if not 'msg' in json_data:
            return False, 'message key not found'
        
        msg = json_data['msg']

        try:
            msg_id = int(msg)
        except ValueError:
            return (False, 'message must be a number')
        
        try:
            message = Message.objects.get(id=msg_id)
        except Message.DoesNotExist:
            return (False, 'message with the given id not found')
        
        self.STATUS['client'] = client
        self.STATUS['message'] = message
        return (True, "")


    def parse_message_method(self, json_data, client):
        if (not 'tp' in json_data) or (not 'cnt' in json_data):
            return (False, "type/content key not found")
        
        type = json_data['tp']

        
        if not type in ['atta', 'txt', 'vc', 'vd', 'img']:
            return (False, "invalid message type")
        
        self.MESSAGE['client'] = client
        self.MESSAGE['type'] = type
        self.MESSAGE['content'] = json_data['cnt']

        return (True, "")


    def handle_message_status_methods(self, method):
        clt_channs = UserChannel.objects.filter(user=self.STATUS['client'])

        self.STATUS['message'].status = 'recieved' if method == 'recv' else 'seen'
        self.STATUS['message'].save()

        if len(clt_channs) != 0:
            data = {
                'm': method,
                'clt': self.scope['user'].id,
                'msg': self.STATUS['message'].id 
            }
            for chann in clt_channs:
                async_to_sync(self.channel_layer.send)(chann.channel_name,{
                    "type": "chat.message",
                    "data": data
                })


    def handle_user_actions_methods(self, method):
        clt_channs = UserChannel.objects.filter(user=self.ACTION['client'])

        if len(clt_channs) != 0:
            data = {
                'm': method,
                'clt': self.scope['user'].id,
            }

            for chann in clt_channs:
                async_to_sync(self.channel_layer.send)(chann.channel_name,{
                    "type": "chat.message",
                    "data": data
                })


    def handle_messages_method(self):
        clt_channs = UserChannel.objects.filter(user=self.MESSAGE['client'])

        message = Message.objects.create(
            sender=self.scope['user'],
            recipient=self.MESSAGE['client'],
            type=self.MESSAGE['type'],
            content=self.MESSAGE['content'],
        )

        self.send_json({
            'm': 'st',
            'tp': self.MESSAGE['type'], # TODO specify the type here
            'clt': self.MESSAGE['client'].id,
            'msg': message.id
        })

        if len(clt_channs) != 0:
            data = {
                'm': 'msg',
                'clt': self.scope['user'].id,
                'tp': self.MESSAGE['type'],
                'msg': message.id
            }
            for chann in clt_channs:
                async_to_sync(self.channel_layer.send)(chann.channel_name,{
                    "type": "chat.message",
                    "data": data
                })




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
         
'''

# TODO change message status with choices