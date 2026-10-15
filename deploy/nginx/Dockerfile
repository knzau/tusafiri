# syntax=docker/dockerfile:1

FROM nginx:1.28.3-alpine@sha256:a8b39bd9cf0f83869a2162827a0caf6137ddf759d50a171451b335cecc87d236
RUN rm /etc/nginx/conf.d/default.conf
COPY 40-select-site.sh /docker-entrypoint.d/40-select-site.sh
RUN chmod +x /docker-entrypoint.d/40-select-site.sh
