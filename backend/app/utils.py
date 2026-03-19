from flask import jsonify

def api_response(success=True, data=None, error=None, status_code=200):
    """
    Standard API response format.
    """
    response = {
        "success": success,
        "data": data,
        "error": error
    }
    return jsonify(response), status_code
