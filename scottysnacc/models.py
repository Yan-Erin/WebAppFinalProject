from django.db import models
from django.contrib.auth.models import User

class Event(models.Model):
    user = models.ForeignKey(User, default=None, on_delete=models.PROTECT)
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=200, blank=True)
    lng = models.CharField(max_length=200)
    lat = models.CharField(max_length=200)
    buildingAddr = models.CharField(max_length=200)
    buildingName = models.CharField(max_length=200)
    specLocation = models.CharField(max_length=200, blank=True)
    startdate = models.DateTimeField()
    enddate = models.DateTimeField()
    tag = models.CharField(max_length=200)

    def __str__(self):
        return f'id={self.id}, user={self.user}, name={self.name}'
    
class Profile(models.Model):
    user = models.OneToOneField(User, default=None, on_delete=models.PROTECT, related_name="profile")
    liked_events  = models.ManyToManyField(Event)

    def __str__(self):
        return f'id={self.id}, user={self.user}'
    

