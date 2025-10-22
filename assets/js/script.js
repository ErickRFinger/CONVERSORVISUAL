document.addEventListener('DOMContentLoaded', () => {
    const imagePanel = document.getElementById('images-panel');
    if (imagePanel) {
        new ImageConverter(imagePanel);
    }

    const documentPanel = document.getElementById('documents-panel');
    if (documentPanel) {
        new DocumentConverter(documentPanel);
    }

    const archivePanel = document.getElementById('archive-panel');
    if (archivePanel) {
        new ArchiveConverter(archivePanel);
    }
});

class BaseConverter {
    constructor(panel, fileType) {
        this.panel = panel;
        this.fileType = fileType;
        this.originalFile = null;

        this.elements = {
            dropZone: panel.querySelector(`#${fileType}-drop-zone`),
            fileInput: panel.querySelector(`#${fileType}-file-input`),
            browseBtn: panel.querySelector(`#${fileType}-browse-btn`),
            previewControls: panel.querySelector(`#${fileType}-preview-controls`),
            preview: panel.querySelector(`#${fileType}-preview`),
            details: panel.querySelector(`#${fileType}-details`),
            convertFormatSelect: panel.querySelector(`#${fileType}-convert-format`),
            convertBtn: panel.querySelector(`#${fileType}-convert-btn`),
            downloadLink: panel.querySelector(`#${fileType}-download-link`),
            resetBtn: panel.querySelector(`#${fileType}-reset-btn`),
        };
        this.addEventListeners();
    }

    addEventListeners() {
        this.elements.browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.fileInput.click();
        });
        this.elements.dropZone.addEventListener('click', (e) => {
            // Só abre se clicar na dropzone, não no botão
            if (e.target === this.elements.dropZone || e.target.closest('.drop-zone-content')) {
                this.elements.fileInput.click();
            }
        });
        this.elements.fileInput.addEventListener('change', this.onFileChange.bind(this));
        this.elements.dropZone.addEventListener('dragover', this.onDragOver.bind(this));
        this.elements.dropZone.addEventListener('dragleave', this.onDragLeave.bind(this));
        this.elements.dropZone.addEventListener('drop', this.onDrop.bind(this));
        this.elements.convertBtn.addEventListener('click', this.convert.bind(this));
        this.elements.resetBtn.addEventListener('click', this.resetInterface.bind(this));
    }

    onFileChange(e) {
        if (e.target.files[0]) {
            this.handleFile(e.target.files[0]);
        }
    }

    onDragOver(e) {
        e.preventDefault();
        this.elements.dropZone.classList.add('dragover');
    }

    onDragLeave() {
        this.elements.dropZone.classList.remove('dragover');
    }

    onDrop(e) {
        e.preventDefault();
        this.elements.dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) {
            this.handleFile(e.dataTransfer.files[0]);
        }
    }

    handleFile(file) {
        this.originalFile = file;
        this.elements.details.textContent = `${this.originalFile.name} | ${(this.originalFile.size / 1024).toFixed(2)} KB`;
        this.elements.dropZone.classList.add('d-none');
        this.elements.previewControls.classList.remove('d-none');
        this.elements.resetBtn.classList.remove('d-none');
        this.elements.downloadLink.classList.add('d-none');
        this.elements.convertBtn.disabled = false;
        this.elements.convertBtn.innerHTML = '<i class="bi bi-gear-fill me-2"></i>Converter';
    }

    async convert() {
        if (!this.originalFile) {
            this.showError('Nenhum arquivo selecionado.');
            return;
        }

        const format = this.elements.convertFormatSelect.value;
        const formData = new FormData();
        formData.append('file', this.originalFile);
        formData.append('format', format);

        this.elements.convertBtn.disabled = true;
        this.elements.convertBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Convertendo...';

        try {
            const response = await fetch(`/convert/${this.fileType}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMsg = 'Erro ao converter o arquivo.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                    if (errorData.details) {
                        console.error('Detalhes do erro:', errorData.details);
                    }
                } catch (e) {
                    errorMsg = await response.text();
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            const originalName = this.originalFile.name.substring(0, this.originalFile.name.lastIndexOf('.'));

            this.elements.downloadLink.href = result.downloadUrl;
            this.elements.downloadLink.download = `${originalName}.${format}`;
            this.elements.downloadLink.classList.remove('d-none');

            // Show success message with file size if available
            if (result.fileSize) {
                const unit = this.fileType === 'video' ? 'MB' : 'KB';
                this.showSuccess(`Conversão concluída! Tamanho: ${result.fileSize} ${unit}`);
            } else {
                this.showSuccess('Conversão concluída com sucesso!');
            }

        } catch (error) {
            console.error(`Erro ao converter ${this.fileType}:`, error);
            this.showError(`Falha na conversão: ${error.message}`);
        } finally {
            this.elements.convertBtn.disabled = false;
            this.elements.convertBtn.innerHTML = '<i class="bi bi-gear-fill me-2"></i>Converter';
        }
    }

    resetInterface() {
        this.elements.fileInput.value = '';
        this.originalFile = null;
        this.elements.dropZone.classList.remove('d-none');
        this.elements.previewControls.classList.add('d-none');
        this.elements.resetBtn.classList.add('d-none');
        this.elements.downloadLink.classList.add('d-none');
        this.elements.details.textContent = '';
        this.elements.convertBtn.disabled = false;
        this.elements.convertBtn.innerHTML = '<i class="bi bi-gear-fill me-2"></i>Converter';
    }

    showError(message) {
        // Create a better error notification
        const notification = this.createNotification(message, 'danger');
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showSuccess(message) {
        // Create a success notification
        const notification = this.createNotification(message, 'success');
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    createNotification(message, type) {
        const div = document.createElement('div');
        div.className = `alert alert-${type} alert-dismissible fade show`;
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.right = '20px';
        div.style.zIndex = '9999';
        div.style.minWidth = '300px';
        div.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        
        const icon = type === 'success' ? '✓' : '✗';
        div.innerHTML = `
            <strong>${icon}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        return div;
    }
}

class ImageConverter extends BaseConverter {
    constructor(panel) {
        super(panel, 'image');
    }

    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showError('Por favor, selecione um arquivo de imagem válido.');
            return;
        }
        super.handleFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            this.elements.preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    resetInterface() {
        super.resetInterface();
        this.elements.preview.src = '#';
    }
}

class DocumentConverter extends BaseConverter {
    constructor(panel) {
        super(panel, 'document');
    }

    handleFile(file) {
        // Document preview is just an icon, so no special handling needed
        super.handleFile(file);
        this.originalFileName = file.name;
    }

    async convert() {
        const format = this.elements.convertFormatSelect.value;
        
        // Se for PDF, usar print do navegador (nativo!)
        if (format === 'pdf') {
            await this.convertToPdfViaPrint();
            return;
        }
        
        // Caso contrário, usar conversão do servidor
        await super.convert();
    }

    async convertToPdfViaPrint() {
        if (!this.originalFile) {
            this.showError('Nenhum arquivo selecionado.');
            return;
        }

        // Verificar se é HTML ou TXT
        const ext = this.originalFileName.toLowerCase().split('.').pop();
        
        if (ext !== 'html' && ext !== 'htm' && ext !== 'txt') {
            this.showError('Para converter para PDF, selecione um arquivo HTML ou TXT.');
            return;
        }

        try {
            this.elements.convertBtn.disabled = true;
            this.elements.convertBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Preparando...';

            // Ler o conteúdo do arquivo
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                let htmlContent = e.target.result;
                
                // Se for TXT, converter para HTML primeiro
                if (ext === 'txt') {
                    htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>${this.originalFileName}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; white-space: pre-wrap; }
    </style>
</head>
<body>${htmlContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
</html>`;
                }

                // Abrir em nova janela e imprimir
                const printWindow = window.open('', '_blank');
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                
                // Aguardar um pouco para o conteúdo carregar
                setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    
                    // Informar ao usuário
                    this.showSuccess('Janela de impressão aberta! Use "Salvar como PDF" ou "Microsoft Print to PDF".');
                    
                    // Mostrar opção de fechar
                    this.elements.convertBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>PDF Criado!';
                    this.elements.convertBtn.disabled = false;
                    this.elements.resetBtn.classList.remove('d-none');
                    
                    // Fechar a janela de impressão após um tempo (opcional)
                    setTimeout(() => {
                        printWindow.close();
                    }, 1000);
                }, 500);
            };

            reader.onerror = () => {
                this.showError('Erro ao ler o arquivo.');
                this.elements.convertBtn.disabled = false;
                this.elements.convertBtn.innerHTML = '<i class="bi bi-gear-fill me-2"></i>Converter';
            };

            reader.readAsText(this.originalFile);
            
        } catch (error) {
            console.error('Erro ao preparar impressão:', error);
            this.showError(`Falha ao preparar PDF: ${error.message}`);
            this.elements.convertBtn.disabled = false;
            this.elements.convertBtn.innerHTML = '<i class="bi bi-gear-fill me-2"></i>Converter';
        }
    }
}

class ArchiveConverter {
    constructor(panel) {
        this.panel = panel;
        this.selectedFiles = [];
        this.mode = 'compress'; // 'compress' or 'extract'
        
        this.elements = {
            // Mode switchers
            compressMode: document.getElementById('compress-mode'),
            extractMode: document.getElementById('extract-mode'),
            compressSection: document.getElementById('compress-section'),
            extractSection: document.getElementById('extract-section'),
            
            // Compress elements
            archiveDropZone: document.getElementById('archive-drop-zone'),
            archiveFileInput: document.getElementById('archive-file-input'),
            archiveBrowseBtn: document.getElementById('archive-browse-btn'),
            archivePreviewControls: document.getElementById('archive-preview-controls'),
            archiveFileList: document.getElementById('archive-file-list'),
            archiveFormat: document.getElementById('archive-format'),
            archiveCompressBtn: document.getElementById('archive-compress-btn'),
            archiveDownloadLink: document.getElementById('archive-download-link'),
            archiveResetBtn: document.getElementById('archive-reset-btn'),
            
            // Extract elements
            extractDropZone: document.getElementById('extract-drop-zone'),
            extractFileInput: document.getElementById('extract-file-input'),
            extractBrowseBtn: document.getElementById('extract-browse-btn'),
            extractPreviewControls: document.getElementById('extract-preview-controls'),
            extractDetails: document.getElementById('extract-details'),
            extractBtn: document.getElementById('extract-btn'),
            extractResult: document.getElementById('extract-result'),
            extractFileList: document.getElementById('extract-file-list'),
            extractResetBtn: document.getElementById('extract-reset-btn'),
        };
        
        this.addEventListeners();
    }

    addEventListeners() {
        // Mode switchers
        this.elements.compressMode.addEventListener('change', () => this.switchMode('compress'));
        this.elements.extractMode.addEventListener('change', () => this.switchMode('extract'));
        
        // Compress mode events
        this.elements.archiveBrowseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.archiveFileInput.click();
        });
        this.elements.archiveDropZone.addEventListener('click', (e) => {
            // Só abre se clicar na dropzone, não no botão
            if (e.target === this.elements.archiveDropZone || e.target.closest('.drop-zone-content')) {
                this.elements.archiveFileInput.click();
            }
        });
        this.elements.archiveFileInput.addEventListener('change', (e) => this.onFilesSelected(e.target.files));
        this.elements.archiveDropZone.addEventListener('dragover', (e) => this.onDragOver(e, this.elements.archiveDropZone));
        this.elements.archiveDropZone.addEventListener('dragleave', () => this.elements.archiveDropZone.classList.remove('dragover'));
        this.elements.archiveDropZone.addEventListener('drop', (e) => this.onDrop(e, 'compress'));
        this.elements.archiveCompressBtn.addEventListener('click', () => this.compress());
        this.elements.archiveResetBtn.addEventListener('click', () => this.resetCompress());
        
        // Extract mode events
        this.elements.extractBrowseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.extractFileInput.click();
        });
        this.elements.extractDropZone.addEventListener('click', (e) => {
            // Só abre se clicar na dropzone, não no botão
            if (e.target === this.elements.extractDropZone || e.target.closest('.drop-zone-content')) {
                this.elements.extractFileInput.click();
            }
        });
        this.elements.extractFileInput.addEventListener('change', (e) => this.onExtractFileSelected(e.target.files[0]));
        this.elements.extractDropZone.addEventListener('dragover', (e) => this.onDragOver(e, this.elements.extractDropZone));
        this.elements.extractDropZone.addEventListener('dragleave', () => this.elements.extractDropZone.classList.remove('dragover'));
        this.elements.extractDropZone.addEventListener('drop', (e) => this.onDrop(e, 'extract'));
        this.elements.extractBtn.addEventListener('click', () => this.extract());
        this.elements.extractResetBtn.addEventListener('click', () => this.resetExtract());
    }

    switchMode(mode) {
        this.mode = mode;
        if (mode === 'compress') {
            this.elements.compressSection.classList.remove('d-none');
            this.elements.extractSection.classList.add('d-none');
            this.resetCompress();
        } else {
            this.elements.compressSection.classList.add('d-none');
            this.elements.extractSection.classList.remove('d-none');
            this.resetExtract();
        }
    }

    onDragOver(e, dropZone) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    }

    onDrop(e, mode) {
        e.preventDefault();
        const dropZone = mode === 'compress' ? this.elements.archiveDropZone : this.elements.extractDropZone;
        dropZone.classList.remove('dragover');
        
        if (mode === 'compress') {
            this.onFilesSelected(e.dataTransfer.files);
        } else {
            this.onExtractFileSelected(e.dataTransfer.files[0]);
        }
    }

    onFilesSelected(files) {
        if (!files || files.length === 0) return;
        
        this.selectedFiles = Array.from(files);
        this.elements.archiveDropZone.classList.add('d-none');
        this.elements.archivePreviewControls.classList.remove('d-none');
        this.elements.archiveResetBtn.classList.remove('d-none');
        
        // Display file list
        this.elements.archiveFileList.innerHTML = '<ul class="list-group">';
        this.selectedFiles.forEach(file => {
            this.elements.archiveFileList.innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${file.name}
                    <span class="badge bg-primary rounded-pill">${(file.size / 1024).toFixed(2)} KB</span>
                </li>
            `;
        });
        this.elements.archiveFileList.innerHTML += '</ul>';
    }

    onExtractFileSelected(file) {
        if (!file) return;
        
        this.selectedFile = file;
        this.elements.extractDropZone.classList.add('d-none');
        this.elements.extractPreviewControls.classList.remove('d-none');
        this.elements.extractResetBtn.classList.remove('d-none');
        this.elements.extractDetails.textContent = `${file.name} | ${(file.size / 1024).toFixed(2)} KB`;
    }

    async compress() {
        if (!this.selectedFiles || this.selectedFiles.length === 0) {
            this.showError('Nenhum arquivo selecionado.');
            return;
        }

        const format = this.elements.archiveFormat.value;
        const formData = new FormData();
        this.selectedFiles.forEach(file => {
            formData.append('files', file);
        });
        formData.append('format', format);

        this.elements.archiveCompressBtn.disabled = true;
        this.elements.archiveCompressBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Compactando...';

        try {
            const response = await fetch('/convert/archive/compress', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMsg = 'Erro ao compactar arquivos.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) {
                    errorMsg = await response.text();
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            this.elements.archiveDownloadLink.href = result.downloadUrl;
            this.elements.archiveDownloadLink.download = `archive.${format}`;
            this.elements.archiveDownloadLink.classList.remove('d-none');
            this.showSuccess(`Arquivos compactados com sucesso! Tamanho: ${result.fileSize} MB`);
        } catch (error) {
            console.error('Erro ao compactar:', error);
            this.showError(`Falha na compactação: ${error.message}`);
        } finally {
            this.elements.archiveCompressBtn.disabled = false;
            this.elements.archiveCompressBtn.innerHTML = '<i class="bi bi-file-zip me-2"></i>Compactar';
        }
    }

    async extract() {
        if (!this.selectedFile) {
            this.showError('Nenhum arquivo selecionado.');
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.elements.extractBtn.disabled = true;
        this.elements.extractBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Extraindo...';

        try {
            const response = await fetch('/convert/archive/extract', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMsg = 'Erro ao extrair arquivo.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) {
                    errorMsg = await response.text();
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            
            // Verificar se temos os dados necessários
            if (!result.downloadUrl) {
                throw new Error('Servidor não retornou URL de download');
            }
            
            // Mostrar resultado
            this.elements.extractResult.classList.remove('d-none');
            this.elements.extractFileList.innerHTML = '<ul class="list-group mb-3">';
            result.files.forEach(file => {
                this.elements.extractFileList.innerHTML += `<li class="list-group-item">${file}</li>`;
            });
            this.elements.extractFileList.innerHTML += '</ul>';
            
            // Adicionar botão de download
            const fileName = result.downloadUrl.split('/').pop();
            this.elements.extractFileList.innerHTML += `
                <a href="${result.downloadUrl}" 
                   download="${fileName}" 
                   class="btn btn-info w-100">
                    <i class="bi bi-download me-2"></i>Baixar Arquivos Extraídos (ZIP)
                </a>
            `;
            
            this.showSuccess(`Arquivo extraído! ${result.count} arquivo(s) - Tamanho: ${result.fileSize} MB`);
        } catch (error) {
            console.error('Erro ao extrair:', error);
            this.showError(`Falha na extração: ${error.message}`);
        } finally {
            this.elements.extractBtn.disabled = false;
            this.elements.extractBtn.innerHTML = '<i class="bi bi-folder2-open me-2"></i>Extrair';
        }
    }

    resetCompress() {
        this.selectedFiles = [];
        this.elements.archiveFileInput.value = '';
        this.elements.archiveDropZone.classList.remove('d-none');
        this.elements.archivePreviewControls.classList.add('d-none');
        this.elements.archiveResetBtn.classList.add('d-none');
        this.elements.archiveDownloadLink.classList.add('d-none');
        this.elements.archiveFileList.innerHTML = '';
    }

    resetExtract() {
        this.selectedFile = null;
        this.elements.extractFileInput.value = '';
        this.elements.extractDropZone.classList.remove('d-none');
        this.elements.extractPreviewControls.classList.add('d-none');
        this.elements.extractResetBtn.classList.add('d-none');
        this.elements.extractResult.classList.add('d-none');
        this.elements.extractDetails.textContent = '';
        this.elements.extractFileList.innerHTML = '';
    }

    showError(message) {
        const notification = this.createNotification(message, 'danger');
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showSuccess(message) {
        const notification = this.createNotification(message, 'success');
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    createNotification(message, type) {
        const div = document.createElement('div');
        div.className = `alert alert-${type} alert-dismissible fade show`;
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.right = '20px';
        div.style.zIndex = '9999';
        div.style.minWidth = '300px';
        div.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        
        const icon = type === 'success' ? '✓' : '✗';
        div.innerHTML = `
            <strong>${icon}</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        return div;
    }
}