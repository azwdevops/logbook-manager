# Generated by Django 4.2.20 on 2025-03-27 11:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logbook', '0005_alter_tripitem_item_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='tripitem',
            name='is_current',
            field=models.BooleanField(default=False),
        ),
    ]
