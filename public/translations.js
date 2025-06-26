const translations = {
    en: {
        'main-title': 'Billie\'s Magic Video Converter',
        'subtitle': 'Transform your videos into magical WebM format! ✨',
        'language-text': 'Switch to French',
        'step1': '🎬 Step 1: Upload your magical video file',
        'step2': '⚡ Step 2: Watch the magic happen automatically',
        'step3': '🎉 Step 3: Download your sparkling WebM file',
        'upload-text': 'Drop your video here for some magic! 🪄',
        'or-text': 'or',
        'click-text': 'Click to browse your files',
        'max-size': 'Videos will be automatically cut to first 3 seconds and resized to 512x512',
        'supported-format': 'All video formats welcome! Output: WebM VP9, <256KB ✨',
        'progress-text': 'Sprinkling magic dust on your video... ✨',
        'success-title': 'Ta-da! Magic complete! 🎉',
        'success-message': 'Your sparkling WebM file is ready for download! ✨',
        'download-text': 'Download WebM',
        'convert-another-text': 'Convert Another File',
        'errors': {
            'unsupported-format': 'Unsupported file format. Please select a common video file (MP4, AVI, MOV, MKV, etc.).',
            'file-too-large': 'File is too large. Maximum size is 100MB.',
            'conversion-failed': 'Conversion failed. Please try again.',
            'upload-failed': 'Upload failed. Please try again.',
            'no-file-selected': 'No file selected. Please choose a video file.'
        },
        'progress': {
            'preparing': 'Preparing the magic cauldron... 🪄',
            'converting': 'Casting video transformation spells... ✨',
            'finalizing': 'Adding final sparkles... 🌟'
        }
    },
    fr: {
        'main-title': 'Convertisseur Magique de Billie',
        'subtitle': 'Transformez vos vidéos en format WebM magique! ✨',
        'language-text': 'Passer à l\'anglais',
        'step1': '🎬 Étape 1 : Téléchargez votre fichier vidéo magique',
        'step2': '⚡ Étape 2 : Regardez la magie opérer automatiquement',
        'step3': '🎉 Étape 3 : Téléchargez votre fichier WebM étincelant',
        'upload-text': 'Déposez votre vidéo ici pour la magie! 🪄',
        'or-text': 'ou',
        'click-text': 'Cliquez pour parcourir vos fichiers',
        'max-size': 'Les vidéos seront automatiquement coupées aux 3 premières secondes et redimensionnées à 512x512',
        'supported-format': 'Tous les formats vidéo bienvenus! Sortie: WebM VP9, <256Ko ✨',
        'progress-text': 'Saupoudrage de poussière magique sur votre vidéo... ✨',
        'success-title': 'Ta-da! Magie accomplie! 🎉',
        'success-message': 'Votre fichier WebM étincelant est prêt à télécharger! ✨',
        'download-text': 'Télécharger WebM',
        'convert-another-text': 'Convertir un autre fichier',
        'errors': {
            'unsupported-format': 'Format de fichier non supporté. Veuillez sélectionner un fichier vidéo commun (MP4, AVI, MOV, MKV, etc.).',
            'file-too-large': 'Le fichier est trop volumineux. La taille maximale est de 100 Mo.',
            'conversion-failed': 'La conversion a échoué. Veuillez réessayer.',
            'upload-failed': 'Le téléchargement a échoué. Veuillez réessayer.',
            'no-file-selected': 'Aucun fichier sélectionné. Veuillez choisir un fichier vidéo.'
        },
        'progress': {
            'preparing': 'Préparation du chaudron magique... 🪄',
            'converting': 'Lancement des sorts de transformation... ✨',
            'finalizing': 'Ajout des dernières étincelles... 🌟'
        }
    }
};

let currentLanguage = localStorage.getItem('language') || 'en';

function updateLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    
    // Update all translatable elements
    Object.keys(translations[lang]).forEach(key => {
        const element = document.getElementById(key);
        if (element && typeof translations[lang][key] === 'string') {
            element.textContent = translations[lang][key];
        }
    });
}

function t(key, params = {}) {
    let translation = translations[currentLanguage];
    const keys = key.split('.');
    
    for (const k of keys) {
        if (translation && typeof translation === 'object') {
            translation = translation[k];
        } else {
            return key; // Return key if translation not found
        }
    }
    
    if (typeof translation === 'string') {
        // Replace parameters in translation
        return translation.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] || match;
        });
    }
    
    return key;
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage(currentLanguage);
});
