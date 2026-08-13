import time

import httpx
from fastapi import APIRouter

from app.config import settings

router = APIRouter(prefix="/api/live", tags=["live"])

_cache: dict = {"data": None, "expires_at": 0}
CACHE_SECONDS = 60  # don't hammer the YouTube API on every homepage load


@router.get("/status")
async def live_status():
    """
    Returns whether the temple's YouTube channel is currently live, and the
    video_id to embed if so. Frontend polls this every ~60s on the homepage
    to decide whether to show the Live Aarti banner.
    """
    now = time.time()
    if _cache["data"] is not None and now < _cache["expires_at"]:
        return _cache["data"]

    result = {"is_live": False, "video_id": None, "title": None}

    if settings.YOUTUBE_API_KEY and settings.YOUTUBE_CHANNEL_ID:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
                    "https://www.googleapis.com/youtube/v3/search",
                    params={
                        "part": "snippet",
                        "channelId": settings.YOUTUBE_CHANNEL_ID,
                        "eventType": "live",
                        "type": "video",
                        "key": settings.YOUTUBE_API_KEY,
                    },
                )
                data = resp.json()
                items = data.get("items", [])
                if items:
                    result = {
                        "is_live": True,
                        "video_id": items[0]["id"]["videoId"],
                        "title": items[0]["snippet"]["title"],
                    }
        except Exception:
            pass  # fail quiet — homepage just won't show the live banner

    _cache["data"] = result
    _cache["expires_at"] = now + CACHE_SECONDS
    return result
