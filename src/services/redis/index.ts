/**
 * Redis Library
 * Copyright (C) 2020 E01-AIO Automação Ltda.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Nelio Santos <nsfilho@icloud.com>
 * 
 */
/* eslint-disable no-console */

import Redis from 'ioredis';
import {
    REDIS_MAIN_CLUSTER,
    REDIS_MAIN_PASSWORD,
    REDIS_DEBUG_CONSOLE,
    REDIS_CONNECTION_POOLING,
} from '../../constants';

/**
 * All parameters needs to create a new redis connection
 */
interface CreateRedisOptions {
    /** Label for all console messages */
    instance: string;
    /** Minimum connection configuration about nodes */
    nodes: Redis.NodeConfiguration[];
    /** Redis Password */
    password: string;
}

/**
 * Create a new redis object
 * @param options options for create a new redis instance object
 */
export const createRedis = (options: CreateRedisOptions): Promise<Redis.Cluster | Redis.Redis> =>
    new Promise((resolve) => {
        const myInstance =
            options.nodes.length > 1
                ? new Redis.Cluster(options.nodes, {
                      redisOptions: {
                          password: options.password,
                          family: 4,
                      },
                      lazyConnect: false,
                  })
                : new Redis({
                      port: options.nodes[0].port,
                      host: options.nodes[0].host,
                      password: options.password,
                      family: 4,
                  });
        myInstance.on('connect', () => {
            if (REDIS_DEBUG_CONSOLE) console.log(`REDIS(${options.instance}): connected.`);
            resolve(myInstance);
        });
        if (REDIS_DEBUG_CONSOLE) {
            myInstance.on('+node', () => {
                console.log(`REDIS(${options.instance}): connected to a node.`);
            });
            myInstance.on('error', (error) => {
                console.error(`REDIS(${options.instance}): failed. Error:`, error);
            });
        }
    });

/** Control state */
const internalState: {
    redis: Redis.Cluster | Redis.Redis | null;
    started: boolean;
} = {
    redis: null,
    started: false,
};

/** Default redis instance */
export const getConnection = async (): Promise<Redis.Cluster | Redis.Redis> => {
    if (internalState.redis !== null) return internalState.redis;
    if (internalState.started) {
        await new Promise((resolve) => {
            const handleInterval = setInterval(() => {
                if (internalState.redis) {
                    clearInterval(handleInterval);
                    resolve(true);
                }
            }, REDIS_CONNECTION_POOLING);
        });
        if (internalState.redis) return internalState.redis;
    }
    internalState.started = true;
    let debugTimeout: NodeJS.Timeout | null = null;
    if (REDIS_DEBUG_CONSOLE) {
        let tryCount = 0;
        debugTimeout = setInterval(() => {
            tryCount += 1;
            console.log(`REDIS(main): Trying connection #${tryCount}`);
        }, 1000);
    }

    internalState.redis = await createRedis({
        instance: 'main',
        nodes: REDIS_MAIN_CLUSTER,
        password: REDIS_MAIN_PASSWORD,
    });
    if (debugTimeout) clearInterval(debugTimeout);
    return internalState.redis;
};

/** Disconnect from redis */
export const disconnect = async (): Promise<void> => {
    if (internalState.redis !== null) {
        internalState.redis.disconnect();
        internalState.redis = null;
    }
};
