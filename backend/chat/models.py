from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.db.models.fields.files import FileField

class StatusChoices(models.TextChoices):
	SENT = "ST", _("Sent")
	RECEIVED = "RECV", _("Received")
	SEEN = "SN", _("Seen")

class TypeChoices(models.TextChoices):
	TEXT = "TXT", _("Text")
	IMAGE = "IMG", _("Image")
	VIDEO = "VD", _("Video")
	VOICE = "VC", _("Voice")
	ATTACHMENT = "ATT", _("Attachment")


class Room(models.Model):
	user1 = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="user1")
	user2 = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="user2")


class Message(models.Model):

	room = models.ForeignKey(Room, on_delete=models.DO_NOTHING)
	sender = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="sender")
	recipient = models.ForeignKey(User, on_delete=models.DO_NOTHING, related_name="recipient")
	type = models.CharField(max_length=4, choices=TypeChoices.choices, default=TypeChoices.TEXT)
	status = models.CharField(max_length=4, choices=StatusChoices.choices, default=StatusChoices.SENT)
	time = models.DateTimeField(auto_now=True)
	content = models.TextField()

	@classmethod
	def get_messages_between_users(cls, user1, user2):
		print("looking for user1: ", user1, " user2: ", user2)
		return cls.objects.filter(
			models.Q(sender=user1, recipient=user2) |
			models.Q(sender=user2, recipient=user1)
		).order_by('id')
	
	def __str__(self) -> str:
		return f"msg {self.time.date()} at {self.time.time().hour}:{self.time.time().hour}"





class UserChannel(models.Model):
	channel_name = models.CharField(max_length=64, null=False)
	user = models.ForeignKey(User, on_delete=models.DO_NOTHING)

	def __str__(self) -> str:
		return f"{self.user.username} -> {self.channel_name}"
	
