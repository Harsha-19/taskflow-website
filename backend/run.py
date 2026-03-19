from __future__ import annotations

from dotenv import load_dotenv
from dotenv import load_dotenv

import os
from app import create_app
import os

def main() -> None:
    load_dotenv()
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port) #debug=True

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 10000))
    )
