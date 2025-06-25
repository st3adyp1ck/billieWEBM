class VideoConverter {
    constructor() {
        this.currentFile = null;
        this.conversionId = null;
        this.progressInterval = null;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        // Sections
        this.uploadSection = document.getElementById('upload-section');
        this.previewSection = document.getElementById('preview-section');
        this.progressSection = document.getElementById('progress-section');
        this.downloadSection = document.getElementById('download-section');
        
        // Upload elements
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.errorMessage = document.getElementById('error-message');
        
        // Preview elements
        this.previewVideo = document.getElementById('preview-video');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.clearButton = document.getElementById('clear-file');
        
        // Progress elements
        this.progressText = document.getElementById('progress-text');
        this.progressFill = document.getElementById('progress-fill');
        this.progressPercentage = document.getElementById('progress-percentage');
        
        // Download elements
        this.downloadButton = document.getElementById('download-button');
        this.convertAnotherButton = document.getElementById('convert-another');
        
        // Language toggle
        this.languageToggle = document.getElementById('language-toggle');
    }
    
    bindEvents() {
        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Button events
        this.clearButton.addEventListener('click', () => this.clearFile());
        this.downloadButton.addEventListener('click', () => this.downloadFile());
        this.convertAnotherButton.addEventListener('click', () => this.convertAnother());
        
        // Language toggle
        this.languageToggle.addEventListener('click', () => this.toggleLanguage());
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFileSelect(files[0]);
        }
    }
    
    handleFileSelect(file) {
        if (!file) return;
        
        // Validate file
        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.showError(validation.error);
            return;
        }
        
        this.currentFile = file;
        this.showPreview();
        this.startConversion();
    }
    
    validateFile(file) {
        // Check file type
        const allowedTypes = ['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg', 'ogv'];
        const allowedMimeTypes = ['video/'];

        const fileName = file.name.toLowerCase();
        const fileType = file.type.toLowerCase();

        const hasValidExtension = allowedTypes.some(ext => fileName.endsWith(`.${ext}`));
        const hasValidMimeType = allowedMimeTypes.some(type => fileType.includes(type));

        if (!hasValidExtension && !hasValidMimeType) {
            return { valid: false, error: t('errors.unsupported-format') };
        }

        // Check file size (100MB limit)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            return { valid: false, error: t('errors.file-too-large') };
        }

        return { valid: true };
    }
    
    showPreview() {
        this.hideAllSections();
        this.previewSection.classList.remove('hidden');
        
        // Set video preview
        const videoUrl = URL.createObjectURL(this.currentFile);
        this.previewVideo.src = videoUrl;
        
        // Set file info
        this.fileName.textContent = this.currentFile.name;
        this.fileSize.textContent = `${(this.currentFile.size / (1024 * 1024)).toFixed(2)} MB`;
        
        // Clean up URL after video loads
        this.previewVideo.addEventListener('loadeddata', () => {
            URL.revokeObjectURL(videoUrl);
        }, { once: true });
    }
    
    async startConversion() {
        try {
            const formData = new FormData();
            formData.append('video', this.currentFile);
            
            const response = await fetch('/api/convert', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.installInstructions) {
                    this.showError(`${errorData.error}\n\n${errorData.installInstructions}`);
                    return;
                }
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            this.conversionId = result.conversionId;
            
            this.showProgress();
            this.startProgressTracking();
            
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError(t('errors.upload-failed'));
        }
    }
    
    showProgress() {
        this.hideAllSections();
        this.progressSection.classList.remove('hidden');
        this.updateProgress(0, 'preparing');
    }
    
    startProgressTracking() {
        this.progressInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/progress/${this.conversionId}`);
                if (!response.ok) return;
                
                const progress = await response.json();
                
                if (progress.stage === 'error') {
                    this.stopProgressTracking();
                    this.showError(t('errors.conversion-failed'));
                    return;
                }
                
                this.updateProgress(progress.progress, progress.stage);
                
                if (progress.stage === 'completed') {
                    this.stopProgressTracking();
                    this.showDownload();
                }
                
            } catch (error) {
                console.error('Progress tracking error:', error);
            }
        }, 1000);
    }
    
    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    updateProgress(percentage, stage) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressPercentage.textContent = `${Math.round(percentage)}%`;
        
        let stageText = t('progress.converting');
        if (stage === 'preparing') {
            stageText = t('progress.preparing');
        } else if (stage === 'finalizing') {
            stageText = t('progress.finalizing');
        }
        
        this.progressText.textContent = stageText;
    }
    
    showDownload() {
        this.hideAllSections();
        this.downloadSection.classList.remove('hidden');
    }
    
    async downloadFile() {
        if (!this.conversionId) return;
        
        try {
            const response = await fetch(`/api/download/${this.conversionId}`);
            if (!response.ok) {
                throw new Error('Download failed');
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = this.currentFile.name.replace(/\.[^/.]+$/, '.webm');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Download error:', error);
            this.showError(t('errors.conversion-failed'));
        }
    }
    
    convertAnother() {
        this.clearFile();
    }
    
    clearFile() {
        this.currentFile = null;
        this.conversionId = null;
        this.stopProgressTracking();
        
        this.fileInput.value = '';
        this.hideAllSections();
        this.uploadSection.classList.remove('hidden');
        this.hideError();
    }
    
    hideAllSections() {
        this.uploadSection.classList.add('hidden');
        this.previewSection.classList.add('hidden');
        this.progressSection.classList.add('hidden');
        this.downloadSection.classList.add('hidden');
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
    }
    
    hideError() {
        this.errorMessage.classList.add('hidden');
    }
    
    toggleLanguage() {
        const newLang = currentLanguage === 'en' ? 'fr' : 'en';
        updateLanguage(newLang);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoConverter();
});
