import Stopwatch from "./Stopwatch"
import ConsoleAppender from "./ConsoleAppender"
import WSAppender from "./WSAppender"
import _ from "lodash"

const appenders = [new ConsoleAppender()]

export class Logger {
    constructor(tag) {
        this._tag = tag;
        this._isEnabled = true;
    }

    static getLogger(tag) {
        return new Logger(tag);
    }

    logException(err) {
        let logger = this;
        if (_.isObject(err) && exists(err.origin)) {
            logger = Logger.getLogger(err.origin)
        }
        err.args = get(err.args, [])
        err.stack = get(err.stack, new Error().stack);
        logger.error(...err.args, "\n", err.stack);
    }

    setEnabled(enabled) {
        this._isEnabled = enabled;
    }

    info(...args) {
        if (this._isEnabled) {
            appenders.forEach(app => app.output(this._tag, false, ...args))
        }
    }

    error(...args) {
        if (window.LOGGER_ENABLED) {
            appenders.forEach(app => app.output(this._tag, true, ...args))
        }
    }

    newStopwatch(name) {
        return new Stopwatch(name, this);
    }
}

export function logToWebSocket(url) {
    appenders.push(new WSAppender(`ws://${url}`));
}
