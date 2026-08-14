#!/bin/bash
set +e

API_BASE="https://api.dynu.com/v2"
API_KEY="${DYNU_API_KEY}"
RECORDS_DIR="/tmp/certbot-dynu-records"

AUTH_DOMAIN="${CERTBOT_DOMAIN}"

if [ -z "$API_KEY" ]; then
  echo "ERROR: DYNU_API_KEY environment variable is not set" >&2
  exit 1
fi

echo "DNS-01 cleanup: Removing TXT record for ${AUTH_DOMAIN}"

RECORDS_FILE="${RECORDS_DIR}/${AUTH_DOMAIN}.txt"
if [ ! -f "${RECORDS_FILE}" ]; then
  echo "  No record file found at ${RECORDS_FILE}, skipping cleanup"
  exit 0
fi

LINE=$(cat "${RECORDS_FILE}")
DOMAIN_ID=$(echo "${LINE}" | cut -d: -f1)
RECORD_ID=$(echo "${LINE}" | cut -d: -f2)
NODE_NAME=$(echo "${LINE}" | cut -d: -f3)

if [ -z "${DOMAIN_ID}" ] || [ -z "${RECORD_ID}" ]; then
  echo "  Invalid record data, skipping cleanup"
  exit 0
fi

echo "  Deleting record ${RECORD_ID} (domain ${DOMAIN_ID}, node ${NODE_NAME})"

RESPONSE=$(curl -s -X DELETE "${API_BASE}/dns/${DOMAIN_ID}/record/${RECORD_ID}" \
  -H "API-Key: ${API_KEY}" \
  -H "accept: application/json")

STATUS_CODE=$(echo "${RESPONSE}" | /usr/bin/python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    sc = d.get('statusCode')
    if sc: print(sc)
except: pass
")

if [ "${STATUS_CODE}" = "200" ] || [ -z "${STATUS_CODE}" ]; then
  echo "  Record deleted successfully"
else
  echo "  Warning: Delete may have failed. Response: ${RESPONSE}"
fi

rm -f "${RECORDS_FILE}"

echo "DNS-01 cleanup: Done for ${AUTH_DOMAIN}"
