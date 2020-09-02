FROM node:12-alpine

ENV PATH=$PATH:/home/node/node_modules/.bin

USER root 

WORKDIR /home/node

COPY . .

RUN yarn install

RUN tsc

CMD ["yarn", "start"]
