#version 410
#define M_PI 3.14159265358979323846
#define BOUNCES 4
#define air 1.00
#define glass 2.00
#define MAX_BUFFER 228

uniform mat4 mat_inverse;
uniform mat4 persp_inverse;
uniform sampler2D envMap;
uniform vec3 center;
uniform float radius;
uniform bool sphere;

uniform bool transparent;
uniform float shininess;
uniform float eta;

in vec4 position;
out vec4 fragColor;

struct Ray // user defined structure.
{
  vec3 direction;
  float fresnel;
  vec3 point;
  vec4 colour;
  bool valid;
};


//
float FresnelReflectAmount ( float n1, float n2, vec3 normal, vec3 incident)
{
        // Schlick aproximation
        normal = normalize(normal);
        incident = normalize(incident);
        float r0 = (n1-n2) / (n1+n2);
        r0 *= r0;
        float cosX = -dot(normal, incident);
        float x = 1.0-cosX;
        float ret = r0+(1.0-r0)*x*x*x*x*x;

        // adjust reflect multiplier for object reflectivity
       ret = (eta + (1.0-eta) * ret);
        return ret;
}


bool raySphereIntersect(in vec3 start, in vec3 direction, out vec3 newPoint, float radius) {

    direction = normalize(direction);
    vec3 L =  center - start;
    float tca = dot(L, direction);

    // if (tca < 0 )
    //   return false;

    float d2 = dot(L,L) - tca*tca;
    if (d2 > radius*radius)
    return false;
    float thc = sqrt (radius*radius - d2);
    float t0 = tca - thc;
    float t1 = tca + thc;
    float temp;
    if (t0> t1)
    {
      temp = t1;
      t1 = t0;
      t0 = t1;
    }

   if (t0 < 0) {
    t0 = t1; // if t0 is negative, let's use t1 instead
    if (t0 < 0) return false; // both t0 and t1 are negative
    }

    newPoint = start + t0*direction;

    return true;

}

vec4 getColorFromEnvironment(in vec3 direction)
{
    // TODO

    float phi= acos(direction.z /length(direction))/M_PI; // secid param
    float theta = atan(direction.y, direction.x)/ (2*M_PI) + 0.5;
    vec4 col = texture (envMap, vec2(theta, phi));

    return col;
}
void main(void)
{
    // Step 1: I need pixel coordinates. Division by w?
    vec4 worldPos = position;
    worldPos.z = 1; // near clipping plane
    worldPos = persp_inverse * worldPos;
    worldPos /= worldPos.w;
    worldPos.w = 0;
    worldPos = normalize(worldPos);
    // Step 2: ray direction:
    vec3 u = normalize((mat_inverse * worldPos).xyz);
    vec3 eye = (mat_inverse * vec4(0, 0, 0, 1)).xyz;

    // TODO
    vec4 resultColor = vec4(0,0,0,1);

    //
if (sphere){
  if (!transparent){
       vec3 newPoint1;
      if(raySphereIntersect( eye, u, newPoint1, radius)){
           vec3 n = normalize(newPoint1 - center);
           vec3 r = normalize(reflect(u, n));   // reflected ray
           resultColor =   FresnelReflectAmount(air, glass, n,u)*getColorFromEnvironment(r);
          }
          else
          {
            resultColor = getColorFromEnvironment(u);
          }

  }
  else  // when refration has to be considered
  {
    vec3 newPoint1;
    if(raySphereIntersect( eye, u, newPoint1,radius))
    {

      Ray rays[BOUNCES];
      vec3 start;
      vec3 direction;
      vec3 normal;
      vec3 reflected;
      vec3 refracted;
      vec3 newPoint2;

      normal = normalize(newPoint1 - center);
      reflected = normalize(reflect(u, normal));   // reflected ray
      refracted = normalize(refract(u, normal, air/glass));
      direction = refracted;

      rays[0].direction = reflected;
      rays[0].fresnel =  FresnelReflectAmount(air, glass, normal,u);

      int i;
      for (i=1; i < BOUNCES; i++)                            // for every bounce first put the reflected ray and then the refracted ray
      {
          if(!raySphereIntersect(newPoint1 + 0.01*direction , direction, newPoint2, radius))
            break;
          normal = normalize( center - newPoint2 );
          reflected = normalize(reflect(direction, normal));   // reflected ray
          refracted = normalize(refract(direction, normal, glass/air));

          rays[i].direction = refracted;
          rays[i].fresnel = 1 - FresnelReflectAmount(glass, air, normal,direction);

          newPoint1 = newPoint2;
          direction = reflected;
      }

      for (i=BOUNCES -1; i >= 0; i--)
      {
        resultColor =  rays[i].fresnel*getColorFromEnvironment(rays[i].direction) + (1-rays[i].fresnel)*resultColor;
      }

    }
    else
    {
      resultColor = getColorFromEnvironment(u);

    }

  }

}




}


    fragColor = resultColor;
}
