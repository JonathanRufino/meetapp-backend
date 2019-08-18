FROM node:10-alpine

WORKDIR /usr/app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

EXPOSE 3000 5432 27017 6379

RUN yarn build

RUN npx sequelize db:migrate

CMD ["yarn", "dev"]
