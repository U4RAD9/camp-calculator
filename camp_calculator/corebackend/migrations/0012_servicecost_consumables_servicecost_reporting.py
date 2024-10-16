# Generated by Django 5.1 on 2024-08-31 10:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('corebackend', '0011_testtype_servicecost'),
    ]

    operations = [
        migrations.AddField(
            model_name='servicecost',
            name='consumables',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='servicecost',
            name='reporting',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
    ]
