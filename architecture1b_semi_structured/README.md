# Overview

![Overview](./screenshots/architecture1b-overview.png?raw=true "Overview")


### Instructions

1. Start everything:

```
cd architecture1b_semi_structured
docker-compose -f docker-compose.yml up
```

2. Create database:

```
shell> psql -U postgres -h localhost

sql> CREATE DATABASE aerogear2;
sql> \c aerogear2;
sql> CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE; 
```



3. Create fixed data OR create continuous event stream:

```
cd architecture1b_semi_structured
nvm use
npm install

node fixedData.js 
# OR
node eventStreams.js
```

4. Create Grafana data sources:

```
curl --user admin:admin 'http://localhost:3000/api/datasources' -X POST -H 'Content-Type: application/json;charset=UTF-8' \
 --data-binary '{"orgId":1,"name":"PostgreSQL","type":"postgres","access":"proxy","url":"timescaledb:5432","password":"","user":"postgres","database":"aerogear2","basicAuth":false,"isDefault":true,"jsonData":{"sslmode":"disable"}}'
```

5. Import Grafana Dashboards

Go to <http://localhost:3000/dashboard/new?editview=import&orgId=1> and feed `grafana-dashboard.json`.

### Notes

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