FROM ubuntu

RUN apt-get update -yq \
    && apt-get install build-essential curl gnupg wget -yq \
    && curl -sL https://deb.nodesource.com/setup_8.x | bash \
    && apt-get install nodejs git -yq && apt-get autoremove -yq

RUN useradd -ms /bin/bash node 

WORKDIR /home/node/
RUN git clone https://github.com/freakstatic/node-object-detection.git && chown -R node:node /home/node 

USER node
WORKDIR /home/node/node-object-detection

RUN npm install

CMD ["npm", "start"]