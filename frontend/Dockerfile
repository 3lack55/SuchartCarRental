FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_HOST
ARG VITE_API_PORT
ARG VITE_API_PROTOCOL
ENV VITE_API_HOST=$VITE_API_HOST
ENV VITE_API_PORT=$VITE_API_PORT
ENV VITE_API_PROTOCOL=$VITE_API_PROTOCOL

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
