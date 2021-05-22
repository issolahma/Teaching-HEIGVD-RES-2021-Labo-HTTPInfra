FROM node:14.17

RUN apt update && apt install -y vim

COPY src /opt/app

CMD ["node", "/opt/app/index.js"]

# docker build -t res/express .
