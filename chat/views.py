from django.http import HttpRequest
from django.views import View
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.mixins import LoginRequiredMixin
from chat.models import ChatGroup, Message
from chat.forms import LoginForm

# Create your views here.
class Home(LoginRequiredMixin, View):
    def get(self, request: HttpRequest):
        user = request.user
        user_groups = [(group.user_one.username if group.user_one == user else group.user_two.username) 
                       for group in ChatGroup.objects.filter(user_one=user, user_two=user)]

        return render(request, 'home.html', {
            'groups': user_groups
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
        id = kwargs['id']

        try:
            group = ChatGroup.objects.get(id=id)
        except ChatGroup.DoesNotExist:
            return redirect('/home/')
        
        messages = Message.objects.filter(group=group)
        return render(request, 'chat.html', {
            'messages': messages
        })

class Logout(LoginRequiredMixin, View):
    def post(self, request: HttpRequest):
        logout(request)
        return redirect('/login/')