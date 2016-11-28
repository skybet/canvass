import Experiment from '../../../src/Toolkit/Experiment';
import sinon from 'sinon';

describe('Experiment Integration', () => {
    describe('notify', () => {
        it('should integrate with observers and triggers when notified', () => {
            let mockTriggers = [
                {
                    hasTriggered: sinon.stub().returns(true),
                },
            ];

            let mockListener = sinon.spy();

            let experiment = new Experiment('1', mockTriggers, []);
            experiment.on(Experiment.Status.ENROLLED, mockListener);
            experiment.enrollIfTriggered();

            sinon.assert.calledOnce(mockTriggers[0].hasTriggered);
            sinon.assert.calledOnce(mockListener);
        });

        it('should not emit a change if not all the triggers have fired', () => {
            let mockTriggers = [
                {
                    hasTriggered: sinon.stub().returns(false),
                },
            ];

            let mockListener = sinon.spy();

            let experiment = new Experiment('1', mockTriggers, []);
            experiment.on(Experiment.Status.ENROLLED, mockListener);
            experiment.enrollIfTriggered();

            sinon.assert.calledOnce(mockTriggers[0].hasTriggered);
            sinon.assert.notCalled(mockListener);
        });

        it('should not make any calls with the experiment is already active', () => {
            let mockTriggers = [
                {
                    hasTriggered: sinon.stub().returns(true),
                },
            ];

            let mockListener = sinon.spy();

            let experiment = new Experiment('1', mockTriggers, []);
            experiment.status = Experiment.Status.ACTIVE;
            experiment.on(Experiment.Status.ENROLLED, mockListener);
            experiment.enrollIfTriggered();

            sinon.assert.notCalled(mockTriggers[0].hasTriggered);
            sinon.assert.notCalled(mockListener);
        });
    });

    describe('setGroup', () => {
        it('should emit to listeners when the group is updated', () => {
            let mockTriggers = ['asdf'];
            let mockListener = sinon.spy();

            let experiment = new Experiment('1', mockTriggers, []);
            experiment.status = 'ENROLLED';
            experiment.on(Experiment.Status.ACTIVE, mockListener);
            experiment.setGroup('TOAD');

            sinon.assert.calledOnce(mockListener);
        });
    });
});
