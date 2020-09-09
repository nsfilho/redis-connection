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
import { getConnection, disconnect } from '../src';

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
