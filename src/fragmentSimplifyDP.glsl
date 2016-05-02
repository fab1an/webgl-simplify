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
    vec3 point = texture2D(u_points, vec2(vUv.x, 0)).rgb;

    /* marker: -1   ignore point */
    /* marker: 0    calculate    */
    /* marker: 1    endpoint     */
    float marker = texture2D(u_chosen, vec2(vUv.x, 0)).r;

    //gl_FragColor = vec4(gl_FragCoord.x, data);

    if (marker < 0.5 && marker > -0.5) {
        vec2 refPointData = texture2D(u_refpoints, vec2(vUv.x, 0)).rg;
        vec3 p1 = texture2D(u_points, vec2(refPointData.r/seqLength, 0)).rgb;
        vec3 p2 = texture2D(u_points, vec2(refPointData.g/seqLength, 0)).rgb;
        float dist = sqSegDist(p1, p2, point);

        gl_FragColor = vec4(dist, 0, 0, 0);
    }
}