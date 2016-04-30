uniform sampler2D u_sourceData;

varying vec2 vUv;

void main() {
//    vec3 col = texture2D(u_sourceData, vUv).rgb;

    vec2 x = texture2D(u_sourceData, vUv).rg;
    vec2 y = texture2D(u_sourceData, vUv).ba;

    float lenX = length(x);
    float lenY = length(y);
    float len = lenY - lenX;

    float x1 = texture2D(u_sourceData, vUv).r;
    float y1 = texture2D(u_sourceData, vUv).g;
    float x2 = texture2D(u_sourceData, vUv).b;
    float y2 = texture2D(u_sourceData, vUv).a;

    float second = pow(x1-x2, 2.0) + pow(y1-y2, 2.0);
    gl_FragColor = vec4(pow(length(x-y), 2.00),lenX,lenY,second);

   // gl_FragColor = vec4(0,0,0,0);
}