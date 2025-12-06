from django.urls import path

from ..api import views

urlpatterns = [
    path("groups/", views.get_groups, name="get_groups"),
    path("links/", views.get_links, name="get_links"),
]
