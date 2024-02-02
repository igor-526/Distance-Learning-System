# Generated by Django 5.0.1 on 2024-01-30 09:31

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('lesson', '0001_initial'),
        ('material', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='listener',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Ученик'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='materials',
            field=models.ManyToManyField(blank=True, related_name='lesson', related_query_name='lesson_set', to='material.material', verbose_name='Материалы'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='teacher',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lessons', to=settings.AUTH_USER_MODEL, verbose_name='Преподаватель'),
        ),
    ]
