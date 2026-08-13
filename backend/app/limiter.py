from slowapi import Limiter
from slowapi.util import get_remote_address

# Single shared instance — imported by main.py and every router that needs
# per-route rate limits. Using separate Limiter() instances per file would
# track counts independently and defeat the purpose.
limiter = Limiter(key_func=get_remote_address)
