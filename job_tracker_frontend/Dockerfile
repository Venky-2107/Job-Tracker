# Stage 1: Build the react app

FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

#Stage 2: serve with nginx

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html