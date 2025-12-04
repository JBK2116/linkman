# Create your views here.
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def dashboard(request: HttpRequest) -> HttpResponse:
    """Dashboard page for the application"""
    return render(request, "main/dashboard.html")
