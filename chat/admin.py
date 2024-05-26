from django.contrib import admin
from .models import Message, UserChannel, UploadedFile
# Register your models here.

admin.site.register(UploadedFile)
admin.site.register(Message)
admin.site.register(UserChannel)