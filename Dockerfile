FROM node:13-alpine as base

ADD . /
RUN ls /
RUN npm ci --only=production
RUN npm install @vue/cli
ENV NODE_ENV production
#RUN npx vue-cli-service build 
RUN npm run build

FROM nginx:latest

RUN mkdir /opt/reflex
RUN mkdir /opt/reflex/ssl
COPY --from=base maintenance.html /opt/reflex/ui/maintenance.html
COPY --from=base /dist /opt/reflex/ui
COPY --from=base reflex.conf /etc/nginx/conf.d/default.conf
RUN openssl dhparam -dsaparam -out /opt/reflex/ssl/ssl-dhparams.pem 4096
RUN openssl req -new -newkey rsa:4096 -days 3650 -nodes -x509 \
                -subj "/C=US/ST=IL/O=H & A Security Solutions, LLC/CN=reflexsoar" \
                -keyout /opt/reflex/ssl/server.key  -out /opt/reflex/ssl/server.crt
EXPOSE 80
EXPOSE 443