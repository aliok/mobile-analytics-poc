1. Start everything:

```
cd architecture1
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up
```

2. Create fixed data OR create continuous event stream:

```
cd architecture1
nvm use
npm install

node fixedData.js 
# OR
node eventStreams.js
```




### Notes

`prometheus_postgresql_adapter starts` too early before postgres becomes ready by default.

I tried using https://github.com/Eficode/wait-for but the `nc` command in prometheus_postgresql_adapter image doesn't have `-z` option and thus port scanning does not work.

Thus, I wrote a small script that waits N seconds before starting the `prometheus-postgresql-adapter` command.

