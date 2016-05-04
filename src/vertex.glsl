attribute vec3 point;
attribute vec3 p1;
attribute vec3 p2;
attribute float idxP;

varying float idx;
varying float dist;

float sqSegDist(vec3 p1, vec3 p2, vec3 p) {
    vec3 b = p2 - p1;

    float top = length(cross(p - p1, b));
    float bottom = length(b);

    return pow(top / bottom, 2.0);
}

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    idx = idxP;
    dist = sqSegDist(p1, p2, point);

    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * mvPosition;
}
