"""
Google Gemini Intelligence Service
Uses GEMINI_API_KEY from backend environment for advanced LLM-powered property description synthesis
and natural language inquiry analysis with graceful academic fallback.
"""
import requests
from typing import Optional
from app.config import settings

class GeminiService:
    def __init__(self):
        # Default to Gemini 3.5 Flash / Flash Latest with high throughput and stability
        self.primary_model = "gemini-3.5-flash"
        self.fallback_model = "gemini-3.8-flash"

    @property
    def api_key(self) -> str:
        return settings.GEMINI_API_KEY

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    def generate_description_summary(self, description_text: str) -> Optional[str]:
        """
        Synthesizes property descriptions using Google Gemini.
        Falls back safely to local NLP if API is offline or key is unconfigured.
        """
        if not self.is_configured() or not description_text or len(description_text.strip()) < 10:
            return None

        prompt = (
            "You are a professional real estate analyst. In 1 or 2 concise, objective sentences, "
            f"summarize the key highlights and value appeal of this property listing:\n\n{description_text}"
        )

        for model in [self.primary_model, self.fallback_model]:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            try:
                resp = requests.post(
                    url,
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }]
                    },
                    timeout=5
                )
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
            except Exception:
                continue

        return None

gemini_service = GeminiService()
