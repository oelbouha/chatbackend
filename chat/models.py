from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.db.models.fields.files import FileField

class StatusChoices(models.TextChoices):
    SENT = "ST", _("Sent")
    RECEIVED = "RECV", _("Received")
    SEEN = "SN", _("Seen")

class TypeChoices(models.TextChoices):
    MESSAGE = "MSG", _("Message")
    IMAGE = "IMG", _("Image")
    VIDEO = "VD", _("Video")
    VOICE = "VC", _("Voice")
    ATTACHMENT = "ATT", _("Attachment")

class Message(models.Model):

    sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="sender")
    recipient = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="recipient")
    type = models.CharField(max_length=4, choices=TypeChoices.choices, default=TypeChoices.MESSAGE)
    status = models.CharField(max_length=4, choices=StatusChoices.choices, default=StatusChoices.SENT)
    time = models.DateTimeField(auto_now=True)
    content = models.TextField()


    def __str__(self) -> str:
        return f"msg {self.time.date()} at {self.time.time().hour}:{self.time.time().hour}"



class UploadedFile(models.Model):
    file = models.FileField(upload_to="%Y/%m/%d/")




class UserChannel(models.Model):
    channel_name = models.CharField(max_length=64, null=False)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)

    def __str__(self) -> str:
        return f"{self.user.username} -> {self.channel_name}"
    



