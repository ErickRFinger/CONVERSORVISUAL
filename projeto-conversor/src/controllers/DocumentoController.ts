import { Request, Response } from 'express';
import { DocumentoService } from '../services/DocumentoService';

export class DocumentoController {
    private documentoService: DocumentoService;

    constructor() {
        this.documentoService = new DocumentoService();
    }

    public async converterDocxParaPdf(req: Request, res: Response): Promise<void> {
        try {
            const { filePath } = req.body;
            const pdfPath = await this.documentoService.converterDocxParaPdf(filePath);
            res.status(200).json({ message: 'Conversão realizada com sucesso', pdfPath });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao converter documento', error: error.message });
        }
    }
}