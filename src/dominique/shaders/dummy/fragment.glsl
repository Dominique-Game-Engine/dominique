precision highp float;

uniform float uDeltaTime;
uniform float uElapsedTime;
uniform float uMouseX;
uniform float uMouseY;

varying vec2 vUv;

float ringSmoothSDF(vec2 p, vec2 center, float radius, float innerRadius, float smoothness, float innerSmoothness) {
    float d = distance(p, center);
    float f = smoothstep(radius, radius + smoothness, d);
    float f2 = smoothstep(innerRadius, innerRadius + innerSmoothness, d);
    return f2 - f;
}

float circleSmoothSDF(vec2 p, vec2 center, float radius, float smoothness) {
    float d = distance(p, center);
    float f = smoothstep(radius, radius + smoothness, d);
    return 1.0 - f;
}

float radialGradient(vec2 p, vec2 center, float radius) {
    float d = distance(p, center);
    return 1.0 - smoothstep(-radius, radius, d);
}

vec3 rgbFromRGB(int r, int g, int b) {
    return vec3(float(r) / 255.0, float(g) / 255.0, float(b) / 255.0);
}

float lerp(float a, float b, float t) {
    return a + t * (b - a);
}

// TODO add parameters to adjust falloff
float easeOutElastic(float x) {
    float c4 = (2.0 * 3.14) / 3.0;
    return pow(2.0, -10.0 * x) * sin((x * 10.0 - 10.75) * c4) + 1.0;
}

float tweenWithWobble(float from, float to, float time, float duration) {
    return lerp(from, to, easeOutElastic(clamp(time / duration, 0.0, 1.0)));
}

void main() {
    // TODO pass this as vec2 from uniforms, right now my uniforms only support floats
    vec2 mousePos = vec2(uMouseX, uMouseY);

    float movementAmmount = 0.01;
    float parallaxAmmount = 0.005;

    float animDuration = 2.0;
    float animSpeed = 0.5;

    vec3 skyColor = vec3(0.145, 0.66, 0.93);
    vec3 centerColor = vec3(0.03, 0.13, 0.21);
    vec3 cColorDark = rgbFromRGB(190, 27, 14);
    vec3 cColor = rgbFromRGB(255, 151, 9);

    const int circlesAmmount = 5;
    vec2 cCenter = vec2(0.5);
    float cRadius = 0.08;
    float circlesWidth = tweenWithWobble(0.1, 0.035, uElapsedTime, animDuration);
    float cInnerRadius = cRadius - circlesWidth;
    float cSmoothness = 0.001;
    float cSmoothnessInner = 1.10 * circlesWidth;

    float circlesDiff = circlesWidth - 0.01;

    vec3 color = skyColor;

    float centerCircle = circleSmoothSDF(vUv, cCenter, cRadius + 0.01, cSmoothness);
    float centerCircleGradient = radialGradient(vUv, cCenter, 0.07);
    color = mix(color, centerColor, centerCircle * (1.0 - centerCircleGradient));

    for (int i = 0; i < circlesAmmount; i++) {
        float diff =  float(i) * circlesDiff;
        vec2 center = cCenter + mousePos * parallaxAmmount * float(i + 1);
        float c1 = ringSmoothSDF(vUv, center, cRadius + diff, cInnerRadius + diff, cSmoothness, cSmoothness);
        float c2 = ringSmoothSDF(vUv, center, cRadius + diff, cInnerRadius + diff, cSmoothness, cSmoothnessInner);
        vec3 c1Color = mix(cColor, cColorDark, c2);
        color = mix(color, c1Color, c1);
    }


    gl_FragColor = vec4(color, 1.0);
    //    gl_FragColor = vec4(f, 0.0, 0.0, 1.0);
}