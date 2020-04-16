FROM node:12

ENV PATH=$PATH:/home/node/node_modules/.bin

USER root 

RUN chown -R node /home/node

USER node

WORKDIR /home/node

COPY package.json ./home/node

COPY . .

RUN yarn install

EXPOSE 80

CMD ["yarn", "start"]
