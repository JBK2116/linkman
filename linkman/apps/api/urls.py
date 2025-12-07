from django.urls import path

from ..api import views

urlpatterns = [
    path("groups/", views.handle_groups, name="groups"),
    path("links/", views.handle_links, name="links"),
]
