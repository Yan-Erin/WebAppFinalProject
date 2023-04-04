"""webapps URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from scottysnacc import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', views.map_action, name='home'),
    path('login', views.login_action, name='login'),
    path('logout', views.logout_action, name='logout'),
    path('register', views.register_action, name='register'),
    path("scottysnacc/events", views.get_events_json_dumps_serializer),
    path("scottysnacc/add-event", views.add_action),
    path('oauth/', include('social_django.urls', namespace='social'), name='social'),
    path('scottysnacc/delete-event/<int:event_id>', views.delete_action),
    path('scottysnacc/like-event/<int:event_id>', views.like_action),
    path('scottysnacc/unlike-event/<int:event_id>', views.unlike_action),
]  + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 
