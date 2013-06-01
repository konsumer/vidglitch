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

	dat.GUI.TEXT_CLOSED = '^';
  	dat.GUI.TEXT_OPEN = '&#9881;'; // gear

	gui = new dat.GUI();

	var f1 = gui.addFolder('Bad TV');
	f1.add(badTVParams, 'show').onChange(onToggleShaders);
	f1.add(badTVParams, 'distortion', 0.1, 20).step(0.1).listen().name("Thick Distort").onChange(onParamsChange);
	f1.add(badTVParams, 'distortion2', 0.1, 20).step(0.1).listen().name("Fine Distort").onChange(onParamsChange);
	f1.add(badTVParams, 'speed', 0.0,1.0).step(0.01).listen().name("Distort Speed").onChange(onParamsChange);
	f1.add(badTVParams, 'rollSpeed', 0.0,1.0).step(0.01).listen().name("Roll Speed").onChange(onParamsChange);
	
	f1.open();

	var f2 = gui.addFolder('RGB Shift');
	f2.add(rgbParams, 'show').onChange(onToggleShaders);
	f2.add(rgbParams, 'amount', 0.0, 0.1).listen().onChange(onParamsChange);
	f2.add(rgbParams, 'angle', 0.0, 2.0).listen().onChange(onParamsChange);
	f2.open();

	var f4 = gui.addFolder('Static');
	f4.add(staticParams, 'show').onChange(onToggleShaders);
	f4.add(staticParams, 'amount', 0.0,1.0).step(0.01).listen().onChange(onParamsChange);
	f4.add(staticParams, 'size2', 1.0,100.0).step(1.0).onChange(onParamsChange);
	f4.open();

	var f3 = gui.addFolder('Scanlines');
	f3.add(filmParams, 'show').onChange(onToggleShaders);
	f3.add(filmParams, 'count', 50, 1000).onChange(onParamsChange);
	f3.add(filmParams, 'sIntensity', 0.0, 2.0).step(0.1).onChange(onParamsChange);
	f3.add(filmParams, 'nIntensity', 0.0, 2.0).step(0.1).onChange(onParamsChange);
	f3.open();

	gui.close();

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
		// 3 band eq, normalized 0-1
		var eq=[0,0,0];
		for (i=0;i<20;i++){
			eq[0] += parseFloat(this.eqData.right[i] + 10);
			eq[1] += parseFloat(this.eqData.right[i] + 100);
			eq[2] += parseFloat(this.eqData.right[i] + 200);
		}
		for (i=0;i<3;i++){
			eq[i] = eq[i]/20.0;
		}

		rgbParams.amount = 0.005 + (eq[0] * 0.01);

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
	onParamsChange();

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