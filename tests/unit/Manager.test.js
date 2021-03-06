import Manager, {Manager as ManagerClass} from '~/src/Manager';
import sinon from 'sinon';
import assert from 'assert';
import EventEmitter from 'events';
import logger from '~/src/Helpers/Logger';
import cookies from 'js-cookie';
import CookieNames from '~/src/Helpers/CookieNames';
import {DefaultProvider as DefaultProviderClass} from '~/src/Providers/DefaultProvider';

describe('Manager', () => {

    let testManager, mockProvider, mockExperiment, mockLogger;

    beforeEach(() => {
        global.document = {cookie: ''};
        mockLogger = sinon.mock(logger);

        mockProvider = {
            triggerExperiment: sinon.stub().returns(0),
            trackEvent: sinon.spy(),
            getQubitExperimentTrigger: sinon.stub().returns(()=>{}),
            getAllQubitExperiments: sinon.stub().returns([]),
            print: sinon.spy(),
        };

        mockExperiment = new EventEmitter();
        mockExperiment.on = sinon.spy(mockExperiment, 'on');
        mockExperiment.removeListener = sinon.spy(mockExperiment, 'removeListener');
        mockExperiment.setGroup = sinon.spy();
        mockExperiment.getId = sinon.stub().returns('FROG');
        mockExperiment.setupTriggers = sinon.spy();
        mockExperiment.enroll = sinon.spy();

        testManager = Manager;
        testManager.setProvider(mockProvider);
    });

    afterEach(() => {
        mockLogger.restore();
    });

    describe('Initialisation', () => {
        it('should set the default provider on construction', () => {
            const manager = new ManagerClass();
            assert(manager.provider instanceof DefaultProviderClass);
        });

        it('should take a provider and store it', () => {
            assert.deepEqual(testManager.provider, mockProvider);
        });

        it('should add the manager to the window for browser access', () => {
            assert(window.canvass instanceof ManagerClass);
        })
    });

    describe('Experiment', () => {
        afterEach(() => {
            testManager.register = [];
        });

        it('should add an experiment to the registry', () => {
            testManager.addExperiment(mockExperiment);
            assert.deepEqual(testManager.register, {FROG: mockExperiment});
        });

        it('should enroll an experiment if triggers fired in a previous session', () => {
            testManager.triggeredExperiments = ['FROG'];
            testManager.addExperiment(mockExperiment);
            sinon.assert.calledOnce(mockExperiment.enroll);
        });

        it('should remove an experiment from the registry', () => {
            testManager.addExperiment(mockExperiment);
            testManager.removeExperiment('FROG');

            sinon.assert.calledOnce(mockExperiment.removeListener);
            assert.deepEqual(testManager.register, {});
        });

        it('should listen for experiment emitting enrolled', () => {
            testManager.addExperiment(mockExperiment);

            sinon.assert.called(mockExperiment.on);
            sinon.assert.calledWith(mockExperiment.on, 'ENROLLED');
        });

        it('should call activateExperiment when enrolled emitted', () => {
            let mockActivateExperiment = sinon.spy(testManager, 'activateExperiment');

            testManager.addExperiment(mockExperiment);
            mockExperiment.emit('ENROLLED');

            sinon.assert.calledOnce(mockActivateExperiment);
            sinon.assert.calledWith(mockActivateExperiment, 'FROG');
        });
    });

    describe('Triggered Experiments', () => {

        let mockCookies;

        beforeEach(() => {
            mockCookies = sinon.mock(cookies);

        });

        afterEach(() => {
            mockCookies.restore();

        });

        it('should be initialized from the cookie', () => {
            let triggeredExperiments = ['FROG'];
            let cookieValue = JSON.stringify(triggeredExperiments);
            mockCookies.expects('get').once().returns(cookieValue);

            let testManagerWithCookies = new ManagerClass();

            assert.deepEqual(testManagerWithCookies.triggeredExperiments, triggeredExperiments);
            mockCookies.verify();
        });

        it('should save an enrolled experiment to the cookie', () => {
            let triggeredExperiments = ['Example'];
            let cookieValue = JSON.stringify(triggeredExperiments);
            mockCookies.expects('set').once().withArgs(CookieNames.TRIGGERED_EXPERIMENTS, cookieValue);

            let testManagerWithCookies = new ManagerClass();
            testManagerWithCookies.saveTriggeredExperimentToCookie('Example');

            mockCookies.verify();
        });

        it('should not add an experiment to a cookie if it is already been saved', () => {
            // Set up the manager with a currently saved Foo and Bar experiment in the cookie
            let testManagerWithCookies = new ManagerClass();
            testManagerWithCookies.triggeredExperiments = ['Foo', 'Bar'];
            testManagerWithCookies.getTriggeredExperimentsFromCookie = sinon.stub().returns(['Foo', 'Bar']);
            mockCookies.expects('set').never();
            testManagerWithCookies.saveTriggeredExperimentToCookie('Foo');

            assert.deepEqual(testManagerWithCookies.triggeredExperiments, ['Foo', 'Bar']);
            mockCookies.verify();
        });

        it('should not overwrite existing triggered experiments when saving a new one', () => {
            // Set up the manager with a currently saved Foo and Bar experiment in the cookie
            let testManagerWithCookies = new ManagerClass();
            testManagerWithCookies.triggeredExperiments = ['Foo', 'Bar'];
            testManagerWithCookies.getTriggeredExperimentsFromCookie = sinon.stub().returns(['Foo', 'Bar']);
            mockCookies.expects('set').once().withArgs(CookieNames.TRIGGERED_EXPERIMENTS, JSON.stringify(['Foo', 'Bar', 'Zoo']));

            testManagerWithCookies.saveTriggeredExperimentToCookie('Zoo');

            assert.deepEqual(testManagerWithCookies.triggeredExperiments, ['Foo', 'Bar', 'Zoo']);
            mockCookies.verify();
        });
    });

    describe('ActiveExperiment', () => {

        let sandbox;
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('sets the group on the experiment via the provider', () => {
            testManager.addExperiment(mockExperiment);
            let mockGetExperiment = sinon.spy(testManager, 'getExperiment');
            testManager.activateExperiment('FROG');

            sinon.assert.calledOnce(mockGetExperiment);
            sinon.assert.calledWith(mockGetExperiment, 'FROG');

            sinon.assert.calledOnce(mockProvider.triggerExperiment);
            sinon.assert.calledWith(mockProvider.triggerExperiment, mockExperiment.getId(), sinon.match((value) => typeof value === 'function'));

            mockGetExperiment.restore();
            testManager.removeExperiment('FROG');
        });

        it('if preview mode is "all", force set group to 1', () => {
            const previewMode = 'all';
            const expectedGroup = 1;
            sandbox.stub(testManager.config, 'get').returns(previewMode);

            testManager.addExperiment(mockExperiment);
            testManager.activateExperiment('FROG');

            sinon.assert.calledOnce(mockExperiment.setGroup);
            sinon.assert.calledWith(mockExperiment.setGroup, expectedGroup);

            testManager.removeExperiment('FROG');
        });

        it('if preview mode is "none", force set group to 0', () => {
            const previewMode = 'none';
            const expectedGroup = 0;
            sandbox.stub(testManager.config, 'get').returns(previewMode);

            testManager.addExperiment(mockExperiment);
            testManager.activateExperiment('FROG');

            sinon.assert.calledOnce(mockExperiment.setGroup);
            sinon.assert.calledWith(mockExperiment.setGroup, expectedGroup);

            testManager.removeExperiment('FROG');
        });

        it('if preview mode is "custom", set group from config', () => {
            const previewMode = 'custom';
            const previewModeExperiments = {FROG: 3};
            const expectedGroup = 3;
            sandbox.stub(testManager.config, 'get').returns(previewMode);
            sandbox.stub(testManager.config, 'getPreviewModeExperiments').returns(previewModeExperiments);

            testManager.addExperiment(mockExperiment);
            testManager.activateExperiment('FROG');

            sinon.assert.calledOnce(mockExperiment.setGroup);
            sinon.assert.calledWith(mockExperiment.setGroup, expectedGroup);

            testManager.removeExperiment('FROG');
        });
    });

    describe('TrackEvent', () => {
        it('should call trackEvent on the provider', () => {
            testManager.trackEvent('foo', 'bar', 'value');

            sinon.assert.calledOnce(mockProvider.trackEvent);
            sinon.assert.calledWith(mockProvider.trackEvent, 'foo', 'bar', 'value');
        });
    });

    describe('PrintState', () => {
        it('should call table on the logger with the correct data', () => {
            mockExperiment.id = 'test id';
            mockExperiment.status = 'test status';
            mockExperiment.triggers = [{displayName: 'TestTrigger'}];
            mockExperiment.variants = {0: 'foo', 1: 'bar'};
            mockExperiment.group = '0';
            testManager.addExperiment(mockExperiment);
            mockLogger.expects('table').once().withExactArgs([{
                Experiment: mockExperiment.id,
                Status: mockExperiment.status,
                Triggers: 'TestTrigger',
                Variants: '0,1',
                Group: mockExperiment.group,
            }]);
            mockLogger.expects('info').once().withArgs('Preview Mode: "off"');

            testManager.printState();

            mockLogger.verify();
        });

        it('should call the providers print function for more info', () => {
            testManager.printState();
            sinon.assert.calledOnce(mockProvider.print);
        });

    });

});
