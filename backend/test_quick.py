from fastapi.testclient import TestClient
from app.main import app

c = TestClient(app)

# Test health
r = c.get('/api/health')
print(f'health: {r.status_code} {r.json()}')

# Test config
r = c.get('/api/config')
print(f'config: {r.status_code} {r.json()}')

# Test blog
r = c.get('/api/blog')
print(f'blog: {r.status_code} len={len(r.json()) if r.status_code == 200 else "err"}')

# Test gallery
r = c.get('/api/gallery')
print(f'gallery: {r.status_code} len={len(r.json()) if r.status_code == 200 else "err"}')

# Test live status
r = c.get('/api/live/status')
print(f'live/status: {r.status_code} {r.json()}')

# Test docs
r = c.get('/api/docs')
print(f'docs: {r.status_code}')

# Test membership
r = c.post('/api/membership', json={'name': 'Test', 'email': 'test@test.com', 'phone': '9876543210'})
print(f'membership: {r.status_code}')

# Test seva
r = c.post('/api/seva', json={'name': 'Test', 'email': 'test@test.com', 'phone': '9876543210', 'seva_type': 'abhishek'})
print(f'seva: {r.status_code}')

# Test login
r = c.post('/api/login', json={'email': 'admin@jagannathmandirrohini.com', 'password': 'TestAdmin123!'})
print(f'login: {r.status_code} {r.json() if r.status_code == 200 else r.json()}')

# Test donations no auth
r = c.post('/api/donations', json={'amount': 100, 'name': 'Test', 'email': 'test@test.com', 'phone': '9876543210'})
print(f'donations noauth: {r.status_code}')

# Test webhook bad sig
r = c.post('/api/donations/webhook', json={'signature': 'bad', 'event': {'event_type': 'payment.captured', 'payload': {}}}, headers={'X-Razorpay-Signature': 'badsig'})
print(f'webhook badsig: {r.status_code}')

print('\nAll basic tests done')