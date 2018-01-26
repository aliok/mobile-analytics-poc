FROM timescale/prometheus-postgresql-adapter:latest

COPY wait-for /

RUN chmod +x /wait-for

ENTRYPOINT ["/bin/sh"]