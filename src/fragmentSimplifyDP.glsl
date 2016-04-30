uniform sampler2D u_sourceData;

uniform vec3 p1;
uniform vec3 p2;
uniform int seqLength;

varying vec2 vUv;

float sqSegDist(vec3 p1, vec3 p2, vec3 p) {
    vec3 b = p2 - p1;

    float top = length(cross(p - p1, b));
    float bottom = length(b);

    return pow(top / bottom, 2.0);
}

void main() {
    int first = 0;
    int last = seqLength - 1;
    int index = first + 1;



    for (int i = 0; i < seqLength; i++) {
        if (i==myIndex) {
            myVal = myArray[i];
            break;
        }
    }

    vec3 p = texture2D(u_sourceData, vec2(vUv.x, 0)).rgb;

    vec3 b = p2 - p1;

    float top = length(cross(p - p1, b));
    float bottom = length(b);
    gl_FragColor = vec4(pow(top / bottom, 2.0),0,0,0);
    //gl_FragColor = vec4(p,vUv.x);
}