FROM node:14
WORKDIR /app/src
COPY package*.json ./
RUN npm install
ENTRYPOINT ["npm", "run"]
CMD [ "start", "--", "--host", "0.0.0.0" ]
