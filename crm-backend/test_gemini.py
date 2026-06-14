import google.generativeai as genai
from config import settings
API_KEY = "AQ.Ab8RN6Kkv1uTXsJEUEuj6tHV6fv3WnNvW2uXe-vWH8LZHOwNKw"

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-2.0-flash-lite")

response = model.generate_content("Say Hello")

print(response.text)

print(settings.GEMINI_API_KEY)