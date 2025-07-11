FROM node:18-alpine AS build
ARG REACT_APP_API_URL
ARG NODE_ENV=production
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=$NODE_ENV
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy build files with explicit ownership
COPY --from=build --chown=nginx:nginx /app/build /usr/share/nginx/html
# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Create cache directories with proper permissions
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    mkdir -p /var/run && \
    chown -R nginx:nginx /var/run && \
    chmod -R 755 /var/cache/nginx
# Switch to non-root user
USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]