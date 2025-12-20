from apps.authentication import views
from django.contrib.auth.views import LogoutView
from django.urls import URLPattern, URLResolver, path

urlpatterns: list[URLPattern | URLResolver] = [
    path("", views.landing_page, name="landing_page"),
    path("signup/", views.signup_page, name="signup_page"),
    path("login/", views.login_page, name="login_page"),
    path("logout/", LogoutView.as_view(), name="logout_page"),
    path("verify-email/", views.verify_email, name="verify_email"),
    path("verify-email/resend/", views.resend_email, name="resend-verification"),
    path("settings/", views.settings_page, name="settings_page"),
]
