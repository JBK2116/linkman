from django.urls import path, URLPattern, URLResolver

from apps.authentication import views
urlpatterns: list[URLPattern | URLResolver] = [
    path("", views.landing_page, name="landing_page"),
    path("signup", views.signup_page, name="signup_page"),
    path("login", views.login_page, name="login_page"),
]
