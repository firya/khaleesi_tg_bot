FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY telegram ./telegram
COPY Russian ./Russian
COPY nlp.js ./
COPY test ./test
RUN npm test

FROM node:22-alpine
WORKDIR /app
RUN apk upgrade --no-cache && rm -rf /usr/local/lib/node_modules/npm /opt/yarn-*
COPY --from=dependencies /app/node_modules ./node_modules
COPY telegram ./telegram
COPY Russian ./Russian
COPY index.js nlp.js package.json ./
EXPOSE 80
CMD ["node", "index.js"]
