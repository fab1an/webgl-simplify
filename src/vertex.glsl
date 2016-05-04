varying vec2 vUv;
attribute vec2 point;
attribute vec2 p1;
attribute vec2 p2;
attribute float chosen;

void main() {
    vUv = uv;
    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(position, 1.0);
}
