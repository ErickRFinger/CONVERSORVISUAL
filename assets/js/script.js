document.addEventListener('DOMContentLoaded', () => {
    const imagePanel = document.getElementById('images-panel');
    if (imagePanel) {
        new ImageConverter(imagePanel);
    }
});

class ImageConverter {
    #originalFile = null;
    #originalUrl = null;

    constructor(panel) {
        this.panel = panel;
        this.elements = {
            inputFormatSelect: panel.querySelector('#image-input-format'),
            dropZone: panel.querySelector('#image-drop-zone'),
            fileInput: panel.querySelector('#image-file-input'),
            browseBtn: panel.querySelector('#image-browse-btn'),
            previewControls: panel.querySelector('#image-preview-controls'),
            imagePreview: panel.querySelector('#image-preview'),
            imageDetails: panel.querySelector('#image-details'),
            convertFormatSelect: panel.querySelector('#image-convert-format'),
            convertBtn: panel.querySelector('#image-convert-btn'),
            downloadLink: panel.querySelector('#image-download-link'),
            resetBtn: panel.querySelector('#image-reset-btn'),
        };
        this.#addEventListeners();
    }

    #addEventListeners() {
        this.elements.inputFormatSelect.addEventListener('change', this.#onInputFormatChange.bind(this));
        this.elements.browseBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.dropZone.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', this.#onFileChange.bind(this));
        this.elements.dropZone.addEventListener('dragover', this.#onDragOver.bind(this));
        this.elements.dropZone.addEventListener('dragleave', this.#onDragLeave.bind(this));
        this.elements.dropZone.addEventListener('drop', this.#onDrop.bind(this));
        this.elements.convertBtn.addEventListener('click', this.#convertImage.bind(this));
        this.elements.resetBtn.addEventListener('click', this.#resetInterface.bind(this));
    }

    #onInputFormatChange() {
        const format = this.elements.inputFormatSelect.value;
        this.elements.fileInput.accept = format === 'any' ? 'image/*' : `image/${format}`;
    }

    #onFileChange(e) {
        if (e.target.files[0]) {
            this.#handleFile(e.target.files[0]);
        }
    }

    #onDragOver(e) {
        e.preventDefault();
        this.elements.dropZone.classList.add('dragover');
    }

    #onDragLeave() {
        this.elements.dropZone.classList.remove('dragover');
    }

    #onDrop(e) {
        e.preventDefault();
        this.elements.dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) {
            this.#handleFile(e.dataTransfer.files[0]);
        }
    }

    #handleFile(file) {
        if (!file.type.startsWith('image/')) {
            this.#showError('Por favor, selecione um arquivo de imagem válido.');
            return;
        }
        this.#originalFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.#originalUrl = e.target.result;
            this.elements.imagePreview.src = this.#originalUrl;
            this.elements.imageDetails.textContent = `${this.#originalFile.name} | ${(this.#originalFile.size / 1024).toFixed(2)} KB`;
            this.elements.dropZone.classList.add('d-none');
            this.elements.previewControls.classList.remove('d-none');
            this.elements.resetBtn.classList.remove('d-none');
            this.elements.downloadLink.classList.add('d-none');
        };
        reader.readAsDataURL(file);
    }

    #convertImage() {
        const format = this.elements.convertFormatSelect.value;
        const mimeType = `image/${format}`;
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (mimeType === 'image/jpeg' || mimeType === 'image/bmp') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                const convertedUrl = URL.createObjectURL(blob);
                const originalName = this.#originalFile.name.substring(0, this.#originalFile.name.lastIndexOf('.'));
                this.elements.downloadLink.href = convertedUrl;
                this.elements.downloadLink.download = `${originalName}.${format}`;
                this.elements.downloadLink.classList.remove('d-none');
            }, mimeType, 1);
        };
        img.src = this.#originalUrl;
    }

    #resetInterface() {
        this.elements.fileInput.value = '';
        this.#originalFile = null;
        this.#originalUrl = null;
        this.elements.dropZone.classList.remove('d-none');
        this.elements.previewControls.classList.add('d-none');
        this.elements.resetBtn.classList.add('d-none');
        this.elements.downloadLink.classList.add('d-none');
        this.elements.imagePreview.src = '#';
        this.elements.imageDetails.textContent = '';
    }

    #showError(message) {
        // You can implement a more sophisticated error display mechanism here
        alert(message);
    }
}
