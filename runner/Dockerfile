# syntax=docker/dockerfile:1
FROM node:16
ENV SML_VERSION=110.99
ENV SML_CONFIG_FILENAME=config.tgz
ENV SMLROOT=/usr/share/smlnj
ENV TERM=xterm-256color

RUN apt-get update \
    && apt-get install -y rlwrap \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p ${SMLROOT} \
    && curl -o "${SMLROOT}/${SML_CONFIG_FILENAME}" http://smlnj.cs.uchicago.edu/dist/working/${SML_VERSION}/${SML_CONFIG_FILENAME} \
    && cd ${SMLROOT} \
    && tar zxvf "${SML_CONFIG_FILENAME}" \
    && rm "${SML_CONFIG_FILENAME}" \
    && config/install.sh -64

COPY docker_config/smlnj /usr/bin/smlnj

RUN mkdir /runs
RUN mkdir /histories

WORKDIR /app
COPY package.json /app/package.json
RUN npm install
# change above to --production, and also set ENV NODE_ENV=production
COPY build/runner/src/server.js /app/server.js
CMD [ "node", "/app/server.js" ]
