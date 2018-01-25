
1. Start ElasticSearch + Kibana

```
docker-compose -f elastic-search-kibana-docker-compose.yml up
```

2. Create fixed data OR create continous event stream
```
npm install

node elasticSearchFixedData.js 
# OR
node elasticSearchEventStreams.js

```

3. Configure Kibana.

Go to http://localhost:5601/app/kibana#/management/kibana/indices

Create 3 index patterns:

- default-metrics*
- default-event-metrics*
- custom-button-metrics*

Make sure you select "timestamp" field as the "Time Filter field name".


4. Import Kibana objects.

Go to http://localhost:5601/app/kibana#/management/kibana/objects

Import the file "export.json".

5. Enjoy

Go to http://localhost:5601/app/kibana#/visualize and pick stuff.

Some data is historical. So, make sure you select a wider date range (top right corner) if you see nothing.


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

Basically we have 2 parts: