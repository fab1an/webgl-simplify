uniform sampler2D u_points;
uniform sampler2D u_chosen;
uniform sampler2D u_refpoints;
uniform float seqLength;
varying vec2 vUv;

float sqSegDist(vec3 p1, vec3 p2, vec3 p) {
    vec3 b = p2 - p1;

    float top = length(cross(p - p1, b));
    float bottom = length(b);

    return pow(top / bottom, 2.0);
}

void main() {
    vec4 data = texture2D(u_points, vec2(vUv.x, 0));
    vec4 refPoint = texture2D(u_refpoints, vec2(vUv.x, 0.0));

    vec3 point = data.rgb;
    float marker = data.a;

    float dist = sqSegDist(vec3(refPoint.rg, 0), vec3(refPoint.ba, 0), point);
    gl_FragColor = vec4(dist, 0, 0, marker);
}