uniform sampler2D tDiffuse;
uniform float time; // steadily increasing float passed in
uniform float eqL[32]; // EQ left
uniform float eqR[32]; // EQ right
uniform float speed; // distortion vertical travel speed

varying vec2 vUv;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
    -0.577350269189626,  // -1.0 + 2.0 * C.x
    0.024390243902439); // 1.0 / 41.0
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 p = vUv;

  // EQ to param-mapping goes here

  // amount of thick distortion
  float distortion = eqL[0] + eqL[1] + eqL[2] + eqR[0] + eqR[1] + eqR[2];

  // vertical roll speed
  float rollSpeed = (eqL[2] + eqL[3] + eqL[4] + eqR[2] + eqR[3] + eqR[4]) / 6.0;
  
  // amount of fine grain distortion
  float distortion2 = eqL[5] + eqL[6] + eqL[7] + eqR[5] + eqR[6] + eqR[7];
  

  float ty = time*speed;
  float yt = p.y - ty;
  float offset = snoise(vec2(yt*3.0,0.0))*0.2;
  offset = pow( offset*distortion,3.0)/distortion;
  offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;
  gl_FragColor = texture2D(tDiffuse,  vec2(fract(p.x + offset),fract(p.y-time*rollSpeed) ));
}