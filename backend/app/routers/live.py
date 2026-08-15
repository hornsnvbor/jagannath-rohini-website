import time

import httpx
from fastapi import APIRouter, Depends

from app.config import settings
from app.database import get_db
from app.models import SiteSetting

router = APIRouter(prefix="/api/live", tags=["live"])

_cache: dict = {"data": None, "expires_at": 0}
CACHE_SECONDS = 60  # don't hammer the YouTube API on every homepage load


def _admin_live_stream(db) -> str:
    """Admin-set stream (from the panel) takes priority over auto-detection."""
    row = db.get(SiteSetting, "live_stream")
    return row.value.strip() if row and row.value else ""


@router.get("/status")
async def live_status(db=Depends(get_db)):
    """
    Returns the live stream to embed. The admin-set `live_stream` value (a
    YouTube video id, full URL, or channel URL) wins if present; otherwise the
    YouTube API is checked for a currently-live broadcast on the channel.
    """
    now = time.time()
    if _cache["data"] is not None and now < _cache["expires_at"]:
        return _cache["data"]

    result = {"is_live": False, "video_id": None, "title": None, "embed_url": None}

    admin_stream = _admin_live_stream(db)
    if admin_stream:
        # Normalise a few common inputs into a usable embed URL.
        if "youtube.com/embed/" in admin_stream or "youtube-nocookie.com/embed/" in admin_stream:
            result["embed_url"] = admin_stream
            result["is_live"] = True
            result["title"] = "Live Darshan"
        elif admin_stream.startswith("https://www.youtube.com/watch"):
            vid = admin_stream.split("v=")[-1].split("&")[0]
            result["embed_url"] = f"https://www.youtube.com/embed/{vid}"
            result["is_live"] = True
            result["title"] = "Live Darshan"
        elif admin_stream.startswith("https://www.youtube.com/live/"):
            vid = admin_stream.rstrip("/").split("/")[-1]
            result["embed_url"] = f"https://www.youtube.com/embed/{vid}"
            result["is_live"] = True
            result["title"] = "Live Darshan"
        elif admin_stream.startswith("https://youtu.be/"):
            vid = admin_stream.rstrip("/").split("/")[-1]
            result["embed_url"] = f"https://www.youtube.com/embed/{vid}"
            result["is_live"] = True
            result["title"] = "Live Darshan"
        else:
            # Treat it as a raw YouTube video id.
            vid = admin_stream.split("?")[0].strip()
            if vid:
                result["embed_url"] = f"https://www.youtube.com/embed/{vid}"
                result["is_live"] = True
                result["title"] = "Live Darshan"
        _cache["data"] = result
        _cache["expires_at"] = now + CACHE_SECONDS
        return result

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
                        "embed_url": f"https://www.youtube.com/embed/{items[0]['id']['videoId']}",
                    }
        except Exception:
            pass  # fail quiet — homepage just won't show the live banner

    _cache["data"] = result
    _cache["expires_at"] = now + CACHE_SECONDS
    return result
