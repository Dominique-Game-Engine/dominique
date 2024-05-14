precision highp float;

uniform float uDeltaTIme;

void main() {
    gl_FragColor = vec4(uDeltaTIme, 0.0, 1.0, 1.0);
}