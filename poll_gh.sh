#!/bin/bash
while true; do
  RESP=$(curl -s -X POST https://github.com/login/oauth/access_token \
    -d "client_id=178c6fc778ccc68e1d6a&device_code=d50d7e5da90b777a3c7e520366f1d9491eba984a&grant_type=urn:ietf:params:oauth:grant-type:device_code" \
    -H "Accept: application/json")
  
  if echo "$RESP" | grep -q '"access_token"'; then
    TOKEN=$(echo "$RESP" | jq -r .access_token)
    echo "$TOKEN" | gh auth login --with-token
    echo "SUCCESS"
    break
  fi
  sleep 5
done
