def get_object_or_none(model_name, **kwargs):
    """
    Attempts to retrieve an object from the given model based on the provided filter criteria.

    Args:
        model_name: The Django model class to query.
        **kwargs: Filter conditions for the query.

    Returns:
        The retrieved object if found, otherwise None.
    """
    try:
        obj = model_name.objects.get(**kwargs)  # Attempt to get the object matching the given filters
        return obj  # Return the retrieved object if found
    except model_name.DoesNotExist:  # Handle the case where no matching object exists
        return None  # Return None if the object does not exist
