from django.urls import path, URLPattern, URLResolver

from apps.authentication import views
urlpatterns: list[URLPattern | URLResolver] = [
    path("", views.landing_page, name="landing_page"),
]
