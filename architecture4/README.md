# Overview

![Overview](./screenshots/architecture4-overview.png?raw=true "Overview")


### Instructions

1. Start everything:

```
cd architecture4
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up
```

2. Create fixed data OR create continuous event stream:

```
cd architecture4
nvm use
npm install

node fixedData.js 
# OR
node eventStreams.js
```

3. Create Grafana data sources:

```
# for Prometheus
curl --user admin:admin 'http://localhost:3000/api/datasources' -X POST -H 'Content-Type: application/json;charset=UTF-8' \
 --data-binary '{"orgId":1,"name":"Prometheus","type":"prometheus","access":"proxy","url":"http://prometheus:9090","password":"","user":"","database":"","basicAuth":false,"isDefault":true,"jsonData":{}}'
 
# for Postgres
curl --user admin:admin 'http://localhost:3000/api/datasources' -X POST -H 'Content-Type: application/json;charset=UTF-8' \
 --data-binary '{"orgId":1,"name":"PostgreSQL","type":"postgres","access":"proxy","url":"pg_prometheus:5432","password":"","user":"postgres","database":"postgres","basicAuth":false,"isDefault":false,"jsonData":{"sslmode":"disable"}}'
```

4. Import Grafana Dashboards

Go to <http://localhost:3000/dashboard/new?editview=import&orgId=1> and feed `grafana-dashboard.json`.

### Notes

#### Image building for prometheus_posgresql_adapter

`prometheus_postgresql_adapter starts` too early before postgres becomes ready by default.

I tried using https://github.com/Eficode/wait-for but the `nc` command in prometheus_postgresql_adapter image doesn't have `-z` option and thus port scanning does not work.

Thus, I wrote a small script that waits N seconds before starting the `prometheus-postgresql-adapter` command.

#### Getting Grafana datasources:

```
curl --user admin:admin http://localhost:3000/api/datasources
```

Delete id from the items to feed them to Grafana again.



### Data generated

`fixtures.js` is basically a simulation events coming from mobile apps. Instead of mobile apps pushing stuff, this script generates events.


----------------------------------------------

### Screenshots

![Screenshot0](./screenshots/grafana.png?raw=true "Screenshot")