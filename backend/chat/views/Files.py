import time
import json
import mimetypes

from django.http import HttpRequest, JsonResponse, HttpResponse
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.core.files.storage import default_storage
from django.conf import settings

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


from chat.models import Message

from PIL import Image
from pypdf import PdfReader
from pypdf.errors import PyPdfError

# TODO don't forget to test >1M files

@method_decorator(csrf_exempt, name="dispatch")
class UploadFile(LoginRequiredMixin, View):

    def get(self, request: HttpRequest):
        return HttpResponse("upload file")


    def post(self, request: HttpRequest):
        f = request.FILES['f']

        # try:
        #    soundfile.read(f)
        # except soundfile.SoundFileError:
        #     return HttpResponse("invalid audio")
        
        return HttpResponse("ok")


    def file_validation(self, files):
        # TODO file type validation
        # TODO file size validation

        image_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        video_types = ['video/mp4']
        audio_types = ['audio/mpeg']
        pdf_type = 'application/pdf'

        try:
            file_type = mimetypes.guess_type(files['file'])[0]
        except KeyError:
            return None, "file not found"
        
        if file_type in image_types:
            return self.image_validation()
        elif file_type in video_types:
            return self.video_validation()
        elif file_type in audio_types:
            return self.audio_validation()
        elif file_type == pdf_type:
            return self.pdf_validation()
        else:
            return None, "file type not supported"
        

    def image_validation(self, files):
        f = files['file']
        try:
            prev_f = files['preview']
        except KeyError:
            return None, "preview file not found"
        
        if f.size > settings.IMG_SIZE:
            return None, f"image too large (max size: f{settings.IMG_SIZE / 1_000_000} MB)"
        
        if prev_f.size > settings.IMG_PREV_SIZE:
            return None, f"preview image too large (max size: f{settings.IMG_PREV_SIZE / 1_000_000} MB)"
        
        try:
            with Image.open(f) as img, Image.open(prev_f) as prev_img:
                img.verify()
                prev_img.verify()
                path = time.strftime("%Y/%m/%d/")
                img_path = default_storage.save(path + f.name, f)
                prev_img_path = default_storage.save(path + prev_f.name, prev_f)
        except Exception:
            return None, "invalid image"
        
        return {
            'img': default_storage.url(img_path),
            'prev_img': default_storage.url(prev_img_path)
        }, ""
        

    def video_validation(self, files):   
        # TODO later
        f = files['file']
        try:
            prev_f = files['preview']
        except KeyError:
            return None, "preview file not found"
        
        try:
            with Image.open(prev_f) as thumbnail:
                thumbnail.verify()
                path = time.strftime("%Y/%m/%d/")
                thumbnail_path = default_storage.save(path + prev_f.name, prev_f)
        except Exception:
            return None, "invalid video"
        

    def audio_validation(self, files):
        f = files['file']

        try:
            sf = soundfile.read(f)
        except soundfile.SoundFileError:
            return None, "invalid audio"
        
        path = time.strftime("%Y/%m/%d/")
        audio_path = default_storage.save(path + f.name, f)

        return {
            'audio': default_storage.url(audio_path)
        }


    def pdf_validation(self, files):
        f = files['file']

        if f.size > settings.PDF_SIZE:
            return None, f"file too large (max size: f{settings.PDF_SIZE / 1_000_000} MB)"
        
        try:
            pdf = PdfReader(f)
        except PyPdfError:
            return None, "invalid pdf"
        
        path = time.strftime("%Y/%m/%d/")
        pdf_path = default_storage.save(path + f.name, f)

        return {
            'pdf': default_storage.url(pdf_path)
        }
        

        

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