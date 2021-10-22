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
import debug from 'debug';
import { REDIS_CONNECTION_POOLING } from '../../constants';
import { getEnvOrDefault } from './utils';

const logger = {
    debug: debug('redis-connection:debug'),
    info: debug('redis-connection:info'),
    error: debug('redis-connection:error'),
};

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
            logger.info(`(${process.pid}/${options.instance}): connected.`);
            resolve(myInstance);
        });
        myInstance.on('+node', () => {
            logger.debug(`(${process.pid}/${options.instance}): connected to a node.`);
        });
        myInstance.on('error', (error) => {
            logger.error(`(${process.pid}/${options.instance}): failed. Error:`, error);
        });
    });

/** Control state */
const internalState: {
    [index: string]: {
        started: boolean;
        instance: Redis.Cluster | Redis.Redis | null;
    };
} = {};

interface getConnectionOptions {
    instance: string;
    nodes?: string;
    password?: string;
}

const getConnectionDefaults: getConnectionOptions = {
    instance: 'main',
};

/** Default redis instance */
export const getConnection = async (options?: getConnectionOptions): Promise<Redis.Cluster | Redis.Redis> => {
    const localInstance = options || getConnectionDefaults;
    const localState = internalState[localInstance.instance];
    if (localState && localState.instance) return localState.instance;
    if (localState && localState.started) {
        return new Promise((resolve) => {
            const handleInterval = setInterval(() => {
                if (localState.instance) {
                    clearInterval(handleInterval);
                    resolve(localState.instance);
                }
            }, REDIS_CONNECTION_POOLING);
        });
    }
    if (!localState)
        internalState[localInstance.instance] = {
            started: true,
            instance: null,
        };

    // Adding debug information to console
    let tryCount = 0;
    let debugTimeout: NodeJS.Timeout | null = null;
    debugTimeout = setInterval(() => {
        tryCount += 1;
        logger.debug(`(${process.pid}/${localInstance.instance}): Trying connection #${tryCount}`);
    }, 1000);

    // [{ port: 6379, host: '127.0.0.1' }]
    const nodes = JSON.parse(
        getEnvOrDefault({
            envName: `REDIS_${localInstance.instance.toUpperCase()}_CLUSTER`,
            defaultValue: localInstance.nodes || `[{ "port": 6379, "host": "127.0.0.1" }]`,
        }),
    );
    const password = getEnvOrDefault({
        envName: `REDIS_${localInstance.instance.toUpperCase()}_PASSWORD`,
        defaultValue: localInstance.password || 'password',
    });

    logger.info(`(${process.pid}/${localInstance.instance}) Starting connection: %o and password: %o`, nodes, password);
    internalState[localInstance.instance].instance = await createRedis({
        instance: localInstance.instance,
        nodes,
        password,
    });

    clearInterval(debugTimeout);
    return internalState[localInstance.instance].instance as Redis.Cluster;
};

interface disconnectOptions {
    instance: string;
}

/** Disconnect from redis */
export const disconnect = async (options?: disconnectOptions): Promise<void> => {
    const localInstance = options || getConnectionDefaults;
    const localState = internalState[localInstance.instance];
    if (localState && localState.instance) {
        logger.info(`(${process.pid}/${localInstance.instance}) Disconnecting`);
        const protectedCopy = localState.instance;
        localState.started = false;
        localState.instance = null;
        protectedCopy.disconnect();
    }
};
