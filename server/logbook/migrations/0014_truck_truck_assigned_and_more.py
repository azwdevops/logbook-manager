# Generated by Django 4.2.20 on 2025-04-01 09:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logbook', '0013_alter_carrier_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='truck',
            name='truck_assigned',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='tripdetail',
            name='trip_start_date',
            field=models.DateField(null=True),
        ),
    ]
