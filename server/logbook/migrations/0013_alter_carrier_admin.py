# Generated by Django 4.2.20 on 2025-04-01 08:23

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('logbook', '0012_carrier_remove_tripday_truck_trailer_number_truck_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='carrier',
            name='admin',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='carrier_admin', to=settings.AUTH_USER_MODEL),
        ),
    ]
