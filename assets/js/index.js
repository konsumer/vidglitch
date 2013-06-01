var camera, scene, renderer;
var video, videoTexture,videoMaterial;

var composer;
var shaderTime = 0;
var badTVParams, badTVPass;		
var staticParams, staticPass;		

var rgbParams, rgbPass;	
var filmParams, filmPass;	

var renderPass, copyPass;

var gui;

var pnoise, globalParams;

var stats;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera(55, 1080/ 720, 20, 3000);
	camera.position.z = 1000;
	scene = new THREE.Scene();

	video = document.createElement( 'video' );
	video.width = 320;
	video.height = 240;

	//Load Video
	// video.src = "assets/space.flv";
	// video.volume = 0;
	// video.loop=true;
	// video.play();

	video = document.getElementById('vid');


	//Use webcam
	
	/*
	window.URL = window.URL || window.webkitURL;
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	//get webcam
	navigator.getUserMedia({
		video: true
	}, function(stream) {
		//on webcam enabled
		video.src = window.URL.createObjectURL(stream);
		// prompt.style.display = 'none';
		// title.style.display = 'inline';
	 	// container.style.display = 'inline';
		// gui.domElement.style.display = 'inline';
	}, function(error) {
		prompt.innerHTML = 'Unable to capture WebCam. Please reload the page.';
	});
	*/

	//init video texture
	videoTexture = new THREE.Texture( video );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;

	videoMaterial = new THREE.MeshBasicMaterial( {
		map: videoTexture
	} );


	//Add video plane
	var planeGeometry = new THREE.PlaneGeometry( 1080, 720,1,1 );
	var plane = new THREE.Mesh( planeGeometry, videoMaterial );
	scene.add( plane );
	plane.z = 0;
	plane.scale.x = plane.scale.y = 1.45;

	//add stats
	/*
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );
	*/

	//init renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( 800, 600 );
	document.body.appendChild( renderer.domElement );

	//POST PROCESSING
	//Create Shader Passes
	renderPass = new THREE.RenderPass( scene, camera );
	badTVPass = new THREE.ShaderPass( THREE.BadTVShader );
	rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
	filmPass = new THREE.ShaderPass( THREE.FilmShader );
	staticPass = new THREE.ShaderPass( THREE.StaticShader );
	copyPass = new THREE.ShaderPass( THREE.CopyShader );

	//set shader uniforms
	filmPass.uniforms[ "grayscale" ].value = 0;
	

	//Init DAT GUI control panel
	badTVParams = {
		mute:true,
		show: true,
		distortion: 3.0,
		distortion2: 1.0,
		speed: 0.3,
		rollSpeed: 0.1
	}

	staticParams = {
		show: true,
		amount:0.5,
		size2:4.0
	}

	rgbParams = {
		show: true,
		amount: 0.005,
		angle: 0.0,
	}

	filmParams = {
		show: true,
		count: 800,
		sIntensity: 0.9,
		nIntensity: 0.4
	}

	onToggleShaders();
	onParamsChange();

	window.addEventListener('resize', onResize, false);
	renderer.domElement.addEventListener('click', doFulscreen);

	onResize();

	randomizeParams();


	// sound	
	SC.initialize({
		client_id: '129e27ca54a024eb97414a86f9fd0b97'
	});
	var options = {
		useHighPerformance : true,
		useEQData:true
	};
	options.whileplaying = function(){
		// get value of beat
		var highNote = 0;
		this.eqData.right.slice(205, 255).forEach(function(v){
			highNote += parseFloat(v);
		});
		var lowNote = 0;
		this.eqData.right.slice(0, 50).forEach(function(v){
			lowNote += parseFloat(v);
		});
		var midNote = 0;
		this.eqData.right.slice(100, 150).forEach(function(v){
			midNote += parseFloat(v);
		})
		staticPass.uniforms[ "amount" ].value = (highNote/4) + 0.1;
		staticPass.uniforms[ "size" ].value = (highNote * 2) + 0.2;

		badTVPass.uniforms[ "distortion" ].value = lowNote*2;
		badTVPass.uniforms[ "speed" ].value = lowNote*0.1;
		badTVPass.uniforms[ "rollSpeed" ].value = lowNote*0.1;

		rgbPass.uniforms[ "angle" ].value = Math.random()*2*Math.PI;
		rgbPass.uniforms[ "amount" ].value = lowNote*0.01;

		filmPass.uniforms[ "sCount" ].value = midNote;
		
	};

	SC.stream("/tracks/53193208", options, function(sound){
	  sound.play();
	});
}

function onParamsChange() {
	//copy gui params into shader uniforms
	badTVPass.uniforms[ "distortion" ].value = badTVParams.distortion;
	badTVPass.uniforms[ "distortion2" ].value = badTVParams.distortion2;
	badTVPass.uniforms[ "speed" ].value = badTVParams.speed;
	badTVPass.uniforms[ "rollSpeed" ].value = badTVParams.rollSpeed;

	staticPass.uniforms[ "amount" ].value = staticParams.amount;
	staticPass.uniforms[ "size" ].value = staticParams.size2;

	rgbPass.uniforms[ "angle" ].value = rgbParams.angle*Math.PI;
	rgbPass.uniforms[ "amount" ].value = rgbParams.amount;

	filmPass.uniforms[ "sCount" ].value = filmParams.count;
	filmPass.uniforms[ "sIntensity" ].value = filmParams.sIntensity;
	filmPass.uniforms[ "nIntensity" ].value = filmParams.nIntensity;
}

function doFulscreen(event){
	var element = event.target;
	if('webkitCancelFullScreen' in document	? true : false){
		element.webkitRequestFullScreen();
	}
	if('mozCancelFullScreen' in document	? true : false){
		element.mozRequestFullScreen();
	}
}


function randomizeParams() {
	hitTv(Math.random() <0.2);
}

// hit the TV
function hitTv(good){
	if (good){
		badTVParams.distortion = 0.1;
		badTVParams.distortion2 =0.1;
		badTVParams.speed =0;
		badTVParams.rollSpeed =0;
		rgbParams.angle = 0;
		rgbParams.amount = 0;
		staticParams.amount = 0;
	}else{
		badTVParams.distortion = Math.random()*10+0.1;
		badTVParams.distortion2 =Math.random()*10+0.1;
		badTVParams.speed =Math.random()*.4;
		badTVParams.rollSpeed =Math.random()*.2;
		rgbParams.angle = Math.random()*2;
		rgbParams.amount = Math.random()*0.03;
		staticParams.amount = Math.random()*0.2;
	}
	onParamsChange();
}



function onToggleShaders(){

	//Add Shader Passes to Composer
	//order is important 
	composer = new THREE.EffectComposer( renderer);
	composer.addPass( renderPass );
	
	if (filmParams.show){
		composer.addPass( filmPass );
	}

	if (badTVParams.show){
		composer.addPass( badTVPass );
	}

	if (rgbParams.show){
		composer.addPass( rgbPass );
	}

	if (staticParams.show){
		composer.addPass( staticPass );
	}

	composer.addPass( copyPass );
	copyPass.renderToScreen = true;
}

function animate() {
	shaderTime += 0.1;
	badTVPass.uniforms[ 'time' ].value =  shaderTime;
	filmPass.uniforms[ 'time' ].value =  shaderTime;
	staticPass.uniforms[ 'time' ].value =  shaderTime;

	if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
		if ( videoTexture ) videoTexture.needsUpdate = true;
	}

	requestAnimationFrame( animate );
	composer.render( 0.1);
	if (stats){
		stats.update();
	}		
}

function onResize() {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}