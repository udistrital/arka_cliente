FROM node:14
WORKDIR /app/src
COPY *.json *.js ./
RUN npm install
ENTRYPOINT ["npm", "run"]
CMD [ "start", "--", "--host", "0.0.0.0" ]
