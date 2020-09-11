FROM node:14.3.0

WORKDIR /

COPY ./ ./

RUN npm install