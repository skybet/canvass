import sinon from 'sinon';
import assert from 'assert';
import logger from '~/src/Helpers/Logger';
import QubitHelper from '~/src/Helpers/QubitHelper';

describe('QubitHelper', () => {

    let mockWindow, uvEmitSpy, uvEventsPushSpy, mockLogger;

    uvEmitSpy = sinon.spy();
    uvEventsPushSpy = sinon.spy();

    beforeEach(() => {
        global.window = {
            __qubit: {
                experiences: [],
                uv: {
                    emit: uvEmitSpy,
                },
            },
            universal_variable: { /* eslint camelcase: 0 */
                events: {
                    push: uvEventsPushSpy,
                },
            },
        };

        mockWindow = global.window;

        mockLogger = sinon.mock(logger);

    });

    afterEach(() => {
        delete global.window;
        mockLogger.restore();
        uvEmitSpy.reset();
        uvEventsPushSpy.reset();
    });

    describe('trackEvent', () => {
        it('throws an error if type is not an argument', () => {
            assert.throws(() => QubitHelper.trackEvent(), /type/);
        });

        it('throws an error if name is not an argument', () => {
            assert.throws(() => QubitHelper.trackEvent('qp'), /name/);
        });

        it('throws an error if type is not supported', () => {
            assert.throws(() => QubitHelper.trackEvent('unknownType', 'foo'), /unknown type/);
        });

        it('calls emit on qubit if type is qp', () => {
            QubitHelper.trackEvent('qp', 'foo');

            sinon.assert.calledOnce(uvEmitSpy);
            sinon.assert.calledWith(uvEmitSpy, 'foo');
        });

        it('does not call emit if uv object is not available', () => {
            delete mockWindow['__qubit'].uv;

            QubitHelper.trackEvent('qp', 'foo');

            sinon.assert.notCalled(uvEmitSpy);
        });

        it('logs a warning if uv window object is not available', () => {
            delete mockWindow['__qubit'].uv;
            mockLogger.expects('warn').once().withArgs(sinon.match(/foo/));

            QubitHelper.trackEvent('qp', 'foo');

            mockLogger.verify();
        });

        it('calls events.push on universal_variable object if type is uv', () => {
            QubitHelper.trackEvent('uv', 'foo');

            sinon.assert.calledOnce(uvEventsPushSpy);
            sinon.assert.calledWith(uvEventsPushSpy, {action: 'foo'});
        });
    });

    describe('triggerExperiment', () => {

        beforeEach(() => {
            mockWindow['__qubit'].experiences.testExperiment = {
                trigger: sinon.stub(),
            };
        });

        it('throws an error if experiment is not an argument', () => {
            assert.throws(() => QubitHelper.triggerExperiment(), /experiment/);
        });

        it('throws an error if callback is not an argument', () => {
            assert.throws(() => QubitHelper.triggerExperiment('testExperiment'), /callback/);
        });

        it('fails gracefully if there is no matching experience in qubit', () => {
            assert.doesNotThrow(() => QubitHelper.triggerExperiment('DoesNotExistInQubit', () => {}));
        });

    });

    describe('getQubit', () => {
        it('returns qubit window object from the window if available', () => {
            assert.equal(QubitHelper.getQubit(), mockWindow['__qubit']);
        });

        it('returns undefined if the object is not available', () => {
            global.window = {};
            assert.equal(QubitHelper.getQubit(), undefined);
        });
    });

    describe('getExperimentTrigger', () => {
        beforeEach(() => {
            mockWindow['__qubit'].experiences.foo = {
                trigger: sinon.stub(),
            };
        });

        it('returns the experiments trigger function if available on qubit', () => {
            assert.equal(
                QubitHelper.getQubitExperimentTrigger('foo'),
                mockWindow['__qubit'].experiences.foo.trigger
            );
        });

        it('returns null if the experiment trigger is not on the window', () => {
            assert.equal(QubitHelper.getQubitExperimentTrigger('bar'), null);
        });
    });

});
