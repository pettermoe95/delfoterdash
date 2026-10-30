# Development dockerfile
# Remeber to provide build argument pat (personal access token for brilliant feed)
# Should not be used in production! Need to setup a web server for that (nginx or something)
FROM node:alpine
ARG pat=must_be_provided_on_build
WORKDIR /brilliant_view_frontend

# Convert pat build arg to base64 (required by azure npm feed auth token)
# RUN echo -n $pat | base64 > .base64_token

# Install dependencies
COPY package.json yarn.lock .npmrc ./
RUN BRILLIANT_VIEW_FRONTEND_FEED_PAT_BASE64=$(echo -n $pat | base64) yarn install

# Copy sources and start
COPY . .

# Entrypoint for building static files
RUN ["chmod", "+x", "./prepare_production_build.sh"]
ENTRYPOINT ["sh", "./prepare_production_build.sh"]
CMD yarn build

# real key
# dHVjNWY0dHM2NHhteGZ0dnBia2pnNjVrbnRleXJndHR6bzJqYTdpZnJsNHhxeWtqdmduYQ==