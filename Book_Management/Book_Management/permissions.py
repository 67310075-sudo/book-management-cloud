from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminRole(BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and (
                getattr(request.user, 'role', '') == 'admin' or
                getattr(request.user, 'is_staff', False) or
                getattr(request.user, 'is_superuser', False)
            )
        )


class BookPermission(BasePermission):
    """
    Lab 9.5 & 9.6 Role-Based Access Control (RBAC):
    - GET, HEAD, OPTIONS (SAFE_METHODS): Authenticated users (viewer, editor, admin, manager)
    - POST, PUT, PATCH: editor, manager, admin
    - DELETE: admin only (Viewer and Editor receive 403 Forbidden)
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        role = getattr(request.user, 'role', 'viewer')
        is_staff = getattr(request.user, 'is_staff', False)
        is_superuser = getattr(request.user, 'is_superuser', False)

        if request.method == 'DELETE':
            return role == 'admin' or is_superuser

        if request.method in ['POST', 'PUT', 'PATCH']:
            return role in ['editor', 'admin', 'manager'] or is_staff or is_superuser

        return False
