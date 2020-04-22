FROM node:12

ENV PATH=$PATH:/home/node/node_modules/.bin

USER root 

WORKDIR /home/node

COPY package.json ./home/node

COPY . .

RUN yarn install
RUN tsc

EXPOSE 80

CMD ["yarn", "start"]
