/* eslint no-new: 0 */

import sinon from 'sinon';
import assert from 'assert';
import {Config, configDefaults, PreviewModes} from '~/src/Config';
import cookies from 'js-cookie';
import CookieNames from '~/src/Helpers/CookieNames';
import logger from '~/src/Helpers/Logger';

describe('Config', () => {

    let testConfig, testDefaults, mockCookies;

    beforeEach(() => {
        global.document = {cookie: ''};
        testDefaults = configDefaults;
        mockCookies = sinon.mock(cookies);
    });

    afterEach(() => {
        mockCookies.restore();
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
        let loggerMock;

        beforeEach(() => {
            loggerMock = sinon.mock(logger);
        });

        afterEach(() => {
            loggerMock.restore();
        });

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
            loggerMock.expects('info').once();

            testConfig = new Config();

            assert.equal(testConfig.get('debug'), true);
            mockCookies.verify();
            loggerMock.verify();
        });
    });

    describe('Preview Mode', () => {
        describe('Query string', () => {
            let sandbox, ConfigWithMocks;

            beforeEach(() => {
                sandbox = sinon.sandbox.create();
                ConfigWithMocks = Config;
            });

            afterEach(function () {
                sandbox.restore();
            });

            it('sets preview mode to "all" from query string', () => {
                const queryString = '?canvassPreviewMode=all';
                sandbox.stub(ConfigWithMocks.prototype, 'getWindowLocationSearch').returns(queryString);
                let config = new ConfigWithMocks();

                assert.equal(config.get('previewMode'), PreviewModes.ALL);
            });

            it('sets preview mode to "none" from query string', () => {
                const queryString = '?canvassPreviewMode=none';
                sandbox.stub(ConfigWithMocks.prototype, 'getWindowLocationSearch').returns(queryString);
                let config = new ConfigWithMocks();

                assert.equal(config.get('previewMode'), PreviewModes.NONE);
            });

            it('sets preview mode to "off" from query string', () => {
                const queryString = '?canvassPreviewMode=off';
                sandbox.stub(ConfigWithMocks.prototype, 'getWindowLocationSearch').returns(queryString);
                let config = new ConfigWithMocks();

                assert.equal(config.get('previewMode'), PreviewModes.OFF);
            });

            it('sets preview mode to "off" if query string does not match a mode', () => {
                const queryString = '?canvassPreviewMode=garbage';
                sandbox.stub(ConfigWithMocks.prototype, 'getWindowLocationSearch').returns(queryString);
                let config = new ConfigWithMocks();

                assert.equal(config.get('previewMode'), PreviewModes.OFF);
            });

            it('sets preview mode to "custom" from query string', () => {
                const queryString = '?canvassPreviewMode={"foo":1}';
                sandbox.stub(ConfigWithMocks.prototype, 'getWindowLocationSearch').returns(queryString);
                let config = new ConfigWithMocks();

                assert.equal(config.get('previewMode'), PreviewModes.CUSTOM);
            });

            it('sets custom preview mode experiments from query string', () => {
                const queryString = '?canvassPreviewMode={"foo":1}';
                sandbox.stub(ConfigWithMocks.prototype, 'getWindowLocationSearch').returns(queryString);
                let config = new ConfigWithMocks();

                assert.deepEqual(config.getPreviewModeExperiments(), {foo: 1});
            });

            describe('isJson', () => {
                let config;

                beforeEach(() => {
                    config = new Config();
                });

                it('returns true if json object', () => {
                    const input = JSON.stringify({foo: 'bar'});
                    assert.equal(config.isJson(input), true);
                });

                it('returns false if json but not object', () => {
                    const input = JSON.stringify('foo');
                    assert.equal(config.isJson(input), false);
                });

                it('returns false if invalid json', () => {
                    const input = '{"foo"}';
                    assert.equal(config.isJson(input), false);
                });

                it('returns false if type is not string', () => {
                    const input = 1;
                    assert.equal(config.isJson(input), false);
                });
            });

            describe('Loading Logic', () => {
                it('if no preview mode query string but session storage is set, load from there', () => {
                    // mock session storage
                    const sessionMode = 'all';
                    const getItemMock = sandbox.stub();
                    getItemMock.withArgs('canvassPreviewMode').returns(sessionMode);
                    getItemMock.withArgs('canvassPreviewModeExperiments').returns(JSON.stringify({}));
                    const sessionStorageMock = {
                        getItem: getItemMock,
                    };
                    sandbox.stub(ConfigWithMocks.prototype, 'getSessionStorage').returns(sessionStorageMock);

                    // mock query string
                    const queryMode = '';
                    sandbox.stub(ConfigWithMocks.prototype, 'getWindowLocationSearch').returns('?canvassPreviewMode=' + queryMode);

                    const config = new ConfigWithMocks();

                    assert.equal(config.get('previewMode'), PreviewModes.ALL);
                });

                it('query string should override session storage when loading', () => {
                    // mock session storage
                    const sessionMode = 'none';
                    const getItemMock = sandbox.stub();
                    getItemMock.withArgs('canvassPreviewMode').returns(sessionMode);
                    getItemMock.withArgs('canvassPreviewModeExperiments').returns(JSON.stringify({}));
                    const sessionStorageMock = {
                        getItem: getItemMock,
                    };
                    sandbox.stub(ConfigWithMocks.prototype, 'getSessionStorage').returns(sessionStorageMock);

                    // mock query string
                    const queryMode = 'all';
                    sandbox.stub(ConfigWithMocks.prototype, 'getWindowLocationSearch').returns('?canvassPreviewMode=' + queryMode);

                    const config = new ConfigWithMocks();

                    assert.equal(config.get('previewMode'), PreviewModes.ALL);
                });

                it('if no preview mode query string or session storage set to off', () => {
                    // mock session storage
                    const sessionMode = '';
                    const getItemMock = sandbox.stub();
                    getItemMock.withArgs('canvassPreviewMode').returns(sessionMode);
                    getItemMock.withArgs('canvassPreviewModeExperiments').returns(JSON.stringify({}));
                    const sessionStorageMock = {
                        getItem: getItemMock,
                    };
                    sandbox.stub(ConfigWithMocks.prototype, 'getSessionStorage').returns(sessionStorageMock);

                    // mock query string
                    const queryMode = '';
                    sandbox.stub(ConfigWithMocks.prototype, 'getWindowLocationSearch').returns('?canvassPreviewMode=' + queryMode);

                    const config = new ConfigWithMocks();

                    assert.equal(config.get('previewMode'), PreviewModes.OFF);
                });
            });
        });
    });
});
