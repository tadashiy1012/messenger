const ICON_MAX_WIDTH = 256;
const ICON_MAX_HEIGHT = 256;

export default function createImage(imageSrc: string, callback: (b64: string) => void) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.onload = (ev) => {
        let width = image.width;
        let height = image.height;
        if (width > ICON_MAX_WIDTH && height > ICON_MAX_HEIGHT) {
            if (image.width > image.height) {
                const ratio = image.height / image.width;
                width = ICON_MAX_WIDTH;
                height = ICON_MAX_WIDTH * ratio;
            } else {
                const ratio = image.width / image.height;
                width = ICON_MAX_HEIGHT * ratio;
                height = ICON_MAX_HEIGHT;
            }
        }
        canvas.width = width;
        canvas.height = height;
        ctx!.clearRect(0, 0, width, height);
        ctx!.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
        const b64 = canvas.toDataURL('image/jpeg');
        callback(b64);
    };
    image.src = imageSrc;
}