import ffmpeg from 'fluent-ffmpeg';

export class VideoService {
    converterVideo(inputPath: string, outputPath: string, format: string): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat(format)
                .on('end', () => {
                    resolve(`Conversão concluída: ${outputPath}`);
                })
                .on('error', (err) => {
                    reject(`Erro na conversão: ${err.message}`);
                })
                .save(outputPath);
        });
    }
}