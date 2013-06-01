(function(){
	// basic 3js scene
	var camera = new THREE.PerspectiveCamera(55, 1080/ 720, 20, 3000);
	camera.position.z = 1000;
	var scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( 800, 600 );
	document.body.appendChild( renderer.domElement );

	// EQ bars
	var geo=[];
	for(i=0;i<8;i++){
		geo[i] = new THREE.Mesh( new THREE.CubeGeometry( 200, 50, 200 ), new THREE.MeshNormalMaterial() );
		geo[i].position.y = i*54;
		scene.add( geo[i] );
	}

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
			geo[i].scale.x = eq[i]*5;
		}
		renderer.render(scene, camera);
	};
	SC.stream("/tracks/53193208", options, function(sound){
	  sound.play();
	});
})();