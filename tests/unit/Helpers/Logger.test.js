import sinon from 'sinon';
import assert from 'assert';
import singleLogger, {Logger, LEVEL as LoggerOutputLevels} from '~/src/Helpers/Logger';

describe('Logger', () => {

    let mockLogger, testingLogger;

    beforeEach(() => {
        mockLogger = {
            error: sinon.spy(),
            warn: sinon.spy(),
            info: sinon.spy(),
            log: sinon.spy(),
            debug: sinon.spy(),
            table: sinon.spy(),
        };

        testingLogger = new Logger(mockLogger);
    });

    describe('Constructor', () => {
        it('should set defaults if no constructor args given', () => {
            let logger = new Logger();
            assert.equal(logger.logger, console);
            assert.equal(logger.outputLevel, LoggerOutputLevels.WARN);
        });

        it('should set the outputLevel correctly on constructor', () => {
            let logger = new Logger(console, LoggerOutputLevels.INFO);
            assert.equal(logger.outputLevel, LoggerOutputLevels.INFO);
        });
    });

    describe('FormatMessages', () => {
        it('should correctly add a prefix', () => {
            let message = 'test message';
            let result = testingLogger.formatMessages([message]);

            assert.deepEqual(result, ['[canvass]', message]);
        });

        it('should not add a prefix if no messages were supplied', () => {
            let result = testingLogger.formatMessages([]);

            assert.deepEqual(result, []);
        });
    });

    describe('Logger', () => {
        it('should call the loggers error method when calling error', () => {
            let testMessage = 'test error message';
            let testError = new Error(testMessage);
            testingLogger.error(testMessage, testError);

            sinon.assert.calledOnce(mockLogger.error);
            sinon.assert.calledWith(mockLogger.error, '[canvass]', testMessage, testError);
        });

        it('should call the loggers warn method when calling warn', () => {
            let testMessage = 'test warn message';
            testingLogger.warn(testMessage);

            sinon.assert.calledOnce(mockLogger.warn);
            sinon.assert.calledWith(mockLogger.warn, '[canvass]', testMessage);
        });

        it('should call the loggers info method when calling info', () => {
            let testMessage = 'test info message';
            testingLogger.info(testMessage);

            sinon.assert.calledOnce(mockLogger.info);
            sinon.assert.calledWith(mockLogger.info, '[canvass]', testMessage);
        });

        it('should call the loggers debug method when calling debug if debug level is set', () => {
            testingLogger.setOutputLevel(LoggerOutputLevels.DEBUG);
            let testMessage = 'test debug message';

            testingLogger.debug(testMessage);

            sinon.assert.calledOnce(mockLogger.debug);
            sinon.assert.calledWith(mockLogger.debug, '[canvass]', testMessage);
        });

        it('should not call the loggers debug method when calling debug if debug level is not set', () => {
            testingLogger.setOutputLevel(LoggerOutputLevels.WARN);
            let testMessage = 'test debug message';

            testingLogger.debug(testMessage);

            sinon.assert.notCalled(mockLogger.debug);
        });

        it('should call the log method if a debug method does not exist', () => {
            mockLogger = {
                error: sinon.spy(),
                warn: sinon.spy(),
                info: sinon.spy(),
                log: sinon.spy(),
            };
            testingLogger = new Logger(mockLogger, LoggerOutputLevels.DEBUG);
            let testMessage = 'test debug message';

            testingLogger.debug(testMessage);

            sinon.assert.calledOnce(mockLogger.log);
            sinon.assert.calledWith(mockLogger.log, '[canvass]', testMessage);
        });

        it('should call the loggers table method when calling table', () => {
            let testData = {message: 'test table message'};
            testingLogger.table(testData);

            sinon.assert.calledOnce(mockLogger.table);
            sinon.assert.calledWith(mockLogger.table, testData);
        });

        it('should call the log method if a table method does not exist', () => {
            mockLogger = {
                error: sinon.spy(),
                warn: sinon.spy(),
                info: sinon.spy(),
                log: sinon.spy(),
            };
            testingLogger = new Logger(mockLogger);

            let testData = {message: 'test table message'};
            testingLogger.table(testData);

            sinon.assert.calledOnce(mockLogger.log);
            sinon.assert.calledWith(mockLogger.log, testData);
        });
    });

    it('should use the logger passed in using setLogger', () => {
        assert.notEqual(singleLogger.logger, mockLogger);
        singleLogger.setLogger(mockLogger);
        assert.equal(singleLogger.logger, mockLogger);
    });

});
