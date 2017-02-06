import sinon from 'sinon';
import assert from 'assert';
import QubitHelper from '~/src/Helpers/QubitHelper';

describe('QubitHelper', () => {

    let mockWindow;

    beforeEach(() => {
        global.window = {
            __qubit: {
                experiences: [],
            },
        };

        mockWindow = global.window;
    });

    afterEach(() => {
        delete global.window;
    });

    describe('trackAction', () => {
        it('calls callback', () => {
            let callback = sinon.spy();
            QubitHelper.trackAction('action', callback);

            sinon.assert.calledOnce(callback);
        });

        it('does not break when there is no callback', () => {
            QubitHelper.trackAction('action');
        });

        it('throws an error if action is not an argument', () => {
            assert.throws(() => QubitHelper.trackAction(), /action/);
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
            QubitHelper.triggerExperiment('DoesNotExistInQubit', () => {});
            //assert.doesNotThrow(() => QubitHelper.triggerExperiment('DoesNotExistInQubit', () => {}));
        });

    });

    describe('qubitExists', () => {
        it('returns true if qubit is available on the window', () => {
            assert.equal(QubitHelper.qubitExists(), true);
        });

        it('returns false if qubit is available on the window', () => {
            global.window = {};
            assert.equal(QubitHelper.qubitExists(), false);
        });
    });

    describe('experimentExists', () => {
        beforeEach(() => {
            mockWindow['__qubit'].experiences.foo = {
                trigger: sinon.stub(),
            };
        });

        it('returns true if the experiment and trigger is initialized on the window', () => {
            assert.equal(QubitHelper.experimentExists('foo'), true);
        });

        it('returns false if the experiment is not on the window', () => {
            assert.equal(QubitHelper.experimentExists('bar'), false);
        });
    });

});
