# Generated by Django 4.2.20 on 2025-04-03 06:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('logbook', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='driverlogbook',
            name='truck',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='logbook.truck'),
        ),
    ]
