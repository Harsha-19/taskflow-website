from __future__ import annotations
import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables first
load_dotenv()

# This global 'app' variable is what Gunicorn (and Render) is looking for
app = create_app()

if __name__ == "__main__":
    # In local development, start the dev server
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
