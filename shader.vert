#version 300 es

uniform mat4 invCamera;
uniform mat4 perspective;

layout(location=0) in vec4 vPosition;
layout(location=2) in vec3 vNormal;

out vec4 pos;
out vec3 norm;

void main() {
    pos = vPosition;
    norm = vNormal;
    gl_Position = perspective * vec4((invCamera * vPosition).xyz, -0.5);
}