import { Request, Response } from 'express';
import VideoService from '../services/VideoService';

class VideoController {
    private videoService: VideoService;

    constructor() {
        this.videoService = new VideoService();
    }

    public async converterVideo(req: Request, res: Response): Promise<void> {
        try {
            const { inputFormat, outputFormat, videoPath } = req.body;
            const convertedVideoPath = await this.videoService.converterVideo(inputFormat, outputFormat, videoPath);
            res.status(200).json({ message: 'Vídeo convertido com sucesso', path: convertedVideoPath });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao converter vídeo', error: error.message });
        }
    }
}

export default VideoController;