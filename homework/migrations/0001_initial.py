# Generated by Django 5.0.1 on 2024-01-30 09:31

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Homework',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Наименование')),
                ('description', models.TextField(blank=True, max_length=2000, null=True, verbose_name='Описание')),
                ('deadline', models.DateField(default=datetime.datetime(2024, 1, 31, 9, 31, 33, 226937), verbose_name='Срок')),
            ],
            options={
                'verbose_name': 'Домашнее задание',
                'verbose_name_plural': 'Домишние задания',
                'ordering': ['id'],
            },
        ),
        migrations.CreateModel(
            name='HomeworkLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dt', models.DateTimeField(auto_now_add=True, verbose_name='Дата и время')),
                ('comment', models.TextField(blank=True, max_length=2000, null=True, verbose_name='Комментарий')),
                ('status', models.IntegerField(choices=[(1, 'Создано'), (2, 'На проверке'), (3, 'Принято'), (4, 'На доработке'), (5, 'Отменено')], default=1, verbose_name='Статус')),
            ],
            options={
                'verbose_name': 'Лог ДЗ',
                'verbose_name_plural': ('Логи ДЗ',),
                'ordering': ['dt'],
            },
        ),
    ]
