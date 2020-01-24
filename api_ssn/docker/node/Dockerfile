FROM node:latest

WORKDIR /web/api/
RUN npm install
RUN npm install -g nodemon
EXPOSE 3011
CMD [ "nodemon", "server.js" ]