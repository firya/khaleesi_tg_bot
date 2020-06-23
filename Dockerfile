FROM node:14.4-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

RUN npm install -g nodemon

COPY ./public/package*.json ./

USER node

RUN npm install

COPY --chown=node:node ./public .

EXPOSE 8080

CMD ["nodemon", "app.js"]