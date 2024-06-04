import time
import io
import ffmpeg
import tempfile
import json

from django.http import HttpRequest, JsonResponse
from django.views import View
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.db.models import Q
from django.core.files.storage import default_storage
from django.core.files.base import File
from django.core.files.uploadedfile import TemporaryUploadedFile, InMemoryUploadedFile


from PIL import Image
from moviepy.editor import VideoFileClip
from chat.models import Message
from chat.forms import LoginForm
from pathlib import Path
from chat.tasks import image_preview, video_preview, save_file


class Home(LoginRequiredMixin, View):
    def get(self, request: HttpRequest):
        users = [{
            'id': user.id,
            'username': user.username,
        } for user in User.objects.all() if user != request.user]

        return render(request, 'home.html', {
            'users': users
        })


class Login(View):
    def get(self, request: HttpRequest):
        form = LoginForm()
        return render(request, 'login.html', {
            'form': form
        })
    

    def post(self, request: HttpRequest):
        form = LoginForm(request.POST)
        next = '/' if not 'next' in request.GET else request.GET['next']
        if form.is_valid():
            user = authenticate(request, username=form.cleaned_data['username'], password=form.cleaned_data['password'])
            if user is None:
                return render(request, 'login.html', {
                    'form': LoginForm(),
                    'message': 'wrong username/password'
                })
            login(request, user)
            return redirect(next)

        return render(request, 'login.html', {
            'form': LoginForm(),
            'message': 'invalid username/password'
        })

class Logout(LoginRequiredMixin, View):
    def post(self, request: HttpRequest):
        logout(request)
        return redirect('/login/')
    

class ChatRoom(LoginRequiredMixin, View):
    def get(self, request: HttpRequest, *args, **kwargs):
        if not 'id' in request.GET:
            return redirect('/')
        
        try:
            id = int(request.GET['id'])
        except ValueError:
            return redirect('/')

        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return redirect('/')

        messages = Message.objects.filter(
            Q(sender=request.user, recipient=user)
            | Q(sender=user, recipient=request.user)
        ).order_by("time")

        return render(request, 'chat.html', {
            'messages': messages
        })


class UploadFile(LoginRequiredMixin, View): 

    def post(self, request: HttpRequest):
        if not 'file' in request.FILES:
            JsonResponse({'error': "file required"} , status=400)

        uploaded = request.FILES['file']
        path = time.strftime("%Y/%m/%d/")
        f = default_storage.save(path + uploaded.name, uploaded)


        res = {'f': f}
        if 'preview' in request.FILES:
            preview = request.FILES['preview']
            prv_f = default_storage.save(path + preview.name, preview)
            res['prv_f'] = prv_f


        # TODO preview functions goes here
        return JsonResponse(res)


class PreviewFile(LoginRequiredMixin, View):

    def get(self, request: HttpRequest, **kwargs):
        id = kwargs['id']

        try:
            message = Message.objects.get(
                Q(id=id),
                Q(sender=request.user) | Q(recipient=request.user),
            )
        except Message.DoesNotExist:
            return JsonResponse({
                'error': 'you are Unauthorized to access this file'
            }, status=401)
        
        
        try:
            content_dict = json.loads(message.content)
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'message content is not json'
            }, status=400)

        if not 'prv_f' in content_dict:
            return JsonResponse({
                "error": "the message doesn't have a preview file"
            }, status=400)
        
        file_url = default_storage.url(content_dict['prv_f'])
        return JsonResponse({
            'file': file_url
        })


class FullFile(LoginRequiredMixin, View):

    def get(self, request: HttpRequest, **kwargs):
        id = kwargs['id']

        try:
            message = Message.objects.get(
                Q(id=id),
                Q(sender=request.user) | Q(recipient=request.user),
            )
        except Message.DoesNotExist:
            return JsonResponse({
                'error': 'you are Unauthorized to access this file'
            }, status=401)
        
        try:
            content_dict = json.loads(message.content)
        except json.JSONDecodeError:
            return JsonResponse({
                'error': 'message content is not json'
            }, status=400)
        
        file_url = default_storage.url(content_dict['f'])
        return JsonResponse({
            'file': file_url
        })