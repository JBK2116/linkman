from django.http.response import JsonResponse

from ..main.models import Group, Link


def handle_groups(request) -> JsonResponse:
    groups = list(Group.objects.filter(user=request.user).values())
    return JsonResponse({"groups": groups})


def handle_links(request) -> JsonResponse:
    links = list(Link.objects.filter(user=request.user).values())
    return JsonResponse({"links": links})
