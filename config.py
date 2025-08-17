import os

class Config:
    # Bảo mật session Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

    # Cấu hình database (SQLite cho dễ, có thể đổi sang MySQL/Postgres)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # API key Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your_api_key_here")
