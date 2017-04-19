import URLSearchParams from 'url-search-params';

export const PreviewModes = {
    CUSTOM: 'custom',
    ALL: 'all',
    NONE: 'none',
    OFF: 'off',
};

export default
{
    saveToSessionStorage(mode, experiments) {
        console.log('saving to session storage');
        if (sessionStorage) {
            // If turning preview mode off, just remove the key
            if (mode === PreviewModes.OFF) {
                sessionStorage.removeItem('canvassPreviewMode');
                sessionStorage.removeItem('canvassPreviewModeExperiments');
            } else {
                sessionStorage.setItem('canvassPreviewMode', mode);
                sessionStorage.setItem('canvassPreviewModeExperiments', JSON.stringify(experiments));
            }
        }
    },

    parse() {
        const previewModeQueryString = this.parseQueryString();
        const previewModeSessionStorage = this.parseSessionStorage();

        let previewMode;
        if (!previewModeQueryString && previewModeSessionStorage) {
            previewMode = previewModeSessionStorage;

        } else if (previewModeQueryString) {
            previewMode = previewModeQueryString;

        } else {
            previewMode = {mode: PreviewModes.OFF, experiments: {}};
        }

        return previewMode;
    },

    parseSessionStorage() {
        const sessionStorage = this.getSessionStorage();
        const mode = sessionStorage ? sessionStorage.getItem('canvassPreviewMode') : null;
        const experiments = sessionStorage ? JSON.parse(sessionStorage.getItem('canvassPreviewModeExperiments')) : {};

        return mode ? {mode, experiments} : null;
    },

    parseQueryString() {
        if (!window) {
            return null;
        }

        const urlParams = new URLSearchParams(this.getWindowLocationSearch());
        const previewModeParam = urlParams.get('canvassPreviewMode');

        if (this.isJson(previewModeParam)) {
            let parsedParam = JSON.parse(previewModeParam);

            if (typeof parsedParam === 'object') {
                return {mode: PreviewModes.CUSTOM, experiments: parsedParam};
            }

            return {mode: PreviewModes.OFF, experiments: {}};

        } else if (previewModeParam === PreviewModes.ALL ||
            previewModeParam === PreviewModes.NONE ||
            previewModeParam === PreviewModes.OFF) {

            return {mode: previewModeParam, experiments: {}};
        }

        return null;
    },

    getWindowLocationSearch() {
        return window.location.search;
    },

    getSessionStorage() {
        return sessionStorage;
    },

    isJson(data) {
        let jsonData;

        try {
            jsonData = JSON.parse(data);
        } catch (e) {
            return false;
        }

        if (typeof jsonData === 'object' && jsonData !== null) {
            return true;
        }

        return false;
    },
};
