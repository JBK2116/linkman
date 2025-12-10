from django.urls import path

from ..api import views

urlpatterns = [
    path("groups/", views.group_all, name="groups"),
    path("links/", views.link_all, name="links"),
    path("links/<int:link_id>/", views.link_one, name="link"),
]
