import {Logger} from "util/logging/Logger";
import {points, simplified as simplifiedPoints} from "./simplifyTestData";
import _ from "lodash";
import * as orig from "./simplifyOrig";
import * as patched from "./simplifyPatched";

const L = Logger.getLogger("index.js");

function compare(text, v1, v2) {
    L.info(text, _.isEqual(v1, v2))
  //  L.info("v1", v1)
//    L.info("v2", v2);
}

compare("sqDist",
    orig.getSqDist(points[0], points[1]).toFixed(4),
    patched.getSqDist(points[0], points[1]).toFixed(4)
);

// orig.test(points, 0, 10, 25, []);
patched.getMultiSqSegDist(points, 0, 5, 25, true);
patched.getMultiSqSegDist(points, 0, 3, 25, true);

// throw "";

for (let i = 0; i < 10; i++) {
    orig.simplify(points, 5, true)
    patched.simplify(points, 5, true)
}

const w = L.newStopwatch("test");
w.newLap("orig x10")
for (let i = 0; i < 10; i++) {
    orig.simplify(points, 5, true)
}
w.newLap("patched x10")
for (let i = 0; i < 10; i++) {
    patched.simplify(points, 5, true)
}
w.printTimes();

compare("simplify",
    orig.simplify(points, 5, true),
    patched.simplify(points, 5, true)
);
