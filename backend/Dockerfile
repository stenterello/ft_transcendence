FROM node:18-alpine as dev
RUN apk --update add postgresql-client

WORKDIR /usr/src/backend

COPY package*.json ./
COPY prisma ./prisma/
COPY uploads /usr/src/backend/uploads/

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine as prod
RUN apk --update add postgresql-client

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/backend

COPY prisma ./prisma/
COPY package*.json ./

RUN npm install --production

COPY . .

COPY --from=dev /backend/node_modules ./node_modules
COPY --from=dev /backend/package*.json ./
COPY --from=dev /backend/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
