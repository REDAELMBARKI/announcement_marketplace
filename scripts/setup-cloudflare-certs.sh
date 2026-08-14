#!/usr/bin/env bash
set -euo pipefail

# ── setup-cloudflare-certs.sh ────────────────────────────────────────────────
# Writes Cloudflare origin cert + private key (from env vars $CF_CERT / $CF_KEY)
# into ./cloudflare-origin/, or falls back to a short-lived self-signed dummy
# cert so nginx can still boot.  Also writes the public Cloudflare Authenticated
# Origin Pull (zone-level) CA bundle, then validates:
#   - PEM structure of cert.pem / privkey.pem / AOP CA
#   - cert <-> key modulus match (the #1 cause of Cloudflare HTTP 526)
#
# Usage on server:
#   export CF_CERT="-----BEGIN CERTIFICATE-----\n..."
#   export CF_KEY="-----BEGIN PRIVATE KEY-----\n..."
#   ./scripts/setup-cloudflare-certs.sh
#
# Exit code 0 on success, non-zero (with descriptive stderr) on failure.
# Sets global variable $CERT_WROTE (via file marker) so deploy-stack.sh can tell
# the user which CF SSL mode to pick.
# ──────────────────────────────────────────────────────────────────────────────

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"

CF_CERT="${CF_CERT:-}"
CF_KEY="${CF_KEY:-}"

echo "─────────────────────────────────────────────────────────"
echo " Cloudflare origin cert / AOP CA setup"
echo "─────────────────────────────────────────────────────────"

# ── Prepare cloudflare-origin dir on the host ────────────────────────────────
sudo mkdir -p cloudflare-origin
sudo chown -R "$(id -u):$(id -g)" cloudflare-origin
chmod 700 cloudflare-origin

cd cloudflare-origin || exit 1
CERT_WROTE=0

# ── Write cert + key or fall back to self-signed dummy ──────────────────────
if [ -n "$CF_CERT" ] && [ -n "$CF_KEY" ]; then
  echo "Using Cloudflare origin cert from GitHub Secrets"
  printf '%s' "$CF_CERT" > cert.pem
  printf '%s' "$CF_KEY"  > privkey.pem
  # Ensure trailing newline (some PEM parsers choke on missing trailing \n):
  [ -n "$(tail -c 1 cert.pem    2>/dev/null)" ] && echo >> cert.pem
  [ -n "$(tail -c 1 privkey.pem 2>/dev/null)" ] && echo >> privkey.pem
  # Strip any stray Windows CR (CRLF -> LF) that break PEM parsing:
  sed -i 's/\r$//' cert.pem privkey.pem
  CERT_WROTE=1
else
  echo "CF_ORIGIN_CERT_PEM / CF_ORIGIN_PRIVKEY_PEM not set → generating self-signed dummy cert so nginx can boot."
  echo "  -> Generate real cert in Cloudflare (SSL/TLS -> Origin Server -> Create Certificate) and set the 2 secrets; then re-deploy."
  openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
    -keyout privkey.pem -out cert.pem \
    -subj "/CN=letsbeus.online/O=Self-Signed-Origin-Dummy/C=US" >/dev/null 2>&1
fi

# ── Write Cloudflare's public Origin Pull CA (zone-level) ────────────────────
# This is public, non-sensitive data.  Source:
#   https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/set-up/zone-level/#upload-the-certificate-to-your-origin
cat > cloudflare-origin-pull-ca.pem <<'CF_CA_EOF'
-----BEGIN CERTIFICATE-----
MIIGCjCCA/KgAwIBAgIIV5G6lVbCLmEwDQYJKoZIhvcNAQENBQAwgZAxCzAJBgNV
BAYTAlVTMRkwFwYDVQQKExBDbG91ZEZsYXJlLCBJbmMuMRQwEgYDVQQLEwtPcmln
aW4gUHVsbDEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzETMBEGA1UECBMKQ2FsaWZv
cm5pYTEjMCEGA1UEAxMab3JpZ2luLXB1bGwuY2xvdWRmbGFyZS5uZXQwHhcNMTkx
MDEwMTg0NTAwWhcNMjkxMTAxMTcwMDAwWjCBkDELMAkGA1UEBhMCVVMxGTAXBgNV
BAoTEENsb3VkRmxhcmUsIEluYy4xFDASBgNVBAsTC09yaWdpbiBQdWxsMRYwFAYD
VQQHEw1TYW4gRnJhbmNpc2NvMRMwEQYDVQQIEwpDYWxpZm9ybmlhMSMwIQYDVQQD
ExpvcmlnaW4tcHVsbC5jbG91ZGZsYXJlLm5ldDCCAiIwDQYJKoZIhvcNAQEBBQAD
ggIPADCCAgoCggIBAN2y2zojYfl0bKfhp0AJBFeV+jQqbCw3sHmvEPwLmqDLqynI
42tZXR5y914ZB9ZrwbL/K5O46exd/LujJnV2b3dzcx5rtiQzso0xzljqbnbQT20e
ihx/WrF4OkZKydZzsdaJsWAPuplDH5P7J82q3re88jQdgE5hqjqFZ3clCG7lxoBw
hLaazm3NJJlUfzdk97ouRvnFGAuXd5cQVx8jYOOeU60sWqmMe4QHdOvpqB91bJoY
QSKVFjUgHeTpN8tNpKJfb9LIn3pun3bC9NKNHtRKMNX3Kl/sAPq7q/AlndvA2Kw3
Dkum2mHQUGdzVHqcOgea9BGjLK2h7SuX93zTWL02u799dr6Xkrad/WShHchfjjRn
aL35niJUDr02YJtPgxWObsrfOU63B8juLUphW/4BOjjJyAG5l9j1//aUGEi/sEe5
lqVv0P78QrxoxR+MMXiJwQab5FB8TG/ac6mRHgF9CmkX90uaRh+OC07XjTdfSKGR
PpM9hB2ZhLol/nf8qmoLdoD5HvODZuKu2+muKeVHXgw2/A6wM7OwrinxZiyBk5Hh
CvaADH7PZpU6z/zv5NU5HSvXiKtCzFuDu4/Zfi34RfHXeCUfHAb4KfNRXJwMsxUa
+4ZpSAX2G6RnGU5meuXpU5/V+DQJp/e69XyyY6RXDoMywaEFlIlXBqjRRA2pAgMB
AAGjZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAGAQH/AgECMB0GA1Ud
DgQWBBRDWUsraYuA4REzalfNVzjann3F6zAfBgNVHSMEGDAWgBRDWUsraYuA4REz
alfNVzjann3F6zANBgkqhkiG9w0BAQ0FAAOCAgEAkQ+T9nqcSlAuW/90DeYmQOW1
QhqOor5psBEGvxbNGV2hdLJY8h6QUq48BCevcMChg/L1CkznBNI40i3/6heDn3IS
zVEwXKf34pPFCACWVMZxbQjkNRTiH8iRur9EsaNQ5oXCPJkhwg2+IFyoPAAYURoX
VcI9SCDUa45clmYHJ/XYwV1icGVI8/9b2JUqklnOTa5tugwIUi5sTfipNcJXHhgz
6BKYDl0/UP0lLKbsUETXeTGDiDpxZYIgbcFrRDDkHC6BSvdWVEiH5b9mH2BON60z
0O0j8EEKTwi9jnafVtZQXP/D8yoVowdFDjXcKkOPF/1gIh9qrFR6GdoPVgB3SkLc
5ulBqZaCHm563jsvWb/kXJnlFxW+1bsO9BDD6DweBcGdNurgmH625wBXksSdD7y/
fakk8DagjbjKShYlPEFOAqEcliwjF45eabL0t27MJV61O/jHzHL3dknXeE4BDa2j
bA+JbyJeUMtU7KMsxvx82RmhqBEJJDBCJ3scVptvhDMRrtqDBW5JShxoAOcpFQGm
iYWicn46nPDjgTU0bX1ZPpTpryXbvciVL5RkVBuyX2ntcOLDPlZWgxZCBp96x07F
AnOzKgZk4RzZPNAxCXERVxajn/FLcOhglVAKo5H0ac+AitlQ0ip55D2/mf8o72tM
fVQ6VpyjEXdiIXWUq/o=
-----END CERTIFICATE-----
CF_CA_EOF

chmod 600 cert.pem privkey.pem
chmod 644 cloudflare-origin-pull-ca.pem
ls -la .

# ── Validate PEM files on disk before starting anything ──────────────────────
echo "--- Validating PEM files on disk ---"

openssl x509 -in cert.pem -noout -subject -issuer -dates || {
  echo "FATAL: cert.pem is NOT a valid PEM. Dumping first/last 3 lines:"
  head -3 cert.pem; echo "..."; tail -3 cert.pem
  exit 1
}

openssl rsa -in privkey.pem -noout -check 2>&1 | head -2 || {
  echo "FATAL: privkey.pem is NOT a valid RSA private key."
  exit 1
}

echo "  Matching cert <-> key modulus (prevents Cloudflare 526 when wrong cert/key pair installed):"
CERT_MOD=$(openssl x509 -in cert.pem    -noout -modulus 2>/dev/null | openssl md5)
KEY_MOD=$(openssl rsa  -in privkey.pem -noout -modulus 2>/dev/null | openssl md5)
echo "    cert mod md5: $CERT_MOD"
echo "    key  mod md5: $KEY_MOD"
if [ "$CERT_MOD" != "$KEY_MOD" ]; then
  echo "FATAL: certificate and private key DO NOT MATCH. Cloudflare will throw 526 Invalid SSL Certificate if we proceed."
  echo "  -> Re-create the origin cert in Cloudflare (SSL/TLS -> Origin Server -> Create Certificate) and ensure BOTH CF_ORIGIN_CERT_PEM and CF_ORIGIN_PRIVKEY_PEM come from the SAME create-certificate dialog."
  exit 1
fi

openssl x509 -in cloudflare-origin-pull-ca.pem -noout -subject -issuer -fingerprint || {
  echo "FATAL: cloudflare-origin-pull-ca.pem failed PEM validation."
  exit 1
}

echo "PEM validation OK (cert+key match + CA bundle valid)."
cd "$HERE"

# ── Write marker file so deploy-stack.sh knows which CF SSL mode to recommend
echo "$CERT_WROTE" > .cert_wrote.marker
echo "Cert setup complete (CERT_WROTE=$CERT_WROTE)."
