import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL").replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
