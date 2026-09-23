# set base image (host OS)
FROM python:3.8-bookworm

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get -y update && apt-get install -y \
    curl nano wget nginx git ca-certificates gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 16 + Yarn (react-scripts 4.x is incompatible with Node 17+)
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/*

ENV ENV_TYPE staging
ENV MONGO_HOST mongo
ENV MONGO_PORT 27017
##########

ENV PYTHONPATH=$PYTHONPATH:/src/

# copy the dependencies file to the working directory
COPY src/requirements.txt .

# install dependencies
RUN pip install "pip<24.1" && pip install --default-timeout=100 -r requirements.txt
