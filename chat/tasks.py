import io
import time
import tempfile
import ffmpeg

from django.core.files.base import File
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import TemporaryUploadedFile, UploadedFile


from celery import shared_task
from PIL import Image
from pathlib import Path


@shared_task
def save_file(f_name, f_content):
    path = time.strftime("%Y/%m/%d/") + f_name
    f = default_storage.save(path, f_content)
    return f


@shared_task
def image_preview(f, f_name):
    res = {}
    try:
        uploaded_f = default_storage.open(f)
        img = Image.open(uploaded_f) # create a pillow image instance
        re_img = img.resize((60, 60)) # resize the image
        re_img_cnt = io.BytesIO() # the stream that will hold the resized image content
        re_img.save(re_img_cnt, format=img.format) # save the resize image content into BytesIO
        file = File(re_img_cnt, 'preview_' + f_name) # convert resized image to django File object
        path = time.strftime("%Y/%m/%d/") + file.name # generate the path
        prv_f = default_storage.save(path, file) # save the file in storage
    except :
        res['error'] = 'Error While processing image'
        return res, 202
    finally:
        img.close()
        re_img.close()

    res['f'] = f
    res['prv_f'] = prv_f
    return res, 200


@shared_task
def video_preview(f, f_name):
    res = {}
    uploaded_f = default_storage.open(f)
    with tempfile.NamedTemporaryFile(suffix=Path(f_name).suffix) as tmp_v:
        tmp_v.write(uploaded_f.read())
        tmp_v.seek(0)
        prv_f, message, status = get_thumbnail(tmp_v.name, f_name)
    
    if prv_f is None:
        res['error'] = message
    else:
        res['f'] = f
        res['prv_f'] = prv_f
    return res, status



def get_thumbnail(v_path, uploaded_f_name):
    with tempfile.NamedTemporaryFile(suffix='.png') as tmp_image:
        try:
            ffmpeg \
            .input(v_path, ss='00:00:01') \
            .output(tmp_image.name, pix_fmt='rgb24', frames='1', loglevel="quiet", vf=f"scale=60:60")\
            .overwrite_output() \
            .run()
        except Exception as e:
            return None, "Error while proccessing video", 202

        f = File(tmp_image, 'preview_' + Path(uploaded_f_name).with_suffix('.png').name)
        path = time.strftime("%Y/%m/%d/") + f.name
        prv_f = default_storage.save(path ,f)
    return prv_f, "", 200
