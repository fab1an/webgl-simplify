import {checkState} from "../Preconditions";
import _ from "lodash";

export default class Stopwatch {
    constructor(actionName, logger) {
        this._actionName = actionName;
        this._logger = logger;
        this._laps = [];
        this._watchStart = performance.now();
    }

    newLap(name) {
        checkState(!exists(this._watchEnd), "watch already ended");
        this._laps.push({
            start: performance.now(),
            name
        })
    }

    stop() {
        if (!exists(this._watchEnd)) {
            this._watchEnd = performance.now();
        }
    }

    printOverThreshold(threshold, fn) {
        this.stop();
        if ((this._watchEnd - this._watchStart) > threshold) {
            fn && fn();
            this.printTimes();
        }
    }

    printTimes() {
        this.stop();
        let message = `${this._actionName} took ${(this._watchEnd - this._watchStart).toFixed()} ms`;

        this._laps.forEach((lap, index) => {
            let lapEnd = this._watchEnd;
            if ((index + 1) < this._laps.length) {
                lapEnd = this._laps[index + 1].start;
            }
            const lapTime = lapEnd - lap.start;
            message += `\n . ${_.padEnd(lap.name, 50)} ${_.padStart(lapTime.toFixed(), 10)} ms`;

        });

        this._logger.info(message);
    }
}

