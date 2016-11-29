import EventEmitter from 'events';
import sinon from 'sinon';
import assert from 'assert';
import Experiment from '~/src/Experiment';
import Registry from '~/src/Registry';
import Manager from '~/src/Manager';

describe('State Engine (Experiment, Registry, Manager)', () => {
    let registry, manager, experiment, mockHelper, mockTriggers, mockVariants;

    beforeEach(() => {
        mockVariants = {
            frog: 'Variant FROG',
            tadpole: 'Variant TADPOLE',
        };

        let mockTrigger = new EventEmitter();
        mockTrigger.hasTriggered = sinon.stub().returns(true);
        mockTriggers = [mockTrigger];

        mockHelper = {
            triggerExperiment: sinon.stub().returns('tadpole'),
        };

        experiment = new Experiment('POTATO', mockTriggers, mockVariants);
        registry = new Registry();
        manager = new Manager(registry, mockHelper);

        manager.addExperiment(experiment);
    });

    it('should initialise with the correct state', () => {
        assert.deepEqual(registry.register, {POTATO: experiment});
        assert.equal(experiment.status, Experiment.Status.WAITING);
        assert.equal(experiment.group, undefined);
    });

    it('should return the correct variant when activated', () => {
        mockTriggers[0].emit('TRIGGERED');
        assert.equal(experiment.status, Experiment.Status.ACTIVE);
        assert.equal(experiment.group, 'tadpole');
        assert.equal(experiment.getVariant(), mockVariants.tadpole);
    });
});

