import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
base = 'http://localhost:3000'

def test(name, url, method='GET', data=None):
    req = urllib.request.Request(f'{base}{url}', method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
    else:
        body = None
    try:
        with urllib.request.urlopen(req, data=body, timeout=5) as res:
            content = res.read().decode('utf-8')
            print(f'✓ [{res.status}] {name}')
            return res.status, content, res.headers
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        print(f'✗ [{e.code}] {name}: {content}')
        return e.code, content, e.headers
    except Exception as e:
        print(f'✗ ERROR {name}: {e}')
        return 0, str(e), {}

print('=== TESTING LIVELY RUNNING OFFICEX SERVER ===\n')

# 1. Sign-In Page HTML Check
status, html, _ = test('GET /login (Server-Rendered Page)', '/login')
assert 'Sign in' in html or 'OfficeX' in html, 'Sign in title not found'
assert 'officex.pro' in html, 'officex.pro brand lockup not found'
print('  -> HTML verified with canonical branding and server rendering.')

# 2. Discovery: Standard Email (Password flow)
_, res, _ = test('POST /api/auth/discover (ravi@acme.com)', '/api/auth/discover', 'POST', {'identifier': 'ravi@acme.com'})
d = json.loads(res)
assert d['next'] == 'password', f'Expected password, got {d}'
print('  -> Resolved: next=' + d['next'] + ', type=' + d['type'] + ', masked=' + d['masked'])

# 3. Discovery: Enterprise SSO (TCS / DLF)
_, res, _ = test('POST /api/auth/discover (lead@tcs.com)', '/api/auth/discover', 'POST', {'identifier': 'lead@tcs.com'})
d = json.loads(res)
assert d['next'] == 'sso', f'Expected sso, got {d}'
print('  -> Resolved: next=' + d['next'] + ', org=' + d.get('org_name', '') + ', provider=' + d.get('sso_provider', ''))

# 4. Discovery: Mobile Number (WhatsApp OTP flow)
_, res, _ = test('POST /api/auth/discover (9876543210)', '/api/auth/discover', 'POST', {'identifier': '9876543210'})
d = json.loads(res)
assert d['next'] == 'code', f'Expected code, got {d}'
print('  -> Resolved: next=' + d['next'] + ', channel=' + d['channel'] + ', masked=' + d['masked'])

# 5. OTP Send
_, res, _ = test('POST /api/auth/code/send (9876543210)', '/api/auth/code/send', 'POST', {'identifier': '9876543210', 'channel': 'whatsapp'})
d = json.loads(res)
assert d['success'] == True

# 6. OTP Verify
_, res, hdrs = test('POST /api/auth/code/verify (482910)', '/api/auth/code/verify', 'POST', {'identifier': '9876543210', 'code': '482910'})
d = json.loads(res)
assert d['success'] == True
assert len(d['memberships']) > 0
print(f'  -> Verified successfully. Found {len(d["memberships"])} memberships.')

# 7. Password Auth
_, res, hdrs = test('POST /api/auth/password (ravi@acme.com)', '/api/auth/password', 'POST', {'identifier': 'ravi@acme.com', 'password': 'mySecurePassword123'})
d = json.loads(res)
assert d['success'] == True
print('  -> Password authenticated. Primary role: ' + d['user']['role'])

# 8. Privileged MFA Trigger
_, res, _ = test('POST /api/auth/discover (admin@officex.in)', '/api/auth/discover', 'POST', {'identifier': 'admin@officex.in'})
d = json.loads(res)
assert d['mfa_required'] == True
print('  -> MFA required verified for admin account: ' + str(d['mfa_required']))

# 9. MFA Verify
_, res, _ = test('POST /api/auth/mfa/verify (123456)', '/api/auth/mfa/verify', 'POST', {'identifier': 'admin@officex.in', 'code': '123456', 'trust_device': True})
d = json.loads(res)
assert d['assurance_level'] == 'aal2'
print('  -> MFA verified at assurance level: ' + d['assurance_level'])

# 10. Account Recovery
_, res, _ = test('POST /api/auth/recover/request', '/api/auth/recover/request', 'POST', {'identifier': 'ravi@acme.com'})
_, res, _ = test('POST /api/auth/recover/confirm', '/api/auth/recover/confirm', 'POST', {'identifier': 'ravi@acme.com', 'code': '482910', 'new_password': 'NewPassword#2026', 'revoke_others': True})
d = json.loads(res)
assert d['success'] == True
print('  -> Password recovery flow confirmed.')

print('\nALL SERVER ENDPOINTS & FLOW CONTRACTS VERIFIED 100% PASS!')
