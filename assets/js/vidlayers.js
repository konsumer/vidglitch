var VidLayers = function(video){
	this.video = video;
	this.shaderTime = 0;
	this.videoTexture = new THREE.Texture( this.video );
	this.videoTexture.minFilter = THREE.LinearFilter;
	this.videoTexture.magFilter = THREE.LinearFilter;
	this.videoMaterial = new THREE.MeshBasicMaterial({ map: this.videoTexture });

	// basic 3js scene - plane of video + camera looking at it
	this.camera = new THREE.PerspectiveCamera(55, 1080/ 720, 20, 3000);
	this.camera.position.z = 1000;
	this.scene = new THREE.Scene();
	this.planeGeometry = new THREE.PlaneGeometry( 1080, 720,1,1 );
	this.plane = new THREE.Mesh( this.planeGeometry, this.videoMaterial );
	this.scene.add( this.plane );
	this.plane.z = 0;
	this.plane.scale.x = this.plane.scale.y = 1.45;
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize( 800, 600 );
	this.domElement = this.renderer.domElement;

	// setup layers
	this.ready = false;
	this.layers = {};
	this.layerOrder = ['render', 'copy'];
	this.addLayer();
};

// get file, or script inner-text by ID
VidLayers.prototype.get = function(url, cb){
	cb = cb || function(){};
	
	var d = document.getElementById(url);
	console.log(url, d);
	if (d && d.innerHTML){
		cb(d.innerHTML);
	}else{
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				cb(xhr.responseText);
			}
		};
		xhr.send();
	}
};

VidLayers.prototype.getShader = function(vshader, fshader, uniforms, cb){
	var vid = this;
	vid.get(vshader, function(vertexShader){
		vid.get(fshader, function(fragmentShader){
			var shader = {
				uniforms: uniforms,
				vertexShader:vertexShader,
				fragmentShader:fragmentShader
			};
			cb( new THREE.ShaderPass(shader) );
		});
	});
};

VidLayers.prototype.addLayer = function(name, vshader, fshader, uniforms){
	var vid = this;

	// shared texture
	if (uniforms){
		uniforms.tDiffuse = { 'type': 't', 'value': null };
	}

	var layers = {
		"render": new THREE.RenderPass(vid.scene, vid.camera)
	};

	for (var i in vid.layers){
		if (i!='copy' && i!='render'){
			layers[i] = vid.layers[i];
		}
	}

	layers.copy = new THREE.ShaderPass(THREE.CopyShader);
	layers.copy.renderToScreen = true;

	vid.layers = layers;

	if (name){
		vid.layerOrder.splice(vid.layerOrder.length-1, 0, name);

		vid.getShader(vshader, fshader, uniforms, function(shader){
			if (shader){
				vid.layers[name] = shader;
				console.log('loaded', name);
			}else{
				console.error('no shader', name);
			}

			vid.composer = new THREE.EffectComposer(vid.renderer);
			vid.layerOrder.forEach(function(s){
				vid.composer.addPass(vid.layers[s]);
			});
		});
	}else{
		vid.composer = new THREE.EffectComposer(vid.renderer);
		vid.layerOrder.forEach(function(s){
			vid.composer.addPass(vid.layers[s]);
		});
	}
};

VidLayers.prototype.update = function(params){
	this.shaderTime += 0.1;
	var i,l;
	var vid = this;

	if ( vid.video.readyState === vid.video.HAVE_ENOUGH_DATA ) {
		vid.videoTexture.needsUpdate = true;
	}

	// update uniforms
	for (i in vid.layers){
		if (vid.layers[i].uniforms && vid.layers[i].uniforms['time']){
			vid.layers[i].uniforms['time'].value = vid.shaderTime;
		}
		if (params[i]){
			for (l in params[i]){
				if (vid.layers[i].uniforms && vid.layers[i].uniforms[l]){
					vid.layers[i].uniforms[l].value = params[i][l];
				}
			}
		}
	}
	vid.composer.render( 0.1 );
};