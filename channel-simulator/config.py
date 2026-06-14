from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    CRM_RECEIPT_URL: str = "http://localhost:8000/receipts"

    class Config:
        env_file = ".env"

settings = Settings()