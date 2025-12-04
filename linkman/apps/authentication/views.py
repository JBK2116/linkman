from django.http import HttpRequest
from django.http.response import HttpResponse
from django.shortcuts import render


def landing_page(request: HttpRequest) -> HttpResponse:
    """Landing page for the application"""
    return render(request, "index.html")

def signup_page(request: HttpRequest) -> HttpResponse:
    """Signup page for the application"""
    return render(request, "authentication/signup.html")

def login_page(request: HttpRequest) -> HttpResponse:
    """Login page for the application"""
    return render(request, "authentication/login.html")
