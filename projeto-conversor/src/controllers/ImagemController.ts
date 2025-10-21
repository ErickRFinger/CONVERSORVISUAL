import { Request, Response } from 'express';
import { ImagemService } from '../services/ImagemService';

export class ImagemController {
    private imagemService: ImagemService;

    constructor() {
        this.imagemService = new ImagemService();
    }

    public async converterImagem(req: Request, res: Response): Promise<void> {
        try {
            const { formato, imagem } = req.body;
            const resultado = await this.imagemService.converterImagem(imagem, formato);
            res.status(200).json({ mensagem: 'Imagem convertida com sucesso', resultado });
        } catch (error) {
            res.status(500).json({ mensagem: 'Erro ao converter imagem', erro: error.message });
        }
    }
}