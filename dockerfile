FROM node:14.3.0

WORKDIR /home/doksen/coding/smartbrainAPP/API

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]