# Generated by Django 5.1 on 2024-08-29 13:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_rename_uploafile_uploadedfile'),
    ]

    operations = [
        migrations.DeleteModel(
            name='UploadedFile',
        ),
    ]
