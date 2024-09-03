import time
import json
import mimetypes

from django.http import HttpRequest, JsonResponse
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.core.files.storage import default_storage


from chat.models import Message



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
    
    def file_validation(self, files):
        # TODO file type validation
        # TODO file size validation
        with_prv = [
            'video/mp4',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ]

        without_prv = [
            'audio/mpeg',
            'application/pdf'
        ]

        file_type = mimetypes.guess_type(files['file'])[0]
        if 


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
                'error': 'message content is not a json'
            }, status=400)
        
        file_url = default_storage.url(content_dict['f'])
        return JsonResponse({
            'file': file_url
        })