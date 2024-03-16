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
import debug from 'debug';

const logger = {
    debug: debug('redis-connection:utils-debug'),
};

interface getEnvOrDefaultOptions {
    envName: string;
    defaultValue: string;
}

export const getEnvOrDefault = ({ envName, defaultValue }: getEnvOrDefaultOptions): string => {
    logger.debug(`(${process.pid}) envName: ${envName}, defaultValue: ${defaultValue}`);
    const envValue = process.env[envName];
    return envValue || defaultValue;
};
