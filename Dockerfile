# syntax=docker/dockerfile:1
FROM ubuntu:latest
ENV SML_VERSION=110.99
ENV SML_CONFIG_FILENAME=config.tgz
ENV SMLROOT=/usr/share/smlnj

RUN apt-get update \
    && apt-get install -y curl build-essential rlwrap \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p ${SMLROOT} \
    && curl -o "${SMLROOT}/${SML_CONFIG_FILENAME}" http://smlnj.cs.uchicago.edu/dist/working/${SML_VERSION}/${SML_CONFIG_FILENAME} \
    && cd ${SMLROOT} \
    && tar zxvf "${SML_CONFIG_FILENAME}" \
    && rm "${SML_CONFIG_FILENAME}" \
    && config/install.sh -64

COPY docker_config/smlnj /usr/bin/smlnj
ENTRYPOINT [ "/bin/bash" ]
