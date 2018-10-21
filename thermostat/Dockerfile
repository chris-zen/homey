ARG BASE_IMAGE=arm32v7/node:8-jessie
# ARG BASE_IMAGE=node:8-jessie

FROM ${BASE_IMAGE}

ARG TINI_VERSION=0.18.0

ARG TINI_ARCH=armhf
# ARG TINI_ARCH=amd64

RUN set -x \
    && apt-get update && apt-get install -y ca-certificates curl net-tools vim \
        --no-install-recommends \
    && curl -fSL "https://github.com/krallin/tini/releases/download/v${TINI_VERSION}/tini-${TINI_ARCH}" -o /usr/local/bin/tini \
    && curl -fSL "https://github.com/krallin/tini/releases/download/v${TINI_VERSION}/tini-${TINI_ARCH}.asc" -o /usr/local/bin/tini.asc \
    && export GNUPGHOME="$(mktemp -d)" \
    && gpg --keyserver ha.pool.sks-keyservers.net --recv-keys 6380DC428747F6C393FEACA59A84159D7001A4E5 \
    && gpg --batch --verify /usr/local/bin/tini.asc /usr/local/bin/tini \
    && rm -r "$GNUPGHOME" /usr/local/bin/tini.asc \
    && chmod +x /usr/local/bin/tini \
    && tini -h \
    && apt-get purge --auto-remove -y ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["/usr/local/bin/tini", "--"]

WORKDIR /home/node

COPY backend/package*.json ./

RUN npm install --only=production

COPY backend/build/ ./
COPY frontend/build/ ./public/

ENV PORT=9000
ENV NODE_ENV=production
ENV DEBUG="thermostat:*,express:*"

EXPOSE ${PORT}

CMD [ "npm", "run", "start-prod" ]
