from django.db import models
from django.contrib.auth.models import User

class Event(models.Model):
    user = models.ForeignKey(User, default=None, on_delete=models.PROTECT)
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=200)
    # location = models.PointField(geography=True, spatial_index=True)
    date = models.DateTimeField()
    tag = models.CharField(max_length=200)

    def __str__(self):
        return f'id={self.id}, user={self.user}, name={self.name}'
    
class Profile(models.Model):
    user = models.OneToOneField(User, default=None, on_delete=models.PROTECT)
    picture = models.FileField(blank=True)
    liked_events  = models.ManyToManyField(Event)

    def __str__(self):
        return f'id={self.id}, user={self.user}'
    

