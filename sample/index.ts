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
