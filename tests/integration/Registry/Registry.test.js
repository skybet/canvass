import Registry from '../../../src/Registry/Registry';
import Experiment from '../../../src/Toolkit/Experiment';

import sinon from 'sinon';

describe('Registry Integration', () => {
    let registry;

    beforeEach(() => {
        registry = new Registry({});
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

    it('Should trigger the experiment via the helper and update the experiment', () => {
        let testData = [
            {experimentId: 'frog', group: 'toad'},
            {experimentId: 'badger', group: 'weasel'},
        ];

        testData.forEach((data) => {
            let experimentId = data.experimentId;
            let group = data.groupId;

            let mockHelper = {
                triggerExperiment: sinon.stub().returns(group),
            };

            let mockExperiment = {
                setGroup: sinon.spy(),
                subscribe: sinon.spy(),
                getId: sinon.stub().returns(experimentId),
                getStatus: sinon.stub().returns(Experiment.Status.TRIGGERED),
            };

            registry = new Registry(mockHelper);
            registry.addExperiment(mockExperiment);
            registry.notify(experimentId);

            sinon.assert.calledOnce(mockHelper.triggerExperiment);
            sinon.assert.calledWith(mockHelper.triggerExperiment, experimentId);

            sinon.assert.calledOnce(mockExperiment.setGroup);
            sinon.assert.calledWith(mockExperiment.setGroup, group);
        });
    });
});
