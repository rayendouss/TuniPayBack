FROM node:17-alpine

RUN npm install -g nodemon

WORKDIR /TuniPayBack

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000
# required for docker desktop port mapping

CMD ["npm", "start"]