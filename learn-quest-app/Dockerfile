FROM node:20

WORKDIR /app

# Copy manifests first to leverage cache
COPY package*.json ./
# If you have these, they help the cache too:
COPY angular.json tsconfig*.json ./
# Copy proxy into the image so CMD can reference it
COPY proxy.conf.json ./

RUN npm ci && npm i -g @angular/cli

# Now copy source
COPY . .

EXPOSE 4200
# IMPORTANT: use the proxy config
CMD ["npx","ng","serve","--host","0.0.0.0","--port","4200","--proxy-config","proxy.conf.json"]
