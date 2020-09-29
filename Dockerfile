FROM node:12-alpine

ENV PATH=$PATH:/home/node/node_modules/.bin

USER root 

WORKDIR /home/node

COPY . .

RUN npm install

CMD ["npm", "start"]
