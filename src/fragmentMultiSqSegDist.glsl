uniform sampler2D u_sourceData;

uniform vec3 p1;
uniform vec3 p2;
varying vec2 vUv;

void main() {
    vec3 p = texture2D(u_sourceData, vec2(vUv.x,0)).rgb;

    vec3 b = p2 - p1;

    float top = length(cross(p - p1, b));
    float bottom = length(b);
    gl_FragColor = vec4(pow(top / bottom, 2.0),0,0,0);
    //gl_FragColor = vec4(p,vUv.x);
}