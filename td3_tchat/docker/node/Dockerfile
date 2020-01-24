FROM node:latest

WORKDIR /web/app/
RUN npm install
EXPOSE 3010
RUN npm install -g nodemon
CMD [ "nodemon", "server.js" ]