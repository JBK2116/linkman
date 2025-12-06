# Create your views here.
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


@login_required
def dashboard(request: HttpRequest) -> HttpResponse:
    """Dashboard page for the application"""
    return render(request, "main/dashboard.html")
