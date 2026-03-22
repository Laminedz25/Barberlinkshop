# ─────────────────────────────────────────────────────
# Simple production image: copy pre-built dist from CI
# ─────────────────────────────────────────────────────
FROM nginx:stable-alpine

# Copy pre-built assets (built by GitHub Actions, committed to dist/)
COPY dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
