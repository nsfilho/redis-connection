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
import { getConnection, disconnect } from './index';

describe('Basic test', () => {
    test('Establish connection', async () => {
        expect.assertions(1);
        const redis = await getConnection();
        expect(redis).not.toBeNull();
        await disconnect();
    });
});

describe('Passing instance options', () => {
    test('Establish connection for instance: general', async () => {
        expect.assertions(1);
        const redis = await getConnection({
            instance: 'general',
        });
        const localTime = await redis.time();
        expect(localTime.length).toEqual(2);
        await disconnect({ instance: 'general' });
    });
    test('Establish connection for multiples instance', async () => {
        const totalInstances = 5;
        expect.assertions(totalInstances);
        const instances = [];
        for (let x = 0; x < totalInstances; x += 1) instances.push(`multiples${x}`);
        const allConnections = instances.map((instance) =>
            getConnection({
                instance,
            }),
        );
        const allRedis = await Promise.all(allConnections);
        const timeRequest = allRedis.map((redis) => redis.time());
        const timeAnswers = await Promise.all(timeRequest);
        timeAnswers.forEach((localTime) => expect(localTime.length).toEqual(2));
        const disconnectRequests = instances.map((instance) => disconnect({ instance }));
        await Promise.all(disconnectRequests);
    });
});
