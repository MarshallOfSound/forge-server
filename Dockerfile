FROM node:7.3.0

COPY package.json package.json

RUN npm install

EXPOSE 3000

CMD npm run start-prod