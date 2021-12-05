FROM node:16-alpine as base

WORKDIR /usr/source/

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY src ./src
COPY tsconfig*.json ./

RUN npm run build

RUN npm prune --production

FROM base

WORKDIR /usr/app/

COPY --from=base /usr/source/node_modules ./node_modules
COPY --from=base /usr/source/dist ./dist

EXPOSE 8080

CMD ["node", "./dist/main.js"]
