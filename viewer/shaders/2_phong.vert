#version 410

uniform mat4 matrix;
uniform mat4 perspective;
uniform mat3 normalMatrix;
uniform bool noColor;
uniform vec3 lightPosition;

const vec4 camera_coord = vec4(0.0, 10.0, 5.0, 0.0);
const vec4 light_coord = vec4(10.0, 10.0, 5.0, 0.0);

// World coordinates
in vec4 vertex;
in vec4 normal;
in vec4 color;

// Camera-space coordinates
out vec4 eyeVector;
out vec4 lightVector;
out vec4 lightSpace; // placeholder for shadow mapping
out vec4 vertColor;
out vec4 vertNormal;

void main( void )
{
    if (noColor) vertColor = vec4(0.2, 0.6, 0.7, 1.0 );
    else vertColor = color;
    vertNormal.xyz = normalize(normalMatrix * normal.xyz);
    vertNormal.w = 0.0;

    eyeVector.xyz = normalize(light_coord.xyz-vertex.xyz);
    eyeVector.w = 0.0;

    lightVector.xyz = normalize(camera_coord.xyz - vertex.xyz);  //what are coordinates of camera and light
    lightVector.w = 0.0;

    gl_Position = perspective * matrix * vertex;
}
