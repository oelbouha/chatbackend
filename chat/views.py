from django.http import HttpRequest
from django.views import View
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.db.models import Q


from chat.models import ChatGroup, Message
from chat.forms import LoginForm

# Create your views here.
class Home(LoginRequiredMixin, View):
    def get(self, request: HttpRequest):
        users = [user.username for user in User.objects.all() if user != request.user]

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
        if not 'name' in request.GET:
            return redirect('/')
        
        try:
            user = User.objects.get(username=request.GET['name'])
        except User.DoesNotExist:
            return redirect('/')

        messages = Message.objects.filter(
            Q(sender=request.user, recipient=user)
            | Q(sender=user, recipient=request.user)
        ).order_by("time")

        return render(request, 'chat.html', {
            'messages': messages
        })

class Logout(LoginRequiredMixin, View):
    def post(self, request: HttpRequest):
        logout(request)
        return redirect('/login/')