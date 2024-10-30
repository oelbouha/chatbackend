

from django.http import JsonResponse
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.serializers import serialize
import json
from django.db.models import Q
from chat.models import Message

def get_messages(request):
	user1_id = request.GET.get('user1')
	user2_id = request.GET.get('user2')

	if not user1_id or not user2_id:
		return JsonResponse({"message": "Invalid request: user1 and user2 are required"})
	try:
		user1 = User.objects.get(id=user1_id)
		user2 = User.objects.get(id=user2_id)
	except User.DoesNotExist:
		return JsonResponse({"message": "Invalid request: user1 and user2 are required"})
	
	try:
		messages = Message.get_messages_between_users(user1, user2)
	except Exception as e:
		# print the error that occurred
		print(e)
		return JsonResponse({"message": "Messages data not found"})
	
	serialized_messages = serialize('json', messages)
	messages_list = json.loads(serialized_messages)
	messages_data = [
		{
			"sender": message['fields']['sender'],
			"recipient": message['fields']['recipient'],
			"tp": message['fields']['type'],
			"status": message['fields']['status'],
			"time": message['fields']['time'],
			"cnt": message["fields"]["content"],
			"msg" : message["pk"]

		}
		for message in messages_list

	]
	return JsonResponse(messages_data, safe=False)