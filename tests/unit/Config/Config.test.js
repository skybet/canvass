/* eslint no-new: 0 */

import sinon from 'sinon';
import assert from 'assert';
import {Config, configDefaults} from '~/src/Config/Config';
import PreviewModeHelper, {PreviewModes} from '~/src/Config/PreviewModeHelper';
import cookies from 'js-cookie';
import CookieNames from '~/src/Helpers/CookieNames';
import logger, {PREFIX_DEFAULT as LOGGER_PREFIX_DEFAULT} from '~/src/Helpers/Logger';

describe('Config', () => {

    let sandbox, testConfig, testDefaults, mockCookies, mockHelper, mockLogger;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        global.document = {cookie: ''};
        testDefaults = configDefaults;
        mockCookies = sinon.mock(cookies);
        // mockHelper = sinon.mock(PreviewModeHelper);
        mockHelper = sandbox.stub(PreviewModeHelper);
        mockHelper.parse.returns({mode: 'off', experiments: {}});
        mockLogger = sinon.mock(logger);
    });

    afterEach(() => {
        sandbox.restore();
        mockCookies.restore();
        mockLogger.restore();
    });

    describe('Initialization', () => {

        beforeEach(() => {
            testConfig = new Config();
        });


        it('sets default configuration', () => {
            assert.deepEqual(testConfig.config, testDefaults);
        });

        it('returns the config value with get', () => {
            assert.equal(testConfig.get('debug'), testDefaults.debug);
        });

        it('overrides config options with set', () => {
            assert.equal(testConfig.get('debug'), testDefaults.debug);
            testConfig.set('debug', true);
            assert.equal(testConfig.get('debug'), true);

            assert.equal(testConfig.get('previewMode'), testDefaults.previewMode);
            testConfig.set('previewMode', PreviewModes.ALL);
            assert.equal(testConfig.get('previewMode'), PreviewModes.ALL);
        });
    });

    describe('Cookie Overrides', () => {
        it('fails gracefully if a global document object cannot be found', () => {
            let oldDocument = global.document;
            delete global.document;

            assert.doesNotThrow(() => new Config());

            global.document = oldDocument;
        });

        it('overrides debug if cookie is set', () => {
            mockCookies
                .expects('get')
                .once()
                .withArgs(CookieNames.DEBUG)
                .returns({canvassDebug: 1});
            mockLogger.expects('info').once();

            testConfig = new Config();

            assert.equal(testConfig.get('debug'), true);
            mockCookies.verify();
            mockLogger.verify();
        });
    });

    describe('Preview mode', () => {
        it('overrides preview mode if helper returns different mode', () => {
            const mode = PreviewModes.ALL;
            const experiments = {};
            mockHelper.parse.returns({mode, experiments});

            testConfig = new Config();

            assert.equal(testConfig.get('previewMode'), mode);
        });

        it('sets experiments from the helper', () => {
            const mode = PreviewModes.CUSTOM;
            const experiments = {foo: 'bar'};
            mockHelper.parse.returns({mode, experiments});

            testConfig = new Config();

            assert.equal(testConfig.get('previewMode'), mode);
            assert.deepEqual(testConfig.getPreviewModeExperiments(), experiments);
        });

        it('saves state to session storage', () => {
            const saveSpy = sandbox.spy();
            mockHelper.saveToSessionStorage = saveSpy;

            testConfig = new Config();

            assert(saveSpy.calledOnce);
        });

        it('if enabled, set logger prefix to include [preview-mode]', () => {
            const mode = PreviewModes.ALL;
            const experiments = {};
            mockHelper.parse.returns({mode, experiments});
            mockLogger.expects('setPrefix').once().withArgs(LOGGER_PREFIX_DEFAULT + '[preview-mode]');

            testConfig = new Config();

            mockLogger.verify();
        });
    });
});
