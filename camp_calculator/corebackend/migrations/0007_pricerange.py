# Generated by Django 5.1 on 2024-08-30 08:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('corebackend', '0006_testdata_delete_testcasedata'),
    ]

    operations = [
        migrations.CreateModel(
            name='PriceRange',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('service', models.CharField(max_length=100)),
                ('max_cases', models.IntegerField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
            options={
                'unique_together': {('service', 'max_cases')},
            },
        ),
    ]
