FROM node:12

ENV PATH=$PATH:/home/node/node_modules/.bin

WORKDIR /home/node

RUN chown node /home/node

USER node

COPY package*.json ./home/node

COPY . .

RUN yarn install

EXPOSE 80

CMD ["yarn", "start"]
