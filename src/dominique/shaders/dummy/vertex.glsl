attribute vec4 aVertexPosition;
attribute vec2 aUv;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vUv;

void main() {
    vUv = aUv;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}