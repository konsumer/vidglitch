uniform float time;
uniform bool grayscale;
uniform float nIntensity;
uniform float sIntensity;
uniform float sCount;
uniform sampler2D tDiffuse;
varying vec2 vUv;

float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	vec4 cTextureScreen = texture2D( tDiffuse, vUv );
	vec3 cResult = cTextureScreen.rgb;
	vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );
	cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;
	cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );
	gl_FragColor =  vec4( cResult, cTextureScreen.a );
}