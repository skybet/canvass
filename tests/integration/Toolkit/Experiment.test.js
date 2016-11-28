import Experiment from '../../../src/Toolkit/Experiment';
import sinon from 'sinon';

describe('Experiment Integration', () => {
    describe('notify', () => {
        it('should integration with observers and triggers when notified', () => {
            let mockTriggers = [
                {
                    hasTriggered: sinon.stub().returns(true),
                },
            ];

            let mockObserver = {
                notify: sinon.spy(),
            };

            let experiment = new Experiment('1', mockTriggers, []);
            experiment.subscribe(mockObserver);
            experiment.notify();

            sinon.assert.calledOnce(mockTriggers[0].hasTriggered);

            sinon.assert.calledOnce(mockObserver.notify);
            sinon.assert.calledWith(mockObserver.notify, '1');
        });

        it('should not emit a change if not all the triggers have fired', () => {
            let mockTriggers = [
                {
                    hasTriggered: sinon.stub().returns(false),
                },
            ];

            let mockObserver = {
                notify: sinon.spy(),
            };

            let experiment = new Experiment('1', mockTriggers, []);
            experiment.subscribe(mockObserver);
            experiment.notify();

            sinon.assert.calledOnce(mockTriggers[0].hasTriggered);

            sinon.assert.notCalled(mockObserver.notify);
        });

        it('should not make any calls with the experiment is already active', () => {
            let mockTriggers = [
                {
                    hasTriggered: sinon.stub().returns(true),
                },
            ];

            let mockObserver = {
                notify: sinon.spy(),
            };

            let experiment = new Experiment('1', mockTriggers, []);
            experiment.status = Experiment.Status.ACTIVE;
            experiment.subscribe(mockObserver);
            experiment.notify();

            sinon.assert.notCalled(mockTriggers[0].hasTriggered);
            sinon.assert.notCalled(mockObserver.notify);
        });
    });

    describe('setGroup', () => {
        it('should emit to subscribers when the group is updated', () => {
            let mockTriggers = ['asdf'];
            let mockObserver = {
                notify: sinon.spy(),
            };

            let experiment = new Experiment('1', mockTriggers, []);
            experiment.status = Experiment.Status.TRIGGERED;
            experiment.subscribe(mockObserver);
            experiment.setGroup('TOAD');

            sinon.assert.calledOnce(mockObserver.notify);
        });
    });
});

