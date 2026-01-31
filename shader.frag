#version 300 es

precision highp float;

uniform vec2 res;

layout(location=0) out vec4 gls_FragColor;
in vec4 pos;
in vec3 norm;

void main() {
    // if (pos.z > 0.0) discard;
    
    gls_FragColor = abs(vec4(gl_FragCoord.xy / res, 0.0, 1.0));

    gls_FragColor = vec4(norm.xyz, 1.0);

    // gls_FragColor += vec4(1.0 - length(pos));
}