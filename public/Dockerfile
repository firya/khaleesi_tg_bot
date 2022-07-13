FROM node:alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY  ./ ./

EXPOSE 8080

RUN npm install -g nodemon
CMD ["nodemon", "app.js"]