import createImage from '../src/utils/createImage';
import {noImage} from '../src/utils/noImageIcon';
import 'jest-canvas-mock';

describe('createImage', () => {

    let imageOnload: () => void;

    function trackImageOnload() {
        Object.defineProperty(Image.prototype, 'onload', {
            get: function () {
                return this._onload;
            },
            set: function (fn) {
                imageOnload = fn;
                this._onload = fn;
            },
        });
    }

    test('createImageが動作すること', (done) => {
        trackImageOnload();
        createImage(noImage, (result) => {
            expect(result).not.toBeNull();
            expect(result).toMatch(/^data:image\/jpeg;base64*/);
            done();
        });
        imageOnload();
    });
});
