uniform sampler2D tDiffuse;
varying vec2 vUv;

uniform float eqL[32]; // EQ left
uniform float eqR[32]; // EQ right

#define M_PI 3.1415926535897932384626433832795


void main() {
  // EQ to param-mapping goes here
  float amount = eqL[2] + eqL[3] + eqL[4] + eqR[2] + eqR[3] + eqR[4]; // shift distance (1 is width of input)
  float angle = eqL[5] + eqL[6] + eqL[7] + eqR[5] + eqR[6] + eqR[7] * M_PI; // shift angle in radians
  
  vec2 offset = amount * vec2( cos(angle), sin(angle));
  vec4 cr = texture2D(tDiffuse, vUv + offset);
  vec4 cga = texture2D(tDiffuse, vUv);
  vec4 cb = texture2D(tDiffuse, vUv - offset);
  gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
}