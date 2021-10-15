import { getConnection, disconnect } from './index';

describe('Basic test', () => {
    test('Establish connection', async () => {
        expect.assertions(1);
        const redis = await getConnection();
        expect(redis).not.toBeNull();
        await disconnect();
    });
});
