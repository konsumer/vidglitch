uniform sampler2D video;
uniform float eqL[32]; // EQ left
uniform float eqR[32]; // EQ right
uniform float time;

varying vec2 vUv;

float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	// EQ to param-mapping goes here
	float amount =  (eqL[2] + eqL[3] + eqL[4] + eqR[2] + eqR[3] + eqR[4]) / 4.0;
	float size =  ((eqL[24] + eqL[25] + eqL[26] + eqL[27] + eqL[28] + eqL[29] + eqL[30] + eqL[31] + eqR[24] + eqR[25] + eqR[26] + eqR[27] + eqR[28] + eqR[29] + eqR[30] + eqR[31])/8.0) * 0.1;

	vec2 p = vUv;
	vec4 color = texture2D(video, p);
	float xs = floor(gl_FragCoord.x / size);
	float ys = floor(gl_FragCoord.y / size);
	vec4 snow = vec4(rand(vec2(xs * time,ys * time))*amount);
	gl_FragColor = color+ snow;
}