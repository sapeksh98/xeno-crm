from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./dev.db"
    GROQ_API_KEY: str = ""
    CHANNEL_SIMULATOR_URL: str = "http://localhost:8001"

    class Config:
        env_file = ".env"

settings = Settings()