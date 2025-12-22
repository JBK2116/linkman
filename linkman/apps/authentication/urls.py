from apps.authentication import views
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LogoutView
from django.urls import URLPattern, URLResolver, path, reverse_lazy

from .forms import ForgotPasswordForm, ResetPasswordForm

urlpatterns: list[URLPattern | URLResolver] = [
    path("", views.landing_page, name="landing_page"),
    path("signup/", views.signup_page, name="signup_page"),
    path("login/", views.login_page, name="login_page"),
    path("logout/", LogoutView.as_view(), name="logout_page"),
    path("verify-email/", views.verify_email, name="verify_email"),
    path("verify-email/resend/", views.resend_email, name="resend-verification"),
    path("settings/", views.settings_page, name="settings_page"),
    path(
        "password_reset/",
        auth_views.PasswordResetView.as_view(
            template_name="registration/forgot_password.html",
            email_template_name="registration/forgot_password_email.html",
            html_email_template_name="registration/forgot_password_email.html",
            success_url=reverse_lazy("password_reset_done"),
            form_class=ForgotPasswordForm,
        ),
        name="password_reset",
    ),  # shows when the user wants to give the email of account to reset the password for
    path(
        "password_reset_done/",
        auth_views.PasswordResetDoneView.as_view(
            template_name="registration/forgot_password.html",
            extra_context={"email_sent": True},
        ),
        name="password_reset_done",
    ),  # shows when the email has been sent to the account
    path(
        "reset/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="registration/reset_password.html",
            form_class=ResetPasswordForm,
            success_url=reverse_lazy("password_reset_complete"),
        ),
        name="password_reset_confirm",
    ),  # shows the view for entering a new password
    path(
        "reset/done/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="registration/password_reset_complete.html",
        ),
        name="password_reset_complete",
    ),
]
