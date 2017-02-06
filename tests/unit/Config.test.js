/* eslint no-new: 0 */

import sinon from 'sinon';
import assert from 'assert';
import {Config, configDefaults} from '~/src/Config';
import cookie from 'cookie';
import logger from '~/src/Helpers/Logger';

describe('Config', () => {

    let testConfig, testDefaults;

    beforeEach(() => {
        global.document = {cookie: ''};
        testDefaults = configDefaults;
    });

    describe('Initialization', () => {

        beforeEach(() => {
            sinon.stub(cookie, 'parse', () => {
                return {};
            });

            testConfig = new Config();
        });

        afterEach(() => {
            cookie.parse.restore();
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

        it('overrides disableActivation if cookie is set', () => {
            sinon.stub(cookie, 'parse', () => {
                return {canvassDisableActivation: 1};
            });
            loggerMock.expects('info').once();

            testConfig = new Config();

            assert.equal(testConfig.get('disableActivation'), true);
            loggerMock.verify();

            cookie.parse.restore();
        });

        it('overrides debug if cookie is set', () => {
            sinon.stub(cookie, 'parse', () => {
                return {canvassDebug: 1};
            });
            loggerMock.expects('info').once();

            testConfig = new Config();

            assert.equal(testConfig.get('debug'), true);
            loggerMock.verify();

            cookie.parse.restore();
        });
    });
});
