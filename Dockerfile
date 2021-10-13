FROM nginx

RUN mkdir /opt/reflex
RUN mkdir /opt/reflex/ssl

EXPOSE 80
EXPOSE 443

ADD /dist /opt/reflex/ui

ADD reflex.conf /etc/nginx/conf.d/default.conf

RUN openssl dhparam -dsaparam -out /opt/reflex/ssl/ssl-dhparams.pem 4096
RUN openssl req -new -newkey rsa:4096 -days 3650 -nodes -x509 \
                -subj "/C=US/ST=IL/O=H & A Security Solutions, LLC/CN=reflexsoar" \
                -keyout /opt/reflex/ssl/server.key  -out /opt/reflex/ssl/server.crt