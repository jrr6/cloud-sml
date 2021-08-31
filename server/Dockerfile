# Note: this Dockerfile must be run with the cloud-sml directory as the context directory (*not* server/)
FROM node:16

# Set up server
WORKDIR /server
COPY ["server/package.json", "server/package-lock.json", "./"]
RUN npm install -g typescript
RUN npm install --production
COPY "server/src" "./src"
COPY "server/resources" "./resources"
COPY "server/tsconfig.json" "tsconfig.json"
RUN npm run build

# Set up client
WORKDIR /client
COPY ["client/package.json", "../client/package-lock.json", "./"]
RUN npm install --production
COPY "client/src" "./src"
COPY "client/public" "./public"
COPY "client/tsconfig.json" "tsconfig.json"
RUN npm run build

# Run server
# Note that workdir must be /server or paths won't resolve correctly
WORKDIR /server
COPY "server/docker_config/await-database.sh" "await-database.sh"
CMD ["./await-database.sh", "node", "build/server.js"]