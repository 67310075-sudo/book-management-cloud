from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed


def custom_exception_handler(exc, context):
    """
    Custom exception handler to match Lab 9.4 exact status codes and response messages:
    - Missing Token -> HTTP 401: {"message": "Access token required"}
    - Invalid or Expired Token -> HTTP 403: {"message": "Invalid or expired token"}
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Invalid or expired token (SimpleJWT InvalidToken or AuthenticationFailed)
        if isinstance(exc, (InvalidToken, AuthenticationFailed)) or 'token_not_valid' in str(response.data):
            return Response(
                {"message": "Invalid or expired token"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Missing token (NotAuthenticated) -> HTTP 401
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            return Response(
                {"message": "Access token required"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Forbidden -> HTTP 403
        if response.status_code == status.HTTP_403_FORBIDDEN:
            return Response(
                {"message": "Invalid or expired token"},
                status=status.HTTP_403_FORBIDDEN
            )

    return response
