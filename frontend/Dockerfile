ARG NODE_VERSION=22.17.1

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build the app
FROM deps AS build
COPY . .
RUN npm run build

# Production image
FROM nginx:alpine AS final

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]