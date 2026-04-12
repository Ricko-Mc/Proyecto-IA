from urllib.parse import parse_qs, urlparse

YOUTUBE_EMBED_PARAMS = "autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1"

def extraer_youtube_id(referencia: str | None) -> str | None:
    if not referencia:
        return None

    valor = referencia.strip()
    if len(valor) == 11 and all(c.isalnum() or c in "_-" for c in valor):
        return valor

    parsed = urlparse(valor)
    host = parsed.netloc.lower()
    path = parsed.path.strip("/")

    if "youtu.be" in host and path:
        return path.split("/")[0][:11]

    if "youtube.com" in host or "youtube-nocookie.com" in host:
        if path == "watch":
            return parse_qs(parsed.query).get("v", [None])[0]
        if path.startswith("embed/"):
            return path.split("/", 1)[1][:11]
        if path.startswith("shorts/"):
            return path.split("/", 1)[1][:11]

    return None

def construir_url_embed_youtube(referencia: str | None) -> str | None:
    video_id = extraer_youtube_id(referencia)
    if not video_id:
        return None
    return (
        f"https://www.youtube-nocookie.com/embed/{video_id}?{YOUTUBE_EMBED_PARAMS}"
        f"&loop=1&playlist={video_id}"
    )
