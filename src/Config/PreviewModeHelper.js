import URLSearchParams from 'url-search-params';

export const PreviewModes = {
    CUSTOM: 'custom',
    ALL: 'all',
    NONE: 'none',
    OFF: 'off',
};

export default
{
    /**
     * Parses the preview mode config from the query string and session storage. Query
     * string config will always override anything stored in session storage.
     *
     * @public
     * @returns {object} Preview mode and preview experiments
     */
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

    /**
     * Parses preview mode config from session storage
     *
     * @private
     * @returns {object} Preview mode and preview experiments
     */
    parseSessionStorage() {
        const sessionStorage = this.getSessionStorage();
        const mode = sessionStorage ? sessionStorage.getItem('canvassPreviewMode') : null;
        const experiments = sessionStorage ? JSON.parse(sessionStorage.getItem('canvassPreviewModeExperiments')) : {};

        return mode ? {mode, experiments} : null;
    },

    /**
     * Parses preview mode config from the query string
     *
     * @private
     * @returns {object} Preview mode and preview experiments
     */
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

    /**
     * Saves the preview mode and preview experiments to session storage
     *
     * @public
     * @param {string} mode The preview mode
     * @param {object} experiments The experiment and group pairs
     */
    saveToSessionStorage(mode, experiments) {
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

    /**
     * Gets the location search value
     *
     * @private
     * @returns {string} window.location.search
     */
    getWindowLocationSearch() {
        return window.location.search;
    },

    /**
     * Gets the sessionStorage object
     *
     * @private
     * @returns {object} sessionStorage
     */
    getSessionStorage() {
        return sessionStorage;
    },

    /**
     * Checks if the data passed in is a JSON object
     *
     * @private
     * @param {*} data Data to check
     * @returns {boolean} Whether or not the data is a JSON object
     */
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
