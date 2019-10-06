import clientId from '../src/stores/clientId';

describe('clientId', () => {
    test('should id exist', () => {
        expect(clientId).not.toBeNull();
    });
});