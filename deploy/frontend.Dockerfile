FROM node:22-bookworm-slim AS build

WORKDIR /workspace

COPY packages/swap-sdk ./v2-sdk
RUN npm ci --prefix v2-sdk --ignore-scripts \
    && npm run build --prefix v2-sdk

COPY apps/web/package.json apps/web/package-lock.json ./uniswap-interface/
RUN npm ci --prefix uniswap-interface --legacy-peer-deps --ignore-scripts

COPY apps/web ./uniswap-interface

ARG VITE_API_BASE
ARG VITE_CHAIN_ID=1
ARG VITE_NETWORK_URL=https://cloudflare-eth.com
ARG VITE_GIWA_RPC=https://sepolia-rpc.giwa.io
ARG VITE_GIWA_EXPLORER=https://sepolia-explorer.giwa.io
ARG VITE_GIWA_CHAIN_ID=91342

ENV VITE_API_BASE=${VITE_API_BASE} \
    VITE_CHAIN_ID=${VITE_CHAIN_ID} \
    VITE_NETWORK_URL=${VITE_NETWORK_URL} \
    VITE_GIWA_RPC=${VITE_GIWA_RPC} \
    VITE_GIWA_EXPLORER=${VITE_GIWA_EXPLORER} \
    VITE_GIWA_CHAIN_ID=${VITE_GIWA_CHAIN_ID}

RUN npm run build --prefix uniswap-interface

FROM nginx:1.27-alpine

ARG NGINX_CONFIG=deploy/nginx.conf
COPY ${NGINX_CONFIG} /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/uniswap-interface/dist /usr/share/nginx/html
RUN chmod -R a+rX /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
