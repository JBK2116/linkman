from django.http import HttpRequest
from django.http.response import HttpResponse
from django.shortcuts import render


def landing_page(request: HttpRequest) -> HttpResponse:
    """Landing page for the application"""
    return render(request, "index.html")