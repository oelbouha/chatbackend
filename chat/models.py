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
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="sender")
    recipient = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="recipient")
    content = models.TextField(max_length=1024)
    time = models.DateTimeField(auto_now=True)


    def __str__(self) -> str:
        return f"{self.time.date()} at {self.time.time().hour}:{self.time.time().hour}"
    

class UserChannel(models.Model):
    channel_name = models.CharField(max_length=64, null=False)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)

    def __str__(self) -> str:
        return f"{self.user.username} -> {self.channel_name}"