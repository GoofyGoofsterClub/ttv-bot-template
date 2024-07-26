FROM node:19

WORKDIR /usr/src/bot

COPY package*.json .

RUN npm install --save-dev

COPY . .

RUN npx tsc && npx tsc-alias

CMD [ "node", "./dist/index.js" ]
