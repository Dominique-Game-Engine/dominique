attribute vec4 aVertexPosition;
attribute vec2 aUv;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vUv;

void main() {
    vUv = aUv;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

    // Trick to have the plane fullscreen
    //    gl_Position = vec4(aVertexPosition.x * 2.0,aVertexPosition.y * 2.0, aVertexPosition.z, aVertexPosition.w);
}