from apps.main import views
from django.urls import URLPattern, URLResolver, path

urlpatterns: list[URLPattern | URLResolver] = [
    path("", views.dashboard, name="dashboard"),
]
