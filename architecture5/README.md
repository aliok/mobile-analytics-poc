## Context

https://issues.jboss.org/browse/AEROGEAR-8816

## Running instructions

```
docker-compose up
node stream.js
```

stream.js will create a few events and thus few metrics in Prometheus push gateway.

## Visuzalization Instructions

Open Grafana on localhost:3000

Create data source for Prometheus:
- http://prometheus:9090
- Access: Server

Import the dashboards:
- mobile-services-new.json
- mobile-app-metrics-new.json
- mobile-security-metrics-new.json