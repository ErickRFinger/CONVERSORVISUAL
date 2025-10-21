
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const libre = require('libreoffice-convert');

const app = express();
const port = 3000;

// Create uploads and converted directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const convertedDir = path.join(__dirname, 'converted');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(convertedDir)) {
    fs.mkdirSync(convertedDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files (frontend)
app.use(express.static(__dirname));
app.use('/converted', express.static(convertedDir));


// ########## API ROUTES ##########

// Image Conversion Route
app.post('/convert/image', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    const { format } = req.body;
    if (!format) {
        return res.status(400).send('Formato de conversão não especificado.');
    }

    const inputPath = req.file.path;
    const outputFileName = `${path.basename(req.file.filename, path.extname(req.file.filename))}.${format}`;
    const outputPath = path.join(convertedDir, outputFileName);

    try {
        await sharp(inputPath)
            .toFormat(format)
            .toFile(outputPath);

        // Clean up the uploaded file
        fs.unlinkSync(inputPath);

        res.json({ downloadUrl: `/converted/${outputFileName}` });
    } catch (error) {
        console.error('Erro na conversão de imagem:', error);
        // Clean up the uploaded file in case of an error
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
        res.status(500).send('Ocorreu um erro durante a conversão da imagem.');
    }
});

// Video Conversion Route
app.post('/convert/video', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    const { format } = req.body;
    if (!format) {
        return res.status(400).send('Formato de conversão não especificado.');
    }

    const inputPath = req.file.path;
    const outputFileName = `${path.basename(req.file.filename, path.extname(req.file.filename))}.${format}`;
    const outputPath = path.join(convertedDir, outputFileName);

    try {
        // Note: ffmpeg must be installed on the system and accessible in the PATH.
        ffmpeg(inputPath)
            .toFormat(format)
            .on('end', () => {
                // Clean up the uploaded file
                fs.unlinkSync(inputPath);
                res.json({ downloadUrl: `/converted/${outputFileName}` });
            })
            .on('error', (err) => {
                console.error('Erro na conversão de vídeo:', err.message);
                // Clean up the uploaded file in case of an error
                if (fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }
                res.status(500).send('Ocorreu um erro durante a conversão do vídeo. Verifique se o ffmpeg está instalado e acessível no PATH do sistema.');
            })
            .save(outputPath);
    } catch (error) {
        console.error('Erro ao invocar o ffmpeg:', error.message);
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
        res.status(500).send('Ocorreu um erro durante a conversão do vídeo. Verifique se o ffmpeg está instalado e acessível no PATH do sistema.');
    }
});

// Document Conversion Route
app.post('/convert/document', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    const { format } = req.body; // e.g., 'pdf'
    if (!format) {
        return res.status(400).send('Formato de conversão não especificado.');
    }

    const inputPath = req.file.path;
    const outputFileName = `${path.basename(req.file.filename, path.extname(req.file.filename))}.${format}`;
    const outputPath = path.join(convertedDir, outputFileName);

    try {
        const fileBuffer = fs.readFileSync(inputPath);

        // Note: LibreOffice must be installed on the system.
        libre.convert(fileBuffer, `.${format}`, undefined, (err, done) => {
            if (err) {
                console.error(`Error converting file: ${err}`);
                if (fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }
                res.status(500).send('Ocorreu um erro durante a conversão do documento. Verifique se o LibreOffice está instalado.');
                return;
            }
            
            fs.writeFileSync(outputPath, done);

            // Clean up the uploaded file
            fs.unlinkSync(inputPath);

            res.json({ downloadUrl: `/converted/${outputFileName}` });
        });
    } catch (error) {
        console.error('Erro ao converter documento:', error.message);
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
        res.status(500).send('Ocorreu um erro durante a conversão do documento. Verifique se o LibreOffice está instalado.');
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
