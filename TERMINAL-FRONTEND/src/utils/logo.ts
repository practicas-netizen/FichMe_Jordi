import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// 512 se refiere al lado en píxeles del logo guardado
const LOGO_SIZE = 512;
const MAX_LOGO_BYTES = 5 * 1024 * 1024;

export class LogoTooLargeError extends Error {
    constructor() {
        super('LOGO_TOO_LARGE');
        this.name = 'LogoTooLargeError';
    }
}

function getBase64ByteLength(base64: string): number {
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return Math.floor((base64.length * 3) / 4) - padding;
}

// Deja elegir una imagen de la galería, la recorta en cuadrado, la reduce y la devuelve como data URI en base64. Devuelve null si se cancela o no hay permiso.
export async function pickLogoImage(): Promise<string | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    const asset = result.assets?.[0];
    if (result.canceled || !asset) return null;

    if (typeof asset.fileSize === 'number' && asset.fileSize > MAX_LOGO_BYTES) {
        throw new LogoTooLargeError();
    }

    const context = ImageManipulator.manipulate(asset.uri);
    context.resize({ width: LOGO_SIZE });

    const image = await context.renderAsync();
    const resized = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });

    if (!resized.base64) return null;

    if(getBase64ByteLength(resized.base64) > MAX_LOGO_BYTES) {
        throw new LogoTooLargeError();
    }
    
    return `data:image/jpeg;base64,${resized.base64}`
}