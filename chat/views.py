import json
import time
import io

from django.http import HttpRequest, JsonResponse
from django.views import View
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.db.models import Q
from django.core.files.storage import default_storage
from django.core.files.base import File


from PIL import Image
from chat.models import Message
from chat.forms import LoginForm


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
        if (not 'file' in request.FILES) or (not 'type' in request.POST):
            JsonResponse({'error': "file/type required"} , status=400)


        uploaded = request.FILES['file']
        path = time.strftime("%Y/%m/%d/") + uploaded.name
        file = default_storage.save(path, uploaded)

        res = {'f': file}
        if request.POST['type'] == 'img':
            prv_f, message, status = self.preview_img(uploaded)
        elif request.POST['type'] == 'vd':
            # prv_f, message, status = self.preview_video(uploaded)
            self.preview_video(uploaded)
        else:
            return JsonResponse(res)

        if prv_f is None:
            return JsonResponse({'error': message}, status=status)

        res['prv_f'] = prv_f
        return JsonResponse(res)


    def preview_img(self, uploaded_f):
        try:
            uploaded_f.open() # open the uploaded file
            img = Image.open(uploaded_f) # create a pillow image instance
            re_img = img.resize((60, 60)) # resize the image
            re_img_cnt = io.BytesIO() # the stream that will hold the resized image content
            re_img.save(re_img_cnt, format=img.format) # save the resize image content into BytesIO
            file = File(re_img_cnt, 'preview_' + uploaded_f.name) # convert resized image to django File object
            path = time.strftime("%Y/%m/%d/") + file.name # generate the path
            prv_f = default_storage.save(path, file) # save the file in storage
        except :
            return (None, "Error While processing image", 202)
        finally:
            img.close()
            re_img.close()

        return prv_f, "", 200


    def preview_video(self, uploaded_f):
        pass
        # uploaded_f.open()
        # v_stream = io.BytesIO()
        # for chunk in uploaded_f.chunks():
        #     v_stream.write(chunk)
        
        # try:
        #     clip = VideoFileClip(video_path)
        #     frame = clip.get_frame(1)
        #     image = Image.fromarray(frame)
        #     image.save(thumbnail_path)
        # except Exception as e:
        #     return None, "error while processing video", 202



# class File(LoginRequiredMixin, View):
#     def get(self, request: HttpRequest, **kwargs):
#         id = kwargs['id']
#         try:
#             id = Message.objects.get(id=id)
#         except Message.DoesNotExist:
#             JsonResponse()



class PreviewFile(LoginRequiredMixin, View):
    def get(self, request: HttpRequest, **kwargs):
        pass


class Logout(LoginRequiredMixin, View):
    def post(self, request: HttpRequest):
        logout(request)
        return redirect('/login/')