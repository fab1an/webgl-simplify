import {Logger} from "util/logging/Logger";
import {points, simplified as simplifiedPoints} from "./simplifyTestData";
import _ from "lodash";
import * as orig from "./simplifyOrig";
import WebGLMultiSqSeqDist from "./WebGLMultiSqSeqDist";

const L = Logger.getLogger("index.js");

function compare(text, v1, v2, output = false) {
    L.info(text, _.isEqual(v1, v2))
    if (output) {
        L.info("v1", v1)
        L.info("v2", v2);
    }
}

const patched = new WebGLMultiSqSeqDist();

compare("test",
    orig.simplify(points.slice(0, 5), 5, true),
    patched.simplify(points.slice(0, 5), 25, true),
    true
);

compare("simplify",
    orig.simplify(points, 5, true),
    patched.simplify(points, 5, false)
);

const w = L.newStopwatch("test");
const n = 5;
w.newLap(`orig x${n}`);
for (let i = 0; i < n; i++) {
    orig.simplify(points, 5, true)
}

w.newLap(`patched x${n}`);
for (let i = 0; i < n; i++) {
    patched.simplify(points, 5, false)
}
w.printTimes();
