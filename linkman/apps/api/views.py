import json
from typing import Any

from django.http import HttpRequest
from django.http.response import JsonResponse

from ..api import utils
from ..authentication.models import CustomUser
from ..authentication.utils import HttpMethod
from ..main.models import Group, Link


def group_all(request: HttpRequest) -> JsonResponse:
    if request.method == HttpMethod.POST.value:
        """Equivalent to api/group POST"""
        # ensure that the user is authenticated
        if not utils.validate_authentication(request.user):
            return JsonResponse({"detail": "User not authenticated"}, status=401)
        assert isinstance(
            request.user, CustomUser
        )  # user is confirmed to be a custom user by now
        # parse the data
        data: dict[str, Any] = json.loads(request.body)
        group_name: str | None = data.get("group_name")
        if group_name is None:
            return JsonResponse(
                {"detail": "Error Occurred. Group name is missing"}, status=400
            )
        # Validate the group name
        name_validation_result: bool = utils.validate_group_name(group_name)
        if not name_validation_result:
            return JsonResponse(
                {
                    "detail": "Invalid group name. Group name must be between 0 - 50 characters"
                },
                status=400,
            )
        name_uniqueness_result: bool = utils.validate_unique_group_name(
            group_name, request.user
        )
        if not name_uniqueness_result:
            return JsonResponse(
                {"detail": f"A group with the name '{group_name}' already exists "},
                status=400,
            )
        # Group name is valid by now
        new_group = Group(user=request.user, name=group_name)
        new_group.save()
        new_group_data: dict[str, Any] = utils.serialize_object(new_group)
        return JsonResponse(
            {"detail": "Group successfully created", "group": new_group_data},
            status=201,
        )

    # Request is a simple api/group GET
    groups = list(Group.objects.filter(user=request.user).values())
    return JsonResponse({"groups": groups})


def link_all(request: HttpRequest) -> JsonResponse:
    if request.method == HttpMethod.POST.value:
        """Equivalent to api/link POST"""
        if not utils.validate_authentication(request.user):
            return JsonResponse({"detail": "User not authenticated"}, status=401)
        assert isinstance(
            request.user, CustomUser
        )  # user is confirmed to be a custom user by now
        # parse the data
        data: dict[str, Any] = json.loads(request.body)
        # validate group
        group_id: int | None = data.get("group_id")
        if group_id is None:
            return JsonResponse({"detail": "Group id is missing"}, status=400)
        group: Group | None = utils.validate_group_exists(group_id, request.user)
        if not group:
            return JsonResponse({"detail": "Group does not exist"}, status=400)
        # validate link name
        link_name: str | None = data.get("link_name")
        if link_name is None:
            return JsonResponse({"detail": "Missing Link Name Field"}, status=400)
        name_validation_result: bool = utils.validate_link_name(link_name)
        if not name_validation_result:
            return JsonResponse(
                {"detail": "Link Name must be between 0 to 50 characters"}, status=400
            )
        # validate link url
        link_url = data.get("link_url")
        if link_url is None:
            return JsonResponse({"detail": "Missing Link URL Field"}, status=400)
        url_validation_result: bool = utils.validate_link_url(link_url)
        if not url_validation_result:
            return JsonResponse(
                {"detail": "Link URL must be between 0 to 2000 characters"}, status=400
            )
        # Link is valid by now
        new_link = Link(name=link_name, url=link_url, user=request.user, group=group)
        new_link.save()
        new_link_data: dict[str, Any] = utils.serialize_object(new_link)
        return JsonResponse(
            {"detail": "Link successfully created", "link": new_link_data}
        )
    # request is a simple /api/links GET
    links = list(Link.objects.filter(user=request.user).values())
    return JsonResponse({"links": links})


def link_one(request: HttpRequest, link_id: int) -> JsonResponse:
    if request.method == HttpMethod.DELETE.value:
        """Equivalent to api/link/:id DELETE"""
        # validate authentication
        if not utils.validate_authentication(request.user):
            return JsonResponse({"detail": "User not authenticated"}, status=401)
        assert isinstance(request.user, CustomUser)
        deletion_result: bool = utils.delete_link_in_db(link_id)
        if not deletion_result:
            return JsonResponse({"detail": "Link does not exist"}, status=400)
        return JsonResponse({"detail": "Link successfully deleted"}, status=200)
    link: Link | None = utils.get_link_from_db(link_id)
    if link is None:
        return JsonResponse({"detail": "Link does not exist"}, status=400)
    return JsonResponse({"detail": "Link found", "link": link}, status=200)
