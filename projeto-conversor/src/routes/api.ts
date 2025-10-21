import { Router } from 'express';
import ImagemController from '../controllers/ImagemController';
import VideoController from '../controllers/VideoController';
import DocumentoController from '../controllers/DocumentoController';

const router = Router();

router.post('/imagem', ImagemController.converterImagem);
router.post('/video', VideoController.converterVideo);
router.post('/documento', DocumentoController.converterDocxParaPdf);

export default function setRoutes(app: any) {
    app.use('/api', router);
}