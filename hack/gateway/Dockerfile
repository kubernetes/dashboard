FROM nginx

COPY hack/gateway/config /etc/nginx
COPY .dist/certificates/private.key /etc/ssl/private/localhost.key
COPY .dist/certificates/public.crt /etc/ssl/certs/localhost.crt
