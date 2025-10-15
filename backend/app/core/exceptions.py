"""
Custom exceptions for the application
"""


class AIVideoException(Exception):
    """Base exception for AIVideo application"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class AuthenticationException(AIVideoException):
    """Authentication failed exception"""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class AuthorizationException(AIVideoException):
    """Authorization failed exception"""
    def __init__(self, message: str = "Not authorized"):
        super().__init__(message, status_code=403)


class NotFoundException(AIVideoException):
    """Resource not found exception"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class InsufficientCreditsException(AIVideoException):
    """Insufficient credits exception"""
    def __init__(self, message: str = "Insufficient credits"):
        super().__init__(message, status_code=402)


class ValidationException(AIVideoException):
    """Validation error exception"""
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status_code=422)


class ExternalAPIException(AIVideoException):
    """External API error exception"""
    def __init__(self, message: str = "External API error"):
        super().__init__(message, status_code=503)
