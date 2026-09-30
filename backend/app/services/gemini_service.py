"""
Google Gemini Intelligence Service
Uses GEMINI_API_KEY from backend environment for advanced LLM-powered property description synthesis
and natural language inquiry analysis with graceful academic fallback.
"""
import time
import requests
from typing import Optional, Dict, Any
from app.config import settings

class GeminiService:
    def __init__(self):
        # Priority list of production Gemini models on Google AI Studio
        self.candidate_models = [
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3-flash-preview"
        ]

    @property
    def api_key(self) -> str:
        return settings.GEMINI_API_KEY

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 10)

    def ping(self) -> Dict[str, Any]:
        """Verifies active connectivity and response latency with Google Gemini API."""
        if not self.is_configured():
            return {
                "configured": False,
                "status": "missing_api_key",
                "message": "GEMINI_API_KEY environment variable is not configured."
            }

        masked_key = self.api_key[:6] + "..." + self.api_key[-4:] if len(self.api_key) > 10 else "***"
        t0 = time.time()

        for model in self.candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            try:
                resp = requests.post(
                    url,
                    json={
                        "contents": [{
                            "parts": [{"text": "Respond with exactly: Google Gemini Intelligence Online"}]
                        }]
                    },
                    timeout=10
                )
                if resp.status_code == 200:
                    latency = round(time.time() - t0, 2)
                    data = resp.json()
                    sample_reply = "Google Gemini Intelligence Online"
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            sample_reply = parts[0].get("text", "").strip()

                    return {
                        "configured": True,
                        "status": "connected",
                        "model": model,
                        "latency_seconds": latency,
                        "masked_key": masked_key,
                        "sample_reply": sample_reply,
                        "message": f"Successfully connected to Google Gemini API ({model}) in {latency}s."
                    }
            except Exception:
                continue

        return {
            "configured": True,
            "status": "unavailable",
            "masked_key": masked_key,
            "message": "Google Gemini API reached high demand or timed out. Academic local NLP fallback is active."
        }

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

        for model in self.candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            try:
                resp = requests.post(
                    url,
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }]
                    },
                    timeout=12
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
