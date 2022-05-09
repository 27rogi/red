FROM node:16.13-alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json yarn.lock ./

USER node

ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 80

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

RUN yarn build

EXPOSE 80
CMD [ "yarn", "start" ]
