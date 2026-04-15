const DEFAULT_PARAMS = "autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1";

export function extractYouTubeId(reference: string | null | undefined): string | null {
  if (!reference) return null;

  const value = reference.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/^\/+/, '');

    if (host.includes('youtu.be') && path) {
      return path.split('/')[0].slice(0, 11);
    }

    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      if (path === 'watch') {
        const v = url.searchParams.get('v');
        return v ? v.slice(0, 11) : null;
      }
      if (path.startsWith('embed/')) {
        return path.split('/')[1]?.slice(0, 11) || null;
      }
      if (path.startsWith('shorts/')) {
        return path.split('/')[1]?.slice(0, 11) || null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function toYouTubeEmbedUrl(reference: string | null | undefined): string | null {
  const videoId = extractYouTubeId(reference);
  if (!videoId) return null;
  return (
    `https://www.youtube.com/embed/${videoId}?${DEFAULT_PARAMS}` +
    `&loop=1&playlist=${videoId}`
  );
}

export function toYouTubePlaylistEmbedUrl(
  references: string[],
  startIndex = 0
): string | null {
  const ids = references
    .map((reference) => extractYouTubeId(reference))
    .filter((id): id is string => Boolean(id));

  if (ids.length === 0) return null;

  const normalizedIndex = ((startIndex % ids.length) + ids.length) % ids.length;
  const ordered = [...ids.slice(normalizedIndex), ...ids.slice(0, normalizedIndex)];
  const first = ordered[0];
  const playlist = ordered.join(',');

  return (
    `https://www.youtube.com/embed/${first}?${DEFAULT_PARAMS}` +
    `&loop=1&playlist=${playlist}`
  );
}

export function toYouTubeThumbnailUrl(reference: string | null | undefined): string | null {
  const videoId = extractYouTubeId(reference);
  if (!videoId) return null;
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
