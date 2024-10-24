from django.contrib import admin
from .models import Message, UserChannel, Room
from django.contrib.auth.models import User
# Register your models here.


admin.site.register(Message)
admin.site.register(UserChannel)
admin.site.register(Room)

