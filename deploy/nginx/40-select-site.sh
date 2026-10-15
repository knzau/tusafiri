#!/bin/sh
set -eu

if [ -z "${APP_DOMAIN:-}" ]; then
  echo "APP_DOMAIN is required" >&2
  exit 1
fi

cert="/etc/letsencrypt/live/${APP_DOMAIN}/fullchain.pem"
key="/etc/letsencrypt/live/${APP_DOMAIN}/privkey.pem"
conf="/etc/nginx/conf.d/default.conf"

cat > "$conf" <<EOF
server_tokens off;
limit_req_zone \$binary_remote_addr zone=general:10m rate=20r/s;

server {
  listen 80;
  listen [::]:80;
  server_name ${APP_DOMAIN};

  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }

  location / {
    return 301 https://\$host\$request_uri;
  }
}
EOF

if [ -f "$cert" ] && [ -f "$key" ]; then
  cat >> "$conf" <<EOF
server {
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  server_name ${APP_DOMAIN};

  ssl_certificate ${cert};
  ssl_certificate_key ${key};
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_session_timeout 1d;
  ssl_session_cache shared:SSL:10m;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options nosniff always;
  add_header X-Frame-Options SAMEORIGIN always;
  add_header Referrer-Policy no-referrer always;

  location / {
    limit_req zone=general burst=40 nodelay;
    proxy_pass http://web:3000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF
fi
