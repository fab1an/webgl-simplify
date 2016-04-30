import {Logger} from "util/logging/Logger";
import WebGLSqDist from "./WebGLSqDist";
import WebGLMultiSqSeqDist from "./WebGLMultiSqSeqDist";
import _ from "lodash";

const L = Logger.getLogger("simplifyPatched.js");

const webGLSqDist = new WebGLSqDist();
const multiSqSegDist = new WebGLMultiSqSeqDist();

// square distance between 2 points
export function getSqDist(p1, p2) {
    return webGLSqDist.getSqDist(p1, p2);
}

// square distance from a point to a segment
export function getSqSegDist(p, p1, p2) {
    return multiSqSegDist.getSqSegDist(p, p1, p2);
}

export function getMultiSqSegDist(p1, p2, points, sqT, debug) {
    return multiSqSegDist.getMultiSqSegDist(p1, p2, points, sqT, debug);
}

function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        point;

    for (var i = 1, len = points.length; i < len; i++) {
        point = points[i];

        if (getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== point) newPoints.push(point);

    return newPoints;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    let index = multiSqSegDist.getMultiSqSegDist(points, first, last, sqTolerance);
    if (index !== -1) {
        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
}

function simplifyDPStep2(points, first, last, sqTolerance, simplified) {
    let index = multiSqSegDist.getMultiSqSegDist(points, first, last, sqTolerance);
    if (index !== -1) {
        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
}

// simplification using Ramer-Douglas-Peucker algorithm

function simplifyDouglasPeucker(points, sqTolerance) {
    var last = points.length - 1;

    var simplified = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
}

// both algorithms combined for awesome performance
export function simplify(points, tolerance, highestQuality) {

    if (points.length <= 2) return points;

    var sqTolerance = !_.isUndefined(tolerance) ? tolerance * tolerance : 1;

    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);

    return points;
}
