import Registry from '../../../src/Registry/Registry';
import sinon from 'sinon';

describe('Registry Integration', () => {
    let registry;

    beforeEach(() => {
        registry = new Registry();
    });

    describe('Experiment', () => {
        it('Should subscribe to experiments when they are added', () => {
            let mockExperiment = {
                getId: sinon.stub().returns('1'),
                subscribe: sinon.spy(),
            };

            registry.addExperiment(mockExperiment);
            sinon.assert.calledOnce(mockExperiment.subscribe);
            sinon.assert.calledWith(mockExperiment.subscribe, registry);
        });
    });
});
