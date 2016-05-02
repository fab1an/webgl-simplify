import {Logger} from "util/logging/Logger";
import {points as testData1} from "./simplifyTestData";
import _ from "lodash";
import * as orig from "./simplifyOrig";
import WebGLMultiSqSeqDist from "./WebGLMultiSqSeqDist";

const L = Logger.getLogger("index.js");
const patched = new WebGLMultiSqSeqDist();

function compare(text, v1, v2, output = false) {
    L.info(text, _.isEqual(v1, v2))
    if (output) {
        L.info("v1", v1)
        L.info("v2", v2);
    }
}

/* long points */
let points = testData1;


// patched.simplify(points.slice(0,5), 5, true)
// throw "";

//points = eval(require("raw!./test2.json"));
const n = 5;
L.info("points.length", points.length)

let pointsOrig, pointsMine;

const w = L.newStopwatch("test");

w.newLap(`orig x${n}`);
for (let i = 0; i < n; i++) {
    pointsOrig = orig.simplify(points, 5, true)
}

w.newLap(`patched x${n}`);
for (let i = 0; i < n; i++) {
    pointsMine = patched.simplify(points, 5, false)
}
w.printTimes();

compare("test",
    pointsOrig,
    pointsMine,
    true
);
