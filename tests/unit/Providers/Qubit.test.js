import sinon from 'sinon';
import assert from 'assert';
import logger from '~/src/Helpers/Logger';
import QubitProvider, {EventType} from '~/src/Providers/Qubit';

describe('QubitProvider', () => {

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
            assert.throws(() => QubitProvider.trackEvent(), /type/);
        });

        it('throws an error if name is not an argument', () => {
            assert.throws(() => QubitProvider.trackEvent('qp'), /name/);
        });

        it('throws an error if type is not supported', () => {
            assert.throws(() => QubitProvider.trackEvent('unknownType', 'foo'), /unknown type/);
        });

        it('calls emit on qubit if type is qp', () => {
            QubitProvider.trackEvent(EventType.QPROTOCOL, 'foo');

            sinon.assert.calledOnce(uvEmitSpy);
            sinon.assert.calledWith(uvEmitSpy, 'foo');
        });

        it('does not call emit if uv object is not available', () => {
            delete mockWindow['__qubit'].uv;

            QubitProvider.trackEvent(EventType.QPROTOCOL, 'foo');

            sinon.assert.notCalled(uvEmitSpy);
        });

        it('logs a warning if qubit window object is not available when sending a qp event', () => {
            delete mockWindow['__qubit'];
            mockLogger.expects('warn').once().withArgs(sinon.match(/foo/));

            QubitProvider.trackEvent(EventType.QPROTOCOL, 'foo');

            mockLogger.verify();
        });

        it('logs a warning if uv window object is not available when sending a qp event', () => {
            delete mockWindow['__qubit'].uv;
            mockLogger.expects('warn').once().withArgs(sinon.match(/foo/));

            QubitProvider.trackEvent(EventType.QPROTOCOL, 'foo');

            mockLogger.verify();
        });

        it('calls events.push on universal_variable object if type is uv when sending a legacy event', () => {
            QubitProvider.trackEvent(EventType.UNIVERSAL_VARIABLE, 'foo');

            sinon.assert.calledOnce(uvEventsPushSpy);
            sinon.assert.calledWith(uvEventsPushSpy, {action: 'foo'});
        });

        it('logs a warning if universal_variable window object is not available', () => {
            delete mockWindow['universal_variable'];
            mockLogger.expects('warn').once().withArgs(sinon.match(/foo/));

            QubitProvider.trackEvent(EventType.UNIVERSAL_VARIABLE, 'foo');

            mockLogger.verify();
        });
    });

    describe('triggerExperiment', () => {

        beforeEach(() => {
            mockWindow['__qubit'].experiences.testExperiment = {
                trigger: sinon.stub(),
            };
        });

        it('throws an error if experiment is not an argument', () => {
            assert.throws(() => QubitProvider.triggerExperiment(), /experiment/);
        });

        it('throws an error if callback is not an argument', () => {
            assert.throws(() => QubitProvider.triggerExperiment('testExperiment'), /callback/);
        });

        it('fails gracefully if there is no matching experience in qubit', () => {
            assert.doesNotThrow(() => QubitProvider.triggerExperiment('DoesNotExistInQubit', () => {}));
        });

    });

    describe('getQubit', () => {
        it('returns qubit window object from the window if available', () => {
            assert.equal(QubitProvider.getQubit(), mockWindow['__qubit']);
        });

        it('returns undefined if the object is not available', () => {
            global.window = {};
            assert.equal(QubitProvider.getQubit(), undefined);
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
                QubitProvider.getQubitExperimentTrigger('foo'),
                mockWindow['__qubit'].experiences.foo.trigger
            );
        });

        it('returns null if the experiment trigger is not on the window', () => {
            assert.equal(QubitProvider.getQubitExperimentTrigger('bar'), null);
        });
    });

});
