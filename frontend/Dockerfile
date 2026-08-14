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

FROM nginx:alpine AS final

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]