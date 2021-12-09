FROM node:16-alpine as base

WORKDIR /usr/source/

COPY package*.json ./

RUN npm ci

COPY src ./src
COPY tsconfig.json ./tsconfig.json

RUN npm run build:prod

FROM base

WORKDIR /usr/app/

COPY --from=base /usr/source/node_modules ./node_modules
COPY --from=base /usr/source/dist ./dist

ENV NODE_ENV production

EXPOSE 8080 8081

CMD ["node", "./dist/index.js"]
