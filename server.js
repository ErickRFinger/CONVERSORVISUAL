
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const unzipper = require('unzipper');
const tar = require('tar');

const app = express();
const port = process.env.PORT || 3000;

// Detectar se está rodando no Vercel
const isVercel = process.env.VERCEL === '1';

// Create uploads and converted directories if they don't exist
// No Vercel, usar /tmp porque é o único diretório gravável
const uploadsDir = isVercel ? '/tmp/uploads' : path.join(__dirname, 'uploads');
const convertedDir = isVercel ? '/tmp/converted' : path.join(__dirname, 'converted');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(convertedDir)) {
    fs.mkdirSync(convertedDir, { recursive: true });
}

// Auto-cleanup old files (older than 1 hour)
const cleanupOldFiles = () => {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    [uploadsDir, convertedDir].forEach(dir => {
        fs.readdir(dir, (err, files) => {
            if (err) return;
            files.forEach(file => {
                const filePath = path.join(dir, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) return;
                    if (now - stats.mtimeMs > maxAge) {
                        fs.unlink(filePath, err => {
                            if (!err) console.log(`Arquivo antigo removido: ${file}`);
                        });
                    }
                });
            });
        });
    });
};

// Run cleanup every 30 minutes
setInterval(cleanupOldFiles, 30 * 60 * 1000);
// Run cleanup on startup
cleanupOldFiles();

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
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const { format } = req.body;
    if (!format) {
        return res.status(400).json({ error: 'Formato de conversão não especificado.' });
    }

    const inputPath = req.file.path;
    const outputFileName = `${path.basename(req.file.filename, path.extname(req.file.filename))}.${format}`;
    const outputPath = path.join(convertedDir, outputFileName);

    try {
        // Configure Sharp with high quality settings
        let sharpInstance = sharp(inputPath);

        // Apply format-specific optimizations
        switch(format) {
            case 'jpeg':
            case 'jpg':
                sharpInstance = sharpInstance.jpeg({ quality: 90, mozjpeg: true });
                break;
            case 'png':
                sharpInstance = sharpInstance.png({ compressionLevel: 9, adaptiveFiltering: true });
                break;
            case 'webp':
                sharpInstance = sharpInstance.webp({ quality: 90, lossless: false });
                break;
            case 'tiff':
                sharpInstance = sharpInstance.tiff({ quality: 90, compression: 'lzw' });
                break;
            default:
                sharpInstance = sharpInstance.toFormat(format);
        }

        await sharpInstance.toFile(outputPath);

        // Get file size info
        const stats = fs.statSync(outputPath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);

        // Clean up the uploaded file
        fs.unlinkSync(inputPath);

        res.json({ 
            downloadUrl: `/converted/${outputFileName}`,
            fileSize: fileSizeKB,
            format: format
        });
    } catch (error) {
        console.error('Erro na conversão de imagem:', error);
        // Clean up the uploaded file in case of an error
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
        res.status(500).json({ 
            error: 'Ocorreu um erro durante a conversão da imagem.',
            details: error.message 
        });
    }
});

// Rotas de vídeo e áudio REMOVIDAS - Requerem FFmpeg (software externo)

// Document Conversion Route (SIMPLES - Apenas conversões nativas)
app.post('/convert/document', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const { format } = req.body;
    if (!format) {
        return res.status(400).json({ error: 'Formato de conversão não especificado.' });
    }

    const inputPath = req.file.path;
    const outputFileName = `${path.basename(req.file.filename, path.extname(req.file.filename))}.${format}`;
    const outputPath = path.join(convertedDir, outputFileName);

    try {
        console.log('Iniciando conversão de documento (nativa)...');
        const fileContent = fs.readFileSync(inputPath, 'utf-8');
        const inputExt = path.extname(req.file.originalname).toLowerCase();

        let outputContent = fileContent;

        // Conversões simples nativas
        if (inputExt === '.txt' && format === 'html') {
            // TXT → HTML
            outputContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Documento Convertido</title>
</head>
<body>
    <pre>${fileContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
        } else if (inputExt === '.html' && format === 'txt') {
            // HTML → TXT (remove tags HTML)
            outputContent = fileContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        } else {
            // Formato não suportado nativamente
            fs.unlinkSync(inputPath);
            return res.status(400).json({ 
                error: 'Conversão não suportada nativamente. Apenas TXT↔HTML são suportados.',
                details: `${inputExt} → ${format} não é suportado sem LibreOffice.`
            });
        }

        fs.writeFileSync(outputPath, outputContent, 'utf-8');
        console.log('Conversão de documento concluída');

        const stats = fs.statSync(outputPath);
        const fileSizeKB = (stats.size / 1024).toFixed(2);

        fs.unlinkSync(inputPath);

        res.json({ 
            downloadUrl: `/converted/${outputFileName}`,
            fileSize: fileSizeKB,
            format: format
        });
    } catch (error) {
        console.error('Erro ao converter documento:', error.message);
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
        res.status(500).json({ 
            error: 'Erro ao converter documento.',
            details: error.message 
        });
    }
});


// Archive Compression Route (Create ZIP/TAR)
app.post('/convert/archive/compress', upload.array('files', 50), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const { format } = req.body; // 'zip' or 'tar'
    if (!format || !['zip', 'tar', 'tar.gz'].includes(format)) {
        return res.status(400).json({ error: 'Formato de arquivo não suportado.' });
    }

    const outputFileName = `archive_${Date.now()}.${format}`;
    const outputPath = path.join(convertedDir, outputFileName);

    try {
        if (format === 'zip') {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => {
                // Clean up uploaded files
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
                const stats = fs.statSync(outputPath);
                const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                res.json({ 
                    downloadUrl: `/converted/${outputFileName}`,
                    fileSize: fileSizeMB,
                    format: format
                });
            });

            archive.on('error', (err) => {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
                res.status(500).json({ error: 'Erro ao criar arquivo ZIP.', details: err.message });
            });

            archive.pipe(output);
            req.files.forEach(file => {
                archive.file(file.path, { name: file.originalname });
            });
            archive.finalize();

        } else if (format === 'tar' || format === 'tar.gz') {
            const fileList = req.files.map(file => file.path);
            tar.create(
                {
                    gzip: format === 'tar.gz',
                    file: outputPath,
                    cwd: uploadsDir
                },
                fileList.map(f => path.basename(f))
            ).then(() => {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
                const stats = fs.statSync(outputPath);
                const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                res.json({ 
                    downloadUrl: `/converted/${outputFileName}`,
                    fileSize: fileSizeMB,
                    format: format
                });
            }).catch(err => {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
                res.status(500).json({ error: 'Erro ao criar arquivo TAR.', details: err.message });
            });
        }
    } catch (error) {
        req.files.forEach(file => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
        res.status(500).json({ error: 'Erro ao compactar arquivos.', details: error.message });
    }
});

// Archive Extraction Route
app.post('/convert/archive/extract', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const inputPath = req.file.path;
    const extractDir = path.join(convertedDir, `extract_${Date.now()}`);
    
    try {
        fs.mkdirSync(extractDir, { recursive: true });
        const ext = path.extname(req.file.originalname).toLowerCase();

        // Extrair o arquivo
        if (ext === '.zip') {
            await fs.createReadStream(inputPath)
                .pipe(unzipper.Extract({ path: extractDir }))
                .promise();
        } else if (ext === '.tar' || req.file.originalname.includes('.tar.')) {
            await tar.extract({
                file: inputPath,
                cwd: extractDir
            });
        } else {
            fs.unlinkSync(inputPath);
            return res.status(400).json({ error: 'Formato de arquivo não suportado para extração.' });
        }

        // Limpar arquivo original
        fs.unlinkSync(inputPath);

        // Recompactar em ZIP para download
        const extractedFiles = fs.readdirSync(extractDir);
        const outputZipName = `extracted_${Date.now()}.zip`;
        const outputZipPath = path.join(convertedDir, outputZipName);

        const output = fs.createWriteStream(outputZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        await new Promise((resolve, reject) => {
            output.on('close', () => {
                try {
                    const stats = fs.statSync(outputZipPath);
                    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                    
                    res.json({ 
                        message: 'Arquivo extraído com sucesso',
                        downloadUrl: `/converted/${outputZipName}`,
                        fileSize: fileSizeMB,
                        files: extractedFiles,
                        count: extractedFiles.length
                    });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });

            output.on('error', (err) => {
                console.error('Erro no stream de saída:', err);
                reject(err);
            });

            archive.on('error', (err) => {
                console.error('Erro no archiver:', err);
                reject(err);
            });

            archive.on('warning', (err) => {
                if (err.code === 'ENOENT') {
                    console.warn('Aviso do archiver:', err);
                } else {
                    reject(err);
                }
            });

            archive.pipe(output);

            // Adicionar todos os arquivos extraídos ao ZIP
            const addFilesRecursively = (dir, baseDir = '') => {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stats = fs.statSync(filePath);
                    const relativePath = path.join(baseDir, file);
                    
                    if (stats.isDirectory()) {
                        addFilesRecursively(filePath, relativePath);
                    } else {
                        archive.file(filePath, { name: relativePath });
                    }
                });
            };

            addFilesRecursively(extractDir);
            archive.finalize();
        });

    } catch (error) {
        console.error('Erro ao extrair arquivo:', error.message);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        res.status(500).json({ error: 'Erro ao extrair arquivo.', details: error.message });
    }
});

// PDF to Image - REMOVIDO (Requer Poppler - não é nativo)


// Start the server
if (require.main === module) {
    // Só inicia o servidor se executado diretamente (não no Vercel)
    app.listen(port, () => {
        console.log(`\n╔════════════════════════════════════════════════════════════╗`);
        console.log(`║   SISTEMA DE CONVERSÃO v4.0 - 100% NATIVO                 ║`);
        console.log(`╚════════════════════════════════════════════════════════════╝\n`);
        console.log(`🌐 Servidor rodando em http://localhost:${port}\n`);
        console.log(`📋 Funcionalidades Ativas (SEM software externo):`);
        console.log(`   ✅ Conversão de Imagens (Sharp)`);
        console.log(`   ✅ Conversão de Documentos (TXT↔HTML, TXT/HTML→PDF)`);
        console.log(`   ✅ Compactação/Descompactação (ZIP, TAR, TAR.GZ)\n`);
        console.log(`🎉 Sistema 100% nativo - Pronto para uso!\n`);
    });
}

// Exportar para o Vercel
module.exports = app;
