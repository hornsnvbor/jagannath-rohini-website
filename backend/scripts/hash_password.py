"""
Run this once to generate ADMIN_PASSWORD_HASH for your .env file.
Usage: python scripts/hash_password.py "YourStrongPassword123!"
"""
import sys
import bcrypt

if len(sys.argv) != 2:
    print("Usage: python scripts/hash_password.py <password>")
    sys.exit(1)

print(bcrypt.hashpw(sys.argv[1].encode("utf-8"), bcrypt.gensalt()).decode("utf-8"))
