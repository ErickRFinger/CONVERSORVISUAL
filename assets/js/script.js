// Gerenciador de Histórico
class HistoryManager {
    constructor() {
        this.init();
    }

    init() {
        // Criar botão de histórico no header
        const header = document.querySelector('header');
        if (header && !document.getElementById('history-btn')) {
            const historyBtn = document.createElement('button');
            historyBtn.id = 'history-btn';
            historyBtn.className = 'btn btn-outline-light btn-sm';
            historyBtn.innerHTML = '<i class="bi bi-clock-history me-1"></i>Histórico';
            historyBtn.style.position = 'absolute';
            historyBtn.style.top = '20px';
            historyBtn.style.right = '120px';
            historyBtn.addEventListener('click', () => this.showHistory());
            header.appendChild(historyBtn);
        }
    }

    showHistory() {
        const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
        
        let content = '';
        if (history.length === 0) {
            content = '<p class="text-muted">Nenhuma conversão no histórico.</p>';
        } else {
            content = '<div class="list-group">';
            history.forEach((item, index) => {
                const date = new Date(item.timestamp);
                const dateStr = date.toLocaleString('pt-BR');
                content += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${item.originalName}.${item.format}</h6>
                            <small>${dateStr}</small>
                        </div>
                        <p class="mb-1">
                            <span class="badge bg-primary">${item.type}</span>
                            <span class="badge bg-secondary">${item.size} KB</span>
                        </p>
                        <button class="btn btn-sm btn-danger" onclick="window.historyManager.removeItem(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
            });
            content += '</div>';
            content += '<button class="btn btn-danger w-100 mt-3" onclick="window.historyManager.clearHistory()">Limpar Todo Histórico</button>';
        }

        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-clock-history me-2"></i>Histórico de Conversões</h5>
                        <button type="button" class="btn-close" data-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="history-content">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.querySelector('.btn-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    removeItem(index) {
        const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
        history.splice(index, 1);
        localStorage.setItem('conversionHistory', JSON.stringify(history));
        // Reabrir modal atualizado
        document.querySelector('.modal')?.remove();
        this.showHistory();
    }

    clearHistory() {
        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
            localStorage.removeItem('conversionHistory');
            document.querySelector('.modal')?.remove();
            this.showHistory();
        }
    }

    refresh() {
        // Método para atualizar se o modal estiver aberto
        if (document.querySelector('.modal')) {
            const content = document.getElementById('history-content');
            if (content) {
                this.showHistory();
            }
        }
    }
}

// Gerenciador de Tema (Dark Mode)
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Aplicar tema salvo
        if (this.currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }

        // Criar botão de tema no header
        const header = document.querySelector('header');
        if (header && !document.getElementById('theme-toggle')) {
            const themeBtn = document.createElement('button');
            themeBtn.id = 'theme-toggle';
            themeBtn.className = 'btn btn-outline-light btn-sm';
            themeBtn.innerHTML = this.currentTheme === 'dark' 
                ? '<i class="bi bi-sun-fill"></i>' 
                : '<i class="bi bi-moon-fill"></i>';
            themeBtn.style.position = 'absolute';
            themeBtn.style.top = '20px';
            themeBtn.style.right = '20px';
            themeBtn.addEventListener('click', () => this.toggleTheme());
            header.appendChild(themeBtn);
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        
        document.body.classList.toggle('dark-mode');
        
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.innerHTML = this.currentTheme === 'dark' 
                ? '<i class="bi bi-sun-fill"></i>' 
                : '<i class="bi bi-moon-fill"></i>';
        }
    }
}

// Batch Image Converter
class BatchImageConverter {
    constructor() {
        this.files = [];
        this.results = [];
        this.init();
    }

    init() {
        // Mode switchers
        document.getElementById('single-image-mode')?.addEventListener('change', () => this.switchMode('single'));
        document.getElementById('batch-image-mode')?.addEventListener('change', () => this.switchMode('batch'));

        // Batch elements
        const batchBrowseBtn = document.getElementById('batch-browse-btn');
        const batchFileInput = document.getElementById('batch-file-input');
        const batchDropZone = document.getElementById('batch-drop-zone');
        const batchConvertBtn = document.getElementById('batch-convert-btn');
        const batchResetBtn = document.getElementById('batch-reset-btn');
        const batchQualitySlider = document.getElementById('batch-quality-slider');
        const batchQualityValue = document.getElementById('batch-quality-value');

        batchBrowseBtn?.addEventListener('click', () => batchFileInput?.click());
        batchFileInput?.addEventListener('change', (e) => this.handleFiles(e.target.files));
        batchDropZone?.addEventListener('dragover', (e) => { e.preventDefault(); batchDropZone.classList.add('dragover'); });
        batchDropZone?.addEventListener('dragleave', () => batchDropZone.classList.remove('dragover'));
        batchDropZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            batchDropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
        batchConvertBtn?.addEventListener('click', () => this.convertAll());
        batchResetBtn?.addEventListener('click', () => this.reset());
        batchQualitySlider?.addEventListener('input', (e) => {
            if (batchQualityValue) batchQualityValue.textContent = e.target.value;
        });
    }

    switchMode(mode) {
        const singleSection = document.getElementById('single-image-section');
        const batchSection = document.getElementById('batch-image-section');
        
        if (mode === 'single') {
            singleSection?.classList.remove('d-none');
            batchSection?.classList.add('d-none');
        } else {
            singleSection?.classList.add('d-none');
            batchSection?.classList.remove('d-none');
        }
    }

    handleFiles(fileList) {
        this.files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
        
        if (this.files.length === 0) {
            this.showError('Nenhuma imagem válida selecionada!');
            return;
        }

        const batchDropZone = document.getElementById('batch-drop-zone');
        const batchPreviewControls = document.getElementById('batch-preview-controls');
        const batchCount = document.getElementById('batch-count');
        const batchFileList = document.getElementById('batch-file-list');

        batchDropZone?.classList.add('d-none');
        batchPreviewControls?.classList.remove('d-none');
        
        if (batchCount) batchCount.textContent = this.files.length;
        
        if (batchFileList) {
            batchFileList.innerHTML = '<div class="list-group">';
            this.files.forEach((file, index) => {
                batchFileList.innerHTML += `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <span><i class="bi bi-image me-2"></i>${file.name}</span>
                        <span class="badge bg-primary rounded-pill">${(file.size / 1024).toFixed(2)} KB</span>
                    </div>
                `;
            });
            batchFileList.innerHTML += '</div>';
        }
    }

    async convertAll() {
        const format = document.getElementById('batch-format')?.value || 'png';
        const quality = document.getElementById('batch-quality-slider')?.value || 90;
        const convertBtn = document.getElementById('batch-convert-btn');
        const progressDiv = document.getElementById('batch-progress');
        const resultsDiv = document.getElementById('batch-results');
        const resetBtn = document.getElementById('batch-reset-btn');

        if (convertBtn) convertBtn.disabled = true;
        if (progressDiv) {
            progressDiv.classList.remove('d-none');
            progressDiv.innerHTML = '<div class="progress"><div class="progress-bar" style="width: 0%">0%</div></div>';
        }

        this.results = [];
        const total = this.files.length;

        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            try {
                const result = await this.convertSingle(file, format, quality);
                this.results.push({ success: true, file: file.name, result });
            } catch (error) {
                this.results.push({ success: false, file: file.name, error: error.message });
            }

            // Atualizar progresso
            const percent = ((i + 1) / total) * 100;
            if (progressDiv) {
                const bar = progressDiv.querySelector('.progress-bar');
                if (bar) {
                    bar.style.width = `${percent}%`;
                    bar.textContent = `${Math.round(percent)}%`;
                }
            }
        }

        // Mostrar resultados
        if (resultsDiv) {
            resultsDiv.classList.remove('d-none');
            const successful = this.results.filter(r => r.success).length;
            resultsDiv.innerHTML = `
                <div class="alert alert-success">
                    <strong>✓ Conversão Concluída!</strong><br>
                    ${successful} de ${total} imagens convertidas com sucesso.
                </div>
                <div class="list-group">
            `;

            this.results.forEach(r => {
                if (r.success) {
                    const downloadUrl = r.result.downloadUrl;
                    const fileName = r.file.substring(0, r.file.lastIndexOf('.')) + '.' + format;
                    resultsDiv.innerHTML += `
                        <a href="${downloadUrl}" download="${fileName}" class="list-group-item list-group-item-action">
                            <i class="bi bi-download me-2"></i>${fileName} (${r.result.fileSize} KB)
                        </a>
                    `;
                } else {
                    resultsDiv.innerHTML += `
                        <div class="list-group-item list-group-item-danger">
                            <i class="bi bi-x-circle me-2"></i>${r.file} - ${r.error}
                        </div>
                    `;
                }
            });

            resultsDiv.innerHTML += '</div>';
        }

        if (convertBtn) convertBtn.disabled = false;
        if (resetBtn) resetBtn.classList.remove('d-none');
        this.showSuccess(`${this.results.filter(r => r.success).length} imagens convertidas!`);
    }

    async convertSingle(file, format, quality) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', format);
        formData.append('quality', quality);

        const response = await fetch('/convert/image', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao converter');
        }

        return await response.json();
    }

    reset() {
        this.files = [];
        this.results = [];
        
        const batchFileInput = document.getElementById('batch-file-input');
        const batchDropZone = document.getElementById('batch-drop-zone');
        const batchPreviewControls = document.getElementById('batch-preview-controls');
        const batchProgress = document.getElementById('batch-progress');
        const batchResults = document.getElementById('batch-results');
        const batchResetBtn = document.getElementById('batch-reset-btn');

        if (batchFileInput) batchFileInput.value = '';
        batchDropZone?.classList.remove('d-none');
        batchPreviewControls?.classList.add('d-none');
        batchProgress?.classList.add('d-none');
        batchResults?.classList.add('d-none');
        batchResetBtn?.classList.add('d-none');
    }

    showError(message) {
        const div = document.createElement('div');
        div.className = 'alert alert-danger alert-dismissible fade show';
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.right = '20px';
        div.style.zIndex = '9999';
        div.innerHTML = `<strong>✗</strong> ${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }

    showSuccess(message) {
        const div = document.createElement('div');
        div.className = 'alert alert-success alert-dismissible fade show';
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.right = '20px';
        div.style.zIndex = '9999';
        div.innerHTML = `<strong>✓</strong> ${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const imagePanel = document.getElementById('images-panel');
    if (imagePanel) {
        new ImageConverter(imagePanel);
        new BatchImageConverter(); // Inicializar conversão em lote
    }

    const documentPanel = document.getElementById('documents-panel');
    if (documentPanel) {
        new DocumentConverter(documentPanel);
    }

    const archivePanel = document.getElementById('archive-panel');
    if (archivePanel) {
        new ArchiveConverter(archivePanel);
    }

    // Inicializar gerenciadores globais
    window.historyManager = new HistoryManager();
    window.themeManager = new ThemeManager();
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
        const quality = this.elements.qualitySlider?.value || 90;
        const formData = new FormData();
        formData.append('file', this.originalFile);
        formData.append('format', format);
        formData.append('quality', quality);

        this.elements.convertBtn.disabled = true;
        this.elements.convertBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Convertendo...';

        // Criar barra de progresso
        const progressBar = this.createProgressBar();
        this.panel.appendChild(progressBar);

        try {
            const xhr = new XMLHttpRequest();
            
            // Monitorar progresso do upload
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    this.updateProgressBar(progressBar, percentComplete);
                }
            });

            // Promessa para aguardar a resposta
            const response = await new Promise((resolve, reject) => {
                xhr.onload = () => resolve(xhr);
                xhr.onerror = () => reject(new Error('Erro na requisição'));
                xhr.open('POST', `/convert/${this.fileType}`);
                xhr.send(formData);
            });

            if (response.status !== 200) {
                let errorMsg = 'Erro ao converter o arquivo.';
                try {
                    const errorData = JSON.parse(response.responseText);
                    errorMsg = errorData.error || errorMsg;
                    if (errorData.details) {
                        console.error('Detalhes do erro:', errorData.details);
                    }
                } catch (e) {
                    errorMsg = response.responseText;
                }
                throw new Error(errorMsg);
            }

            const result = JSON.parse(response.responseText);
            const originalName = this.originalFile.name.substring(0, this.originalFile.name.lastIndexOf('.'));

            this.elements.downloadLink.href = result.downloadUrl;
            this.elements.downloadLink.download = `${originalName}.${format}`;
            this.elements.downloadLink.classList.remove('d-none');

            // Salvar no histórico
            this.saveToHistory(result, originalName, format);

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
            // Remover barra de progresso após 1 segundo
            setTimeout(() => progressBar.remove(), 1000);
        }
    }

    createProgressBar() {
        const container = document.createElement('div');
        container.className = 'progress-container my-3';
        container.innerHTML = `
            <div class="progress" style="height: 25px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" 
                     style="width: 0%"
                     aria-valuenow="0" 
                     aria-valuemin="0" 
                     aria-valuemax="100">0%</div>
            </div>
        `;
        return container;
    }

    updateProgressBar(container, percent) {
        const bar = container.querySelector('.progress-bar');
        bar.style.width = `${percent}%`;
        bar.setAttribute('aria-valuenow', percent);
        bar.textContent = `${Math.round(percent)}%`;
    }

    saveToHistory(result, originalName, format) {
        try {
            const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
            history.unshift({
                type: this.fileType,
                originalName: originalName,
                format: format,
                size: result.fileSize,
                downloadUrl: result.downloadUrl,
                timestamp: new Date().toISOString()
            });
            // Manter apenas os últimos 20
            if (history.length > 20) history.pop();
            localStorage.setItem('conversionHistory', JSON.stringify(history));
            
            // Atualizar UI do histórico se existir
            if (window.historyManager) {
                window.historyManager.refresh();
            }
        } catch (e) {
            console.error('Erro ao salvar histórico:', e);
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
        this.originalImageData = null;
        this.editedImageData = null;
        this.zoomLevel = 1;
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        this.setupImageEditor();
    }

    setupImageEditor() {
        // Adicionar elementos de edição se não existirem
        const controlsBox = this.panel.querySelector('.controls-box');
        if (!controlsBox) return;

        // Verificar se já existe a seção de edição
        if (!controlsBox.querySelector('.image-editor-section')) {
            const editorSection = document.createElement('div');
            editorSection.className = 'image-editor-section mb-3';
            editorSection.innerHTML = `
                <hr>
                <h6>✨ Edição de Imagem</h6>
                <div class="btn-group w-100 mb-2" role="group">
                    <button type="button" class="btn btn-sm btn-outline-primary" id="rotate-left-btn" title="Rotacionar 90° esquerda">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-primary" id="rotate-right-btn" title="Rotacionar 90° direita">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-primary" id="flip-h-btn" title="Espelhar horizontal">
                        <i class="bi bi-arrow-left-right"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-primary" id="flip-v-btn" title="Espelhar vertical">
                        <i class="bi bi-arrow-down-up"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="reset-edits-btn" title="Resetar edições">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                </div>
                <button type="button" class="btn btn-sm btn-outline-info w-100 mb-2" id="view-metadata-btn">
                    <i class="bi bi-info-circle me-1"></i>Ver Metadados EXIF
                </button>
                <button type="button" class="btn btn-sm btn-outline-success w-100" id="compare-btn" style="display:none;">
                    <i class="bi bi-arrow-left-right me-1"></i>Comparar Antes/Depois
                </button>
            `;
            
            // Inserir antes do botão de converter
            const convertBtn = controlsBox.querySelector('#image-convert-btn');
            controlsBox.insertBefore(editorSection, convertBtn);

            // Adicionar event listeners
            this.panel.querySelector('#rotate-left-btn')?.addEventListener('click', () => this.rotateImage(-90));
            this.panel.querySelector('#rotate-right-btn')?.addEventListener('click', () => this.rotateImage(90));
            this.panel.querySelector('#flip-h-btn')?.addEventListener('click', () => this.flipImage('h'));
            this.panel.querySelector('#flip-v-btn')?.addEventListener('click', () => this.flipImage('v'));
            this.panel.querySelector('#reset-edits-btn')?.addEventListener('click', () => this.resetEdits());
            this.panel.querySelector('#view-metadata-btn')?.addEventListener('click', () => this.showMetadata());
            this.panel.querySelector('#compare-btn')?.addEventListener('click', () => this.toggleCompare());
        }

        // Adicionar zoom na preview
        const previewImg = this.elements.preview;
        if (previewImg) {
            previewImg.style.cursor = 'zoom-in';
            previewImg.addEventListener('click', () => this.toggleZoom());
        }

        // Configurar slider de qualidade
        const qualitySlider = document.getElementById('image-quality-slider');
        const qualityValue = document.getElementById('quality-value');
        if (qualitySlider && qualityValue) {
            this.elements.qualitySlider = qualitySlider;
            qualitySlider.addEventListener('input', (e) => {
                qualityValue.textContent = e.target.value;
            });
        }
    }

    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showError('Por favor, selecione um arquivo de imagem válido.');
            return;
        }
        
        // Validação de tamanho (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showError('Arquivo muito grande! Máximo: 10MB');
            return;
        }

        super.handleFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImageData = e.target.result;
            this.editedImageData = e.target.result;
            this.elements.preview.src = e.target.result;
            this.rotation = 0;
            this.flipH = false;
            this.flipV = false;
            this.updateImageTransform();
            
            // Extrair e mostrar informações básicas
            const img = new Image();
            img.onload = () => {
                const details = this.elements.details;
                details.innerHTML = `
                    ${file.name} | ${(file.size / 1024).toFixed(2)} KB<br>
                    <small>${img.width} × ${img.height} pixels</small>
                `;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    rotateImage(degrees) {
        this.rotation = (this.rotation + degrees) % 360;
        this.updateImageTransform();
    }

    flipImage(direction) {
        if (direction === 'h') {
            this.flipH = !this.flipH;
        } else {
            this.flipV = !this.flipV;
        }
        this.updateImageTransform();
    }

    updateImageTransform() {
        const img = this.elements.preview;
        const scaleX = this.flipH ? -1 : 1;
        const scaleY = this.flipV ? -1 : 1;
        img.style.transform = `rotate(${this.rotation}deg) scale(${scaleX}, ${scaleY})`;
        img.style.transition = 'transform 0.3s ease';
    }

    resetEdits() {
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        this.updateImageTransform();
        this.showSuccess('Edições resetadas!');
    }

    toggleZoom() {
        const img = this.elements.preview;
        if (this.zoomLevel === 1) {
            this.zoomLevel = 2;
            img.style.cursor = 'zoom-out';
            img.style.transform += ' scale(2)';
        } else {
            this.zoomLevel = 1;
            img.style.cursor = 'zoom-in';
            this.updateImageTransform();
        }
    }

    async showMetadata() {
        try {
            // Extrair EXIF usando biblioteca ou exibir informações básicas
            const img = new Image();
            img.src = this.originalImageData;
            
            await img.decode();
            
            const info = `
                <div class="metadata-info">
                    <h5>📊 Informações da Imagem</h5>
                    <ul class="list-group">
                        <li class="list-group-item"><strong>Dimensões:</strong> ${img.width} × ${img.height} pixels</li>
                        <li class="list-group-item"><strong>Tamanho:</strong> ${(this.originalFile.size / 1024).toFixed(2)} KB</li>
                        <li class="list-group-item"><strong>Tipo:</strong> ${this.originalFile.type}</li>
                        <li class="list-group-item"><strong>Aspect Ratio:</strong> ${(img.width / img.height).toFixed(2)}</li>
                        <li class="list-group-item"><strong>Megapixels:</strong> ${((img.width * img.height) / 1000000).toFixed(2)} MP</li>
                    </ul>
                </div>
            `;
            
            this.showCustomModal('Metadados da Imagem', info);
        } catch (error) {
            this.showError('Erro ao extrair metadados');
        }
    }

    toggleCompare() {
        // Implementar comparação antes/depois
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Comparação Antes/Depois</h5>
                        <button type="button" class="btn-close" data-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6 text-center">
                                <h6>Original</h6>
                                <img src="${this.originalImageData}" class="img-fluid" style="max-height: 500px;">
                            </div>
                            <div class="col-md-6 text-center">
                                <h6>Editada</h6>
                                <img src="${this.editedImageData || this.originalImageData}" class="img-fluid" style="max-height: 500px;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.querySelector('.btn-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    showCustomModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.querySelector('.btn-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    resetInterface() {
        super.resetInterface();
        this.elements.preview.src = '#';
        this.originalImageData = null;
        this.editedImageData = null;
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        this.zoomLevel = 1;
    }
}

class DocumentConverter extends BaseConverter {
    constructor(panel) {
        super(panel, 'document');
    }

    handleFile(file) {
        super.handleFile(file);
        this.originalFileName = file.name;
        
        // Adicionar preview de conteúdo
        const ext = file.name.toLowerCase().split('.').pop();
        if (ext === 'txt' || ext === 'html' || ext === 'htm') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const preview = this.elements.preview;
                
                // Criar container de preview
                preview.innerHTML = `
                    <div style="max-height: 300px; overflow-y: auto; text-align: left; padding: 15px; background: #f8f9fa; border-radius: 5px; font-family: monospace; font-size: 12px; white-space: pre-wrap;">
                        ${ext === 'html' || ext === 'htm' ? content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : content}
                    </div>
                    <p class="text-muted mt-2"><small>Preview dos primeiros caracteres do documento</small></p>
                `;
            };
            reader.readAsText(file);
        }
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