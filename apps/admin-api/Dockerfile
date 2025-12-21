FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=8001


WORKDIR /app

COPY package*.json ./

RUN npm --omit=dev -f install

COPY dist .

CMD [ "node", "main.js" ]
