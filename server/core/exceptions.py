from rest_framework.exceptions import APIException  # Importing base exception class from Django REST framework
from django.utils.encoding import force_str  # Ensures string encoding compatibility


# Custom exception for handling cases where an item is missing
class MissingItemError(APIException):
    """
    Exception raised when a requested item does not exist.

    Attributes:
        detail (str): The error message to be displayed.
        status_code (int): The HTTP status code to be returned.
    """

    def __init__(self, detail, status_code):
        self.status_code = status_code  # Assign the provided HTTP status code
        self.detail = {"message": force_str(detail)}  # Convert detail to string and store it in a dictionary


# Custom exception for handling failed requests
class RequestFailedError(APIException):
    """
    Exception raised when a request fails due to an unexpected issue.

    Attributes:
        detail (str): The error message to be displayed.
        status_code (int): The HTTP status code to be returned.
    """

    def __init__(self, detail, status_code):
        self.status_code = status_code  # Assign the provided HTTP status code
        self.detail = {"message": force_str(detail)}  # Convert detail to string and store it in a dictionary


# Custom exception for handling cases where an item already exists
class ItemExistsError(APIException):
    """
    Exception raised when an attempt is made to create an item that already exists.

    Attributes:
        detail (str): The error message to be displayed.
        status_code (int): The HTTP status code to be returned.
    """

    def __init__(self, detail, status_code):
        self.status_code = status_code  # Assign the provided HTTP status code
        self.detail = {"message": force_str(detail)}  # Convert detail to string and store it in a dictionary
