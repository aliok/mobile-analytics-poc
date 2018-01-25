
1. Start ElasticSearch + Kibana

```
docker-compose up -f elastic-search-kibana-docker-compose.yml
```

2. Generate CURL statements to feed ElasticSearch
```
npm install
node generateCurl.js
```

In order to avoid all output:
```
node generateCurl.js | bash 2>&1 > /dev/null
```

3. Copy the CURL statements and execute them.

You will have the indices and data created in ElasticSearch.


4. Configure Kibana.

Go to http://localhost:5601/app/kibana#/management/kibana/indices

Create 3 index patterns:

- default-metrics*
- default-event-metrics*
- custom-button-metrics*

Make sure you select "timestamp" field as the "Time Filter field name".


5. Import objects.

Go to http://localhost:5601/app/kibana#/management/kibana/objects

Import the file "export.json".

6. Enjoy

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

`generateElasticCurl.js` is basically a simulation of an application that mobile apps can talk to.

Instead of mobile apps pushing stuff, this script generates events and then processes them.

Basically we have 2 parts:

1. Event generation: Events generated are partially random and partially static. Assume they came from mobile apps.

2. Processing of the events: In this part, the code processes the events and creates documents. Well, actually
   instead of doing real integration with ElasticSearch, I chose to generate CURL statements.
   This way requires an additional copy-paste operation but it is simpler.
