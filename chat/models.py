from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class ChatGroup(models.Model):
    user_one = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="user_one")
    user_two = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="user_two")

    def __str__(self) -> str:
        return f"{self.user_one.username} + {self.user_two.username}"
    


class Message(models.Model):
    group = models.ForeignKey(ChatGroup, on_delete=models.DO_NOTHING)
    sender = models.ForeignKey(User)
    content = models.TextField(max_length=1024, default="message")
    time = models.DateTimeField(auto_now=True)