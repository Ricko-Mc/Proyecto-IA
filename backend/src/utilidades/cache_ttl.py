from collections import OrderedDict
from threading import RLock
import time
from typing import Generic, TypeVar


K = TypeVar("K")
V = TypeVar("V")


class CacheTTL(Generic[K, V]):
    """Cache en memoria con expiracion TTL y politica LRU basica."""

    def __init__(self, ttl_seconds: int, max_items: int = 512):
        self.ttl_seconds = max(1, ttl_seconds)
        self.max_items = max(1, max_items)
        self._store: OrderedDict[K, tuple[float, V]] = OrderedDict()
        self._lock = RLock()

    def get(self, key: K) -> V | None:
        now = time.monotonic()
        with self._lock:
            item = self._store.get(key)
            if item is None:
                return None

            expires_at, value = item
            if expires_at <= now:
                self._store.pop(key, None)
                return None

            self._store.move_to_end(key)
            return value

    def set(self, key: K, value: V) -> None:
        now = time.monotonic()
        with self._lock:
            self._store[key] = (now + self.ttl_seconds, value)
            self._store.move_to_end(key)

            while len(self._store) > self.max_items:
                self._store.popitem(last=False)
