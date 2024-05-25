from django.contrib import admin
from .models import Message, Attachment, File, UserChannel
# Register your models here.

# admin.site.register(ChatGroup)
admin.site.register(Message)
admin.site.register(Attachment)
admin.site.register(File)
admin.site.register(UserChannel)