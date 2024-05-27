from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .views import Home, Login, Logout, ChatRoom, UploadFile

urlpatterns = [
    path('', Home.as_view(), name='home'),
    path('login/', Login.as_view(), name='login'),
    path('logout/', Logout.as_view(), name='logout'),
    path('room/', ChatRoom.as_view()),
    path('upload/', UploadFile.as_view())
]


if settings.DEBUG: 
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)