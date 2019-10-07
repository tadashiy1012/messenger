import {noImage} from '../src/utils/noImageIcon';

describe('noImageIcon', () => {
    test('should noImage exist', () => {
        expect(noImage).not.toBeNull();
        expect(noImage).toMatch(/^data:image\/png;base64*/);
    });
});