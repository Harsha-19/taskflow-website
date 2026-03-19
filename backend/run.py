from __future__ import annotations

from dotenv import load_dotenv

import os
from app import create_app


def main() -> None:
    """
    Local development entry point.

    - Loads environment variables from `.env`
    - Creates the Flask app via the factory
    - Runs in debug mode for fast iteration
    """
    load_dotenv()

    app = create_app()
    port = int(app.config.get("PORT", 5000))

    # `host="0.0.0.0"` allows access from the local network if needed.
    # Keep debug=True for development only.
    app.run(host="0.0.0.0", port=port, debug=True)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 10000))
    )
