#version 410
#define M_PI 3.14159265358979323846

uniform mat4 mat_inverse;
uniform mat4 persp_inverse;
uniform sampler2D envMap;
uniform vec3 center;
uniform float radius;

const vec4 camera_coord = vec4(0.0, 10.0, 5.0, 0.0);
const vec4 light_coord = vec4(10.0, 10.0, 5.0, 0.0);


uniform bool transparent;
uniform float shininess;
uniform float eta;

in vec4 position;

out vec4 fragColor;


vec4 getColorFromEnvironment(in vec3 direction)
{
    // TODO
    return vec4(1);
}



bool raySphereIntersect(in vec3 start, in vec3 direction, out vec3 newPoint) {

    // equation of sphere p^2 - R^2 =0            where  P = (x,y,z)
    // p = o + t.D -C                           we have to find t
    // cp = O-C
    // (tD)^2 + 2t.D.CP + CP^2 - R^2 = 0
    vec3 CP = start - center;
    vec3 a = dot(direction, direction);
    vec3 b = 2*dot(direction,CP);
    vec3 c = dot(CP,CP) - (radius * radius);

    float disc = pow(b,2) - 4 * a * c;
    float t;


    if (disc > 0){
        float q;
        if (b < 0.0)
            q = (-b - sqrt(disc))/2.0;
        else
            q = (-b + sqrt(disc))/2.0;

        float t0 = q /a;
        float t1 = c / q;

        // make sure t0 is smaller than t1
        if (t0 > t1) {
            // if t0 is bigger than t1 swap them around
            float temp = t0;
            t0 = t1;
            t1 = temp;
        }

        // if t1 is less than zero, the object is in the ray's negative direction
        // and consequently the ray misses the sphere
        if (t1 < 0.0)
            return false;

        // if t0 is less than zero, the intersection point is at t1
        if (t0 < 0.0) {
            t = t1;
        } else {
            t = t0;
        }
    }

    else if(disc = 0){
        t = -0.5 * b/a;
    }

    else{
        return false;
    }

    newPoint = start + t * direction;
    return true;
}




void main(void)
{
    // Step 1: I need pixel coordinates. Division by w ?
    vec4 worldPos = position;
    worldPos.z = 1; // near clipping plane
    worldPos = persp_inverse * worldPos;
    worldPos /= worldPos.w;
    worldPos.w = 0;
    worldPos = normalize(worldPos);




    // Step 2: ray direction:
    vec3 u = normalize((mat_inverse * worldPos).xyz); // directions
    vec3 eye = (mat_inverse * vec4(0, 0, 0, 1)).xyz; // origin

    vec3 intersect_point;
    if(raySphereIntersect(eye, u, &intersect_point)){
        vec3 Nhit = normalize(intersect_point - center);




    }
    else{

    }




    // TODO


    vec4 resultColor = vec4(0,0,0,1);
    fragColor = resultColor;
}
