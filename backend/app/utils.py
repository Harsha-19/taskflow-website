from flask import jsonify

def api_response(success=True, message=None, data=None, status_code=200):
    """
    Standardized API response format.
    """
    response = {
        "success": success,
        "message": message,
        "data": data or {}
    }
    return jsonify(response), status_code
