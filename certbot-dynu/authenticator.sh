#!/bin/bash
set -e

API_BASE="https://api.dynu.com/v2"
API_KEY="${DYNU_API_KEY}"
RECORDS_DIR="/tmp/certbot-dynu-records"

if [ -z "$API_KEY" ]; then
  echo "ERROR: DYNU_API_KEY environment variable is not set" >&2
  exit 1
fi

AUTH_DOMAIN="${CERTBOT_DOMAIN}"
VALIDATION="${CERTBOT_VALIDATION}"

mkdir -p "${RECORDS_DIR}"

echo "DNS-01 authenticator: Adding TXT record for ${AUTH_DOMAIN}"

DOMAINS_JSON=$(curl -s -X GET "${API_BASE}/dns" \
  -H "API-Key: ${API_KEY}" \
  -H "accept: application/json")

DOMAIN_ID=$(echo "${DOMAINS_JSON}" | /usr/bin/python3 -c "
import sys, json
data = json.load(sys.stdin)
target = '${AUTH_DOMAIN}'.lower()
for d in data.get('domains', []):
    name = d.get('name', '').lower()
    if name == target or target.endswith('.' + name):
        print(d['id'])
        sys.exit(0)
print('', end='')
sys.exit(0)
")

if [ -z "${DOMAIN_ID}" ]; then
  echo "ERROR: Could not find domain '${AUTH_DOMAIN}' in Dynu account" >&2
  echo "Domains found: $(echo "${DOMAINS_JSON}" | /usr/bin/python3 -c "import sys,json;d=json.load(sys.stdin);print(', '.join([x.get('name','') for x in d.get('domains',[])]))")" >&2
  exit 1
fi

FULL_ZONE=$(echo "${DOMAINS_JSON}" | /usr/bin/python3 -c "
import sys, json
data = json.load(sys.stdin)
target = '${AUTH_DOMAIN}'.lower()
for d in data.get('domains', []):
    name = d.get('name', '').lower()
    if name == target or target.endswith('.' + name):
        print(name)
        sys.exit(0)
")

ZONE_SUFFIX=".${FULL_ZONE}"
NODE_NAME="_acme-challenge.${AUTH_DOMAIN}"
if [[ "${NODE_NAME}" == *"${ZONE_SUFFIX}" ]]; then
  NODE_NAME="${NODE_NAME%${ZONE_SUFFIX}}"
fi

echo "  Domain ID: ${DOMAIN_ID} (${FULL_ZONE})"
echo "  Node name: ${NODE_NAME}"
echo "  TXT value: ${VALIDATION}"

RECORD_JSON=$(curl -s -X POST "${API_BASE}/dns/${DOMAIN_ID}/record" \
  -H "API-Key: ${API_KEY}" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d "{\"nodeName\":\"${NODE_NAME}\",\"recordType\":\"TXT\",\"ttl\":90,\"state\":true,\"textData\":\"${VALIDATION}\"}")

RECORD_ID=$(echo "${RECORD_JSON}" | /usr/bin/python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    rid = data.get('id')
    if rid:
        print(rid)
except: pass
")

if [ -z "${RECORD_ID}" ]; then
  echo "ERROR: Failed to create TXT record. Response: ${RECORD_JSON}" >&2
  exit 1
fi

echo "  Record created, ID: ${RECORD_ID}"

RECORDS_FILE="${RECORDS_DIR}/${AUTH_DOMAIN}.txt"
echo "${DOMAIN_ID}:${RECORD_ID}:${NODE_NAME}" > "${RECORDS_FILE}"

echo "  Triggering Dynu DNS service refresh..."
curl -s -X GET "${API_BASE}/dns/update" \
  -H "API-Key: ${API_KEY}" \
  -H "accept: application/json" >/dev/null 2>&1 || true

echo "  Waiting 20s for DNS propagation..."
sleep 20

echo "DNS-01 authenticator: Done for ${AUTH_DOMAIN}"
