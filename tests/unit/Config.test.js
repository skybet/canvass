/* eslint no-new: 0 */

import sinon from 'sinon';
import assert from 'assert';
import {Config, configDefaults} from '~/src/Config';
import cookies from 'js-cookie';
import CookieNames from '~/src/Helpers/CookieNames';
import logger from '~/src/Helpers/Logger';

describe.skip('Config', () => {

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
            mockCookies
                .expects('get')
                .once()
                .withArgs(CookieNames.DISABLE_ACTIVATION)
                .returns({canvassDisableActivation: 1});
            mockCookies.expects('get').atLeast(1);
            loggerMock.expects('info').once();

            testConfig = new Config();

            assert.equal(testConfig.config.disableActivation, true);
            mockCookies.verify();
            loggerMock.verify();
        });

        it('overrides debug if cookie is set', () => {
            mockCookies
                .expects('get')
                .once()
                .withArgs(CookieNames.DEBUG)
                .returns({canvassDebug: 1});
            mockCookies.expects('get').atLeast(1);
            loggerMock.expects('info').once();

            testConfig = new Config();

            assert.equal(testConfig.get('debug'), true);
            mockCookies.verify();
            loggerMock.verify();
        });
    });
});
