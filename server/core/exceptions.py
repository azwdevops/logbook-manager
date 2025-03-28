from rest_framework.exceptions import APIException
from django.utils.encoding import force_str


# to raise error when a user tries to access an object that does not exist
class MissingItemError(APIException):
    def __init__(self, detail, status_code):
        self.status_code = status_code
        self.detail = {"message": force_str(detail)}
