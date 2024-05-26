from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views import View
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.db.models import Q
from PIL import Image


from chat.models import Message, UploadedFile
from chat.forms import LoginForm

# Create your views here.
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


class UploadAttachment(LoginRequiredMixin, View): 

    def post(self, request: HttpRequest):
        # TODO check type key in requet.POST
        if (not 'file' in request.FILES):
            print("file/type required")
            return redirect('/')
        

        file = UploadedFile.objects.create(file=request.FILES['file'])
        res = {'f': file.id}
        # if request.POST['type'] == 'img':
        #     preview_file = self.img_to_preview_mode()
        #     res['prv'] = file.id
        # elif request.POST['type'] == 'vd':
        #     preview_file = self.video_to_preview_mode()
        #     res['prv'] = file.id

        
        return JsonResponse(res)
    
    def img_to_preview_mode(self, img_name):
        pass

    def video_to_preview_mode(self, vd_name):
        pass



class Logout(LoginRequiredMixin, View):
    def post(self, request: HttpRequest):
        logout(request)
        return redirect('/login/')