#version 410



#define M_PI 3.1415926535897932384626433832795


uniform float lightIntensity;
uniform bool blinnPhong;
uniform bool test;
uniform float shininess;
uniform float eta;
uniform sampler2D shadowMap;


uniform float roughness = 0.6;
const vec4 ambient_ref_coeff = vec4(0.2, 0.20, 0.20, 0.0);
const vec4 diffuse_ref_coeff = vec4(0.6, 0.30, 0.20, 0.0);



in vec4 eyeVector;
in vec4 lightVector;
in vec4 vertColor;
in vec4 vertNormal;
in vec4 lightSpace;

out vec4 fragColor;

void main( void )
{


     vec4 ambient_light = ambient_ref_coeff * vertColor * lightIntensity;

     vec4 difuse_light = diffuse_ref_coeff * vertColor *
                            max(dot(normalize(vertNormal), normalize(lightVector)),0.0) * lightIntensity;

     vec4 halfVector  = normalize(normalize(eyeVector) + normalize(lightVector));

     float cos_angle = (dot(halfVector,lightVector))/(length(halfVector)*length(lightVector));

     float ci = pow(eta*eta -1 + pow(cos_angle, 2), 0.5);

     float Fs = pow((cos_angle - ci)/(cos_angle + ci),2);
     float Fp = pow((eta* eta* cos_angle - ci)/(eta* eta* cos_angle + ci),2);

     float Fresnel_coeff = 0.5*(Fs + Fp);

     vec4 specular_light = vec4(0.0,0.0,0.0,0.0); // initialising specular light vector

     if(blinnPhong){

        // blinnPhong model
        specular_light = Fresnel_coeff * vertColor *
                                pow(max(dot(normalize(vertNormal), halfVector),0.0),shininess) * lightIntensity;
     }

     else{


         // cookTorrance model:

         float theta = acos(dot(normalize(vertNormal), halfVector));
         float theta_i = acos(dot(normalize(vertNormal), normalize(lightVector)));
         float theta_o = acos(dot(normalize(vertNormal), normalize(eyeVector) ));

         float Xdist = 0;
         if (theta < (M_PI/2)){
             Xdist = 1;
         }

        float microFacetNorm = Xdist*pow(roughness,2)/
                                (M_PI * pow(cos(theta), 4) * pow((pow(roughness, 2)+ pow(tan(theta), 2)), 2));

        float G_i = 2./(1+ sqrt(1 +pow(roughness, 2) + pow(tan(theta_i), 2)));
        float G_o = 2./(1+ sqrt(1 +pow(roughness, 2) + pow(tan(theta_o), 2)));

         specular_light = Fresnel_coeff * microFacetNorm * G_i * G_o * vertColor  * lightIntensity /
                                (4 * cos(theta_i))*cos(theta_o);


     }


     // if(test)fragColor = vec4(1,0,0,0);
     // //fragColor = vertColor;
     // else
        fragColor = (ambient_light + difuse_light + specular_light);
}
