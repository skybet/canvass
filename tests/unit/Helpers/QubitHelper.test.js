import QubitHelper from '~/src/Helpers/QubitHelper';
import sinon from 'sinon';
import assert from 'assert';

describe('QubitHelper', () => {

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
            assert.throws(QubitHelper.trackAction, /action/);
        });
    });

    describe('triggerExperiment', () => {
        it('calls callback', () => {
            let callback = sinon.spy();
            QubitHelper.triggerExperiment('experiment', callback);

            sinon.assert.calledOnce(callback);
        });

        it('does not break when there is no callback', () => {
            QubitHelper.triggerExperiment('experiment');
        });

        it('calls callback with variant id', () => {
            let callback = sinon.spy();
            QubitHelper.triggerExperiment('experiment', callback);

            sinon.assert.calledWith(callback, 0);
        });

        it('should return the variant id', () => {
            let variant = QubitHelper.triggerExperiment('experiment');
            assert.equal(0, variant);
        });

        it('throws an error if experiment is not an argument', () => {
            assert.throws(QubitHelper.triggerExperiment, /experiment/);
        });
    });

});
