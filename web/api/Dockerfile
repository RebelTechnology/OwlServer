FROM node:16.5-buster

COPY ./api /api
WORKDIR /api

RUN yarn install

COPY ./scripts/patch-builder /patch-builder/

RUN mkdir /patch-files && \
    mkdir /patch-builder/build-src && \
    mkdir /patch-builder/build-tmp && \
    mkdir /patch-builder/build-js && \
    mkdir /patch-builder/build-c

RUN apt update && \
    apt upgrade -y && \
    apt install -y build-essential make gcc-arm-none-eabi gcc

RUN git clone https://github.com/pingdynasty/OwlProgram /opt/OwlProgram

RUN cd /opt/OwlProgram && \
    git submodule init && \
    git submodule update

ENV TOOLROOT = /usr/bin/

RUN apt install -y python python-enum34 python-jinja2 python-nose2 && \
    git clone https://github.com/pingdynasty/hvcc.git

RUN apt install -y libasound2-dev libcurl4-openssl-dev pkg-config && \
    git clone https://github.com/pingdynasty/FirmwareSender && \
    cd FirmwareSender/Builds/Linux && \
    make && \
    cp build/FirmwareSender /opt/OwlProgram/Tools && \
    cd /api

EXPOSE 3000

ENTRYPOINT /api/bin/www
CMD /api/bin/www
