# Generated by Django 5.0.3 on 2024-05-06 07:30

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('homework', '0005_alter_homework_options_alter_homework_deadline'),
    ]

    operations = [
        migrations.AlterField(
            model_name='homework',
            name='deadline',
            field=models.DateField(blank=True, default=datetime.datetime(2024, 5, 7, 10, 30, 38, 859691), null=True, verbose_name='Срок'),
        ),
    ]