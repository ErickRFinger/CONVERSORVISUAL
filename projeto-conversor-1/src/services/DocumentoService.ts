import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export class DocumentoService {
    async converterDocxParaPdf(inputPath: string, outputPath: string): Promise<void> {
        const command = `libreoffice --headless --convert-to pdf --outdir ${outputPath} ${inputPath}`;
        try {
            await execPromise(command);
        } catch (error) {
            throw new Error(`Erro ao converter documento: ${error.message}`);
        }
    }
}