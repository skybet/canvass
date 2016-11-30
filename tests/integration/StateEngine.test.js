import EventEmitter from 'events';
import sinon from 'sinon';
import assert from 'assert';
import Experiment from '~/src/Experiment';
import Manager from '~/src/Manager';

describe('State Engine (Experiment, Registry, Manager)', () => {
    let experiment, mockHelper, mockTriggers, mockVariants;

    beforeEach(() => {
        mockVariants = {
            frog: 'Variant FROG',
            tadpole: 'Variant TADPOLE',
        };

        let mockTrigger = new EventEmitter();
        mockTrigger.isTriggered = sinon.stub().returns(true);
        mockTriggers = [mockTrigger];

        mockHelper = {
            triggerExperiment: sinon.stub().returns('tadpole'),
        };

        experiment = new Experiment('POTATO', mockTriggers, mockVariants);
        Manager.setHelper(mockHelper);

        Manager.addExperiment(experiment);
    });

    afterEach(() => {
        Manager.removeExperiment('POTATO');
    });

    it('should initialise with the correct state', () => {
        assert.deepEqual(Manager.register, {POTATO: experiment});
        assert.equal(experiment.status, Experiment.Status.WAITING);
        assert.equal(experiment.group, undefined);
    });

    it('should return the correct variant when activated', () => {
        let mockActiveListener = sinon.spy();
        experiment.on('ACTIVE', mockActiveListener);

        mockTriggers[0].emit('TRIGGERED');
        assert.equal(experiment.status, Experiment.Status.ACTIVE);
        assert.equal(experiment.group, 'tadpole');
        assert.equal(experiment.getVariant(), mockVariants.tadpole);

        sinon.assert.calledOnce(mockActiveListener);
    });
});

