#
FROM debian:sid

RUN apt-get update -y && apt-get install -y nodejs golang nodejs-legacy npm libzmq3-dev git-core wget openjdk-7-jre

WORKDIR /src

RUN npm install bower gulp -g

RUN wget https://github.com/tools/godep/releases/download/v34/godep_linux_amd64 -O /usr/local/bin/godep
RUN chmod +x /usr/local/bin/godep

ADD . /src

RUN npm install

RUN bower install --allow-root
