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
