from django.urls import path

from apps.authentication import views
urlpatterns: list[str] = [
    path("", views.landing_page, name="landing_page"),
]
