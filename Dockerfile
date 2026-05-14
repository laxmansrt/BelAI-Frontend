# ── Stage 1: Build the static frontend ───────────────────────
# (Frontend is a static HTML app — no build step needed)
FROM nginx:1.27-alpine AS runner

LABEL org.opencontainers.image.title="BelAI Frontend"
LABEL org.opencontainers.image.description="BELAI Agricultural AI — Static Frontend served via Nginx"
LABEL org.opencontainers.image.version="1.0.0"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static frontend files
COPY . /usr/share/nginx/html/

# Custom nginx config for SPA / PWA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

