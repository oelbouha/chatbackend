from django.db import models
from django.contrib.auth.models import User

    

class File(models.Model):
    file = models.FileField()


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="sender")
    recipient = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="recipient")
    type = models.CharField(max_length=4)
    content = models.TextField()
    status = models.CharField(max_length=4)
    time = models.DateTimeField(auto_now=True)


    def __str__(self) -> str:
        return f"msg {self.time.date()} at {self.time.time().hour}:{self.time.time().hour}"


class Attachment(models.Model):
    file = models.ForeignKey(File, on_delete=models.DO_NOTHING)
    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="atta_sender")
    recipient = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="atta_recipient")
    caption = models.TextField()
    status = models.CharField(max_length=4)
    time = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"atta {self.time.date()} at {self.time.time().hour}:{self.time.time().hour}"


class UserChannel(models.Model):
    channel_name = models.CharField(max_length=64, null=False)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)

    def __str__(self) -> str:
        return f"{self.user.username} -> {self.channel_name}"
    



