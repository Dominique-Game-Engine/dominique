precision highp float;

uniform float uDeltaTime;
uniform float uElapsedTime;

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(sin(uElapsedTime * 20.0), 0.0, 1.0, 1.0);
    float x = step(0.5, vUv.y);
    //    vec3 color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), x);
    //    gl_FragColor = vec4(color, 1.0);
    gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
}