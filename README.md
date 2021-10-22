# Redis Connection Library

A very simple and small services to simplify process to connect a redis host or cluster and provide
some sugars and environments flavors.

-   Project licensed under: GPLv3
-   Site Documentation: [Homepage](https://nsfilho.github.io/redis/index.html)
-   Repository: [GitHub](https://github.com/nsfilho/redis.git)

## Environment Variables

This services use some environment variables to pre-adjust some things, like:

## Environment Variables

This services use some environment variables to pre-adjust some things, like:

-   `REDIS_${INSTANCENAME}_CLUSTER`: a redis cluster or host, example and default: `[{ port: 6379, host: '127.0.0.1' }]`;
-   `REDIS_${INSTANCENAME}_PASSWORD`: a password for access redis, example and default: `password`;
-   `REDIS_CONNECTION_POOLING`: timing between multiples connections to check for instance;

1. If you do not specify instance name in `getConnection` or `disconnect` it will use as default `main`.
2. The environment variables replaces the hard-coded values for `nodes` and `password`.

For debug purposes, we are using [debug](https://www.npmjs.com/package/debug) library. You can use:

-   `DEBUG`: with a value like `redis-connection:*` to see all logs.

## Running

For use this library you will need to run a RabbitMQ. A sample docker-compose:

```yml
version: '2.0'

services:
    redis:
        image: redis:6
        environment:
            ALLOW_EMPTY_PASSWORD: 'no'
            REDIS_EXTRA_FLAGS: '--maxmemory 250mb'
        command: >
            --requirepass password
        ports:
            - 6379:6379
```

If you would like to use a docker swarm (stack) version, you can see in your sample folder.

## Example

You will found other samples in: [Samples Folder](https://github.com/nsfilho/redis/tree/master/sample).

```ts
/* eslint-disable no-console */
import { getConnection, disconnect } from '@nsfilho/redis-connection';

const createSampleKey = async () => {
    const redis = await getConnection();
    redis.set(
        'mysample',
        JSON.stringify({
            when: new Date().toISOString(),
            status: true,
        }),
    );
};

const readSampleKey = async () => {
    const redis = await getConnection();
    const valueStr = await redis.get('mysample');
    if (valueStr) {
        const valueObj = JSON.parse(valueStr);
        console.log('Recovered values:', valueObj);
    }
};

const execute = async () => {
    await createSampleKey();
    await readSampleKey();
    await disconnect();
};

execute();
```
