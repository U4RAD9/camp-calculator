# Generated by Django 5.1 on 2024-09-30 16:45

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('corebackend', '0029_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='companydetails',
            name='super_company',
            field=models.CharField(default=django.utils.timezone.now, max_length=255),
            preserve_default=False,
        ),
    ]
