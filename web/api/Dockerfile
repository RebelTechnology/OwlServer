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

RUN git clone -b develop https://github.com/pingdynasty/OwlProgram /opt/OwlProgram

RUN cd /opt/OwlProgram && \
    git submodule init && \
    git submodule update

RUN cd /opt/OwlProgram/Tools && yarn add uglify-js && cd /api

RUN apt install -y python python-enum34 python-jinja2 python-nose2 && \
    git clone https://github.com/pingdynasty/hvcc.git

RUN apt install -y faust
RUN apt install -y php php-mongodb composer
RUN cd /patch-builder && composer install && cd /api

RUN git clone https://github.com/emscripten-core/emsdk.git && cd emsdk && \
    ./emsdk install latest && ./emsdk activate latest && . ./emsdk_env.sh && cat ./emsdk_env.sh

ENV TOOLROOT=/usr/bin/
ENV PATH=/api/emsdk:/api/emsdk/upstream/emscripten:/api/emsdk/node/14.15.5_64bit/bin:$PATH
ENV EMSDK=/api/emsdk
ENV EM_CONFIG=/api/emsdk/.emscripten
ENV EMSDK_NODE=/api/emsdk/node/14.15.5_64bit/bin/node

RUN apt install -y libasound2-dev libcurl4-openssl-dev pkg-config && \
    wget -cq https://github.com/pingdynasty/FirmwareSender/releases/download/v0.2/FirmwareSender-linux64.zip && \
    unzip FirmwareSender-linux64.zip -d /opt/OwlProgram/Tools && \
    chmod +x /opt/OwlProgram/Tools/FirmwareSender && chmod +x /opt/OwlProgram/Tools/FirmwareReceiver && \
    cd /opt/OwlProgram && make all && \
    cd /api

EXPOSE 3000

ENTRYPOINT /api/bin/www
CMD /api/bin/www
