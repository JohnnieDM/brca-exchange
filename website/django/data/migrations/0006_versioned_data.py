# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-08-24 16:53
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('data', '0004_autocomplete_words'),
    ]

    operations = [
        migrations.CreateModel(
            name='DataRelease',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('notes', models.TextField()),
                ('sources', models.TextField()),
                ('schema', models.TextField()),
                ('archive', models.TextField()),
                ('md5sum', models.TextField()),
            ],
            options={
                'db_table': 'data_release',
            },
        ),
    ]
