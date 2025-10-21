document.addEventListener('DOMContentLoaded', () => {
    const imagePanel = document.getElementById('images-panel');
    if (imagePanel) {
        new ImageConverter(imagePanel);
    }

    const videoPanel = document.getElementById('videos-panel');
    if (videoPanel) {
        new VideoConverter(videoPanel);
    }

    const documentPanel = document.getElementById('documents-panel');
    if (documentPanel) {
        new DocumentConverter(documentPanel);
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
        this.elements.browseBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.dropZone.addEventListener('click', () => this.elements.fileInput.click());
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
                const errorText = await response.text();
                throw new Error(`Erro no servidor: ${errorText}`);
            }

            const result = await response.json();
            const originalName = this.originalFile.name.substring(0, this.originalFile.name.lastIndexOf('.'));

            this.elements.downloadLink.href = result.downloadUrl;
            this.elements.downloadLink.download = `${originalName}.${format}`;
            this.elements.downloadLink.classList.remove('d-none');

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
        alert(message);
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

class VideoConverter extends BaseConverter {
    constructor(panel) {
        super(panel, 'video');
    }

    handleFile(file) {
        if (!file.type.startsWith('video/')) {
            this.showError('Por favor, selecione um arquivo de vídeo válido.');
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
        this.elements.preview.src = '';
    }
}

class DocumentConverter extends BaseConverter {
    constructor(panel) {
        super(panel, 'document');
    }

    handleFile(file) {
        // Document preview is just an icon, so no special handling needed
        super.handleFile(file);
    }
}