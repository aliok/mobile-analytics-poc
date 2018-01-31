
1. Start ElasticSearch + Kibana

```
cd architecture1
docker-compose -f docker-compose.yml up
```

2. Create fixed data OR create continuous event stream
```
cd architecture1
nvm use
npm install

node fixedData.js 
# OR
node eventStreams.js

```

3. Import Kibana objects.

```
cd architecture1
curl -XPOST localhost:5601/api/kibana/dashboards/import -H 'kbn-xsrf:true' -H 'Content-type:application/json' -d @./kibana-dashboard-export.json
```


4. Enjoy

Go to <http://localhost:5601/app/kibana#/visualize> and pick stuff.

If you see a warning like "No default index", go to one of the indices and press the star button to mark it as default.

If you used "fixedData.js", data is historical. Make sure you select a wider date range (top right corner) if you see nothing.


---------------------------------------------

### Notes

##### Resetting everything

```
docker-compose -f docker-compose.yml rm
docker-compose -f docker-compose.yml up
```

##### Exporting Kibana Dashboard (how kibana-dashboard-export.json was created)

```
curl -XGET localhost:5601/api/kibana/dashboards/export?dashboard=50eaf280-01c5-11e8-b885-6707ea41b5e2 > kibana-dashboard-export.json
```

---------------------------------------------

### General information

There are 3 document types:

- default-metrics/sdkVersionForClient: Basically a <clientId, sdkVersion> map.
- default-event-metrics/initSDK: Init sdk events are streamed to here.
- custom-button-metrics: Some custom metrics are streamed to here.


Note that "default-metrics/sdkVersionForClient" is non-time-series data.
For a client, we only have 1 entry. That's why an "upsert" operation is used on ElasticSearch side.

However, we also have a timestamp there. This is something extra that can be useful to see something like,
"Out of clients that have opened the mobile app in last N days, what's the sdk usage?"

### Data generated

`fixtures.js` is basically a simulation events coming from mobile apps. Instead of mobile apps pushing stuff, this script generates events.


----------------------------------------------

### Screenshots

![Screenshot0](./screenshots/es-00-overview.png?raw=true "Screenshot")
![Screenshot1](./screenshots/es-01-numberOfClientsPerSDKVersion.png?raw=true "Screenshot")
![Screenshot2](./screenshots/es-02-sdkInitCountsPerVersion.png?raw=true "Screenshot")
![Screenshot3](./screenshots/es-03-customMetrics.png?raw=true "Screenshot")
