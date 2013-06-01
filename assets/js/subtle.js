(function(){	
	// load video
	var video = document.getElementById('vid');
	var videoTexture = new THREE.Texture( video );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	var videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

	// basic 3js scene
	var camera = new THREE.PerspectiveCamera(55, 1080/ 720, 20, 3000);
	camera.position.z = 1000;
	var scene = new THREE.Scene();
	var planeGeometry = new THREE.PlaneGeometry( 1080, 720,1,1 );
	var plane = new THREE.Mesh( planeGeometry, videoMaterial );
	scene.add( plane );
	plane.z = 0;
	plane.scale.x = plane.scale.y = 1.45;
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( 800, 600 );
	document.body.appendChild( renderer.domElement );

	// shader pass layers
	var layers = {
		"render": new THREE.RenderPass( scene, camera ),
		"tv": new THREE.ShaderPass( THREE.BadTVShader ),
		"rgb": new THREE.ShaderPass( THREE.RGBShiftShader ),
		"film": new THREE.ShaderPass( THREE.FilmShader ),
		"static": new THREE.ShaderPass( THREE.StaticShader ),
		"copy":  new THREE.ShaderPass( THREE.CopyShader )
	}
	var composer = new THREE.EffectComposer( renderer);
	for (i in layers){
		composer.addPass(layers[i]);
	}
	layers.copy.renderToScreen = true;
	function updateLayers(changes){
		for (layer in changes){
			for (param in changes[layer]){
				layers[layer].uniforms[param].value = changes[layer][param];
			}
		}
	}

	// tv in working order
	updateLayers({
		"tv": {
			"distortion": 0.1,
			"distortion2": 0.1,
			"speed":0,
			"rollSpeed":0,
		},
		"rgb": {
			"angle": 0,
			"amount": 0
		},
		"static":{
			"amount": 0,
			"size": 2
		},
		"film":{
			"sCount": 0.1,
			"sIntensity":0.1,
			"nIntensity":0.1
		}
	});

	// handle window resize
	function onResize() {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}
	window.addEventListener('resize', onResize, false);
	onResize();

	// click for fullscreen
	function doFulscreen(event){
		var element = event.target;
		if('webkitCancelFullScreen' in document	? true : false){
			element.webkitRequestFullScreen();
		}
		if('mozCancelFullScreen' in document	? true : false){
			element.mozRequestFullScreen();
		}
	}
	renderer.domElement.addEventListener('click', doFulscreen);

	// render loop
	var shaderTime = 0;
	function animate() {
		shaderTime += 0.1;
		// update time for tv shaders
		for (i in layers){
			if (layers[i].uniforms && layers[i].uniforms['time']){
				layers[i].uniforms['time'].value = shaderTime;
			}
		}
		if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
			if ( videoTexture ) videoTexture.needsUpdate = true;
		}

		requestAnimationFrame( animate );
		composer.render( 0.1 );

	}
	animate();

	// get sound, process on eq data, update shader
	SC.initialize({
		client_id: '129e27ca54a024eb97414a86f9fd0b97'
	});
	var options = {
		useHighPerformance : true,
		useEQData:true
	};
	options.whileplaying = function(){	
		// split EQ into 8 vals
		var eq = [0,0,0,0,0,0,0,0];
		this.eqData.left.forEach(function(v,i){
			eq[Math.floor(i/32)] += parseFloat(v);
		});
		for(i=0;i<8;i++){
			eq[i] = eq[i] / 32;
		}

		updateLayers({
			"tv": {
				"distortion": (eq[0]*10) + 1,
				"distortion2": (eq[2]*10) + 0.1,
				"rollSpeed": eq[1]
			},
			"rgb": {
				"angle": eq[2] * 2 * Math.PI,
				"amount": eq[3] * 0.1
			},
			"static":{
				"amount": eq[4]*2,
				"size": eq[4] * 10 + 0.1
			}
		});
	};
	SC.stream("/tracks/53193208", options, function(sound){
	  sound.play();
	});
})();