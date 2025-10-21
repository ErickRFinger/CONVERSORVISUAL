import sharp from 'sharp';

export class ImagemService {
    async converterImagem(inputPath: string, outputPath: string, formato: string): Promise<void> {
        try {
            await sharp(inputPath)
                .toFormat(formato)
                .toFile(outputPath);
        } catch (error) {
            throw new Error(`Erro ao converter imagem: ${error.message}`);
        }
    }
}