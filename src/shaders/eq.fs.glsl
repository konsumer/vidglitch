uniform sampler2D video;
uniform float eqL[32]; // EQ left
uniform float eqR[32]; // EQ right

varying vec2 vUv;
const float increment = 1.0/32.0;

void main() {
	vec2 p = vUv;
	vec4 pixel = texture2D(video, vUv);
	float loc = 0.0;
	float loc2 = increment;

	for (int i=0;i<32;i++){
		if (p.x > loc && p.x < loc2) {
			if(p.y < eqL[i]){
				gl_FragColor = vec4(0.0, 1.0, 0.0, 0.2) + pixel;
			}else{
				gl_FragColor = pixel;
			}
		}
		loc = loc + increment;
		loc2 = loc + increment;
	}
}