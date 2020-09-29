FROM node:12-alpine

ENV PATH=$PATH:/home/node/node_modules/.bin

USER root 

WORKDIR /home/node

COPY package.json package.json

RUN npm install

CMD ["npm", "start"]
