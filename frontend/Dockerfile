FROM	node:18-alpine as dev
RUN		apk --update add postgresql-client curl

WORKDIR /usr/src/frontend
COPY    package*.json ./
COPY    package-lock.json ./

RUN     npm install

COPY    . .

COPY	./configure.sh /tmp/configure_frontend.sh

EXPOSE 5173
ENTRYPOINT [ "sh", "/tmp/configure_frontend.sh" ]
