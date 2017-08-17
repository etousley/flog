FROM node:6-slim

COPY . /flog
COPY package.json /flog/package.json
COPY .env /flog/.env

WORKDIR /flog

ENV NODE_ENV production
RUN yarn install --production

CMD ["npm","start"]

EXPOSE 8888
