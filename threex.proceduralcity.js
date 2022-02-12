// from @mrdoob http://www.mrdoob.com/lab/javascript/webgl/city/01/

var THREEx = THREEx || {}
var meshDay = null;
var meshNight = null;

THREEx.ProceduralCity	= function(){
	// build the base geometry for each building
	var geometry = new THREE.CubeGeometry( 1, 1, 1 );
	// translate the geometry to place the pivot point at the bottom instead of the center
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
	// get rid of the bottom face - it is never seen
	geometry.faces.splice( 3, 1 );
	geometry.faceVertexUvs[0].splice( 3, 1 );
	// change UVs for the top face
	// - it is the roof so it wont use the same texture as the side of the building
	// - set the UVs to the single coordinate 0,0. so the roof will be the same color
	//   as a floor row.
	geometry.faceVertexUvs[0][2][0].set( 0, 0 );
	geometry.faceVertexUvs[0][2][1].set( 0, 0 );
	geometry.faceVertexUvs[0][2][2].set( 0, 0 );
	geometry.faceVertexUvs[0][2][3].set( 0, 0 );
	// buildMesh
	var buildingMesh= new THREE.Mesh( geometry );

	// base colors for vertexColors. light is for vertices at the top, shaddow is for the ones at the bottom
	var light	= new THREE.Color( 0xffffff )
	var shadow	= new THREE.Color( 0x303050 )
	var number_of_buildings = 200000;  //Number of buildings that are possible to build, it is not number of buildings that are going to be built!!!! lets say number of tries
	var table = [[]]; //table will be saving information about placed buildings to avoid plaicing others in the same spot 
	//defining array structure
	for (var i = 0; i < number_of_buildings; i++) {
		table[i] = new Array(2);
	}

//----------------------------------------
	var cityGeometry= new THREE.Geometry();
	//loop through all buildings possibly to build
	for( var i = 0; i < number_of_buildings; i ++ ){

		//initially it can be assumed that it is possible to create a building and then we check if it is really possible
		free_space = true;

		// put a random position
		x_building = Math.floor( Math.random() * 200 - 100 ) * 10;
		z_building = Math.floor( Math.random() * 200 - 100 ) * 10;
		//defining size here to to be able to dynamically check the spacing between buildings. If the building is wide, the margin should also be larger
		x_size = Math.random() * Math.random() * Math.random() * Math.random() * 50 + 6;
		//in this loop the location of the new building is checked with each one already placed to avoid colisions
		for(var j = 0; j < i; j++){
			//here possible colisions are checked. If they appear we set free_space to false to not place this building.
			if(Math.abs(table[j][0] - x_building)<x_size*Math.sqrt(2)+5 && Math.abs(table[j][1] - z_building)<x_size*Math.sqrt(2)+5 ){ 
				free_space = false;
				break
			}
		}
		//if it is possible to build a building, do it
		if(free_space){
			buildingMesh.position.x	= x_building;
			buildingMesh.position.z	= z_building;
			// put a random rotation
			buildingMesh.rotation.y	= Math.random()*Math.PI*2;
			// put a random scale
			buildingMesh.scale.x	= x_size
			buildingMesh.scale.y	= (Math.random() * Math.random() * Math.random() * buildingMesh.scale.x) * 8 + 8;
			buildingMesh.scale.z	= x_size

			// establish the base color for the buildingMesh
			var value	= 1 - Math.random() * Math.random();
			var baseColor	= new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );
			// set topColor/bottom vertexColors as adjustement of baseColor
			var topColor	= baseColor.clone().multiply( light );
			var bottomColor	= baseColor.clone().multiply( shadow );
			// set .vertexColors for each face
			var geometry	= buildingMesh.geometry;		
			for ( var j = 0, jl = geometry.faces.length; j < jl; j ++ ) {
				if ( j === 2 ) {
					// set face.vertexColors on root face
					geometry.faces[ j ].vertexColors = [ baseColor, baseColor, baseColor, baseColor ];
				} else {
					// set face.vertexColors on sides faces
					geometry.faces[ j ].vertexColors = [ topColor, bottomColor, bottomColor, topColor ];
				}
			}
			// merge it with cityGeometry - very important for performance
			THREE.GeometryUtils.merge( cityGeometry, buildingMesh );
			table[i][0] = x_building;
			table[i][1] = z_building;
		}


	}

	// generate the texture
	var textureDay		= new THREE.Texture( generateTextureCanvas(false, "#ffffff") );
	textureDay.anisotropy	= renderer.getMaxAnisotropy();
	textureDay.needsUpdate	= true;

	// generate the texture
	var textureNight		= new THREE.Texture( generateTextureCanvas(true, "#3D3D3B") );
	textureNight.anisotropy	= renderer.getMaxAnisotropy();
	textureNight.needsUpdate	= true;

	// build the mesh
	var materialDay	= new THREE.MeshLambertMaterial({
		map		: textureDay,
		vertexColors	: THREE.VertexColors,
		//emissive: "white"
	});

	// build the mesh
	var materialNight	= new THREE.MeshLambertMaterial({
		map		: textureNight,
		vertexColors	: THREE.VertexColors,
		emissive: "white"
	});


	meshDay = new THREE.Mesh(cityGeometry, materialDay );
	meshNight = new THREE.Mesh(cityGeometry, materialNight );
	return meshDay

	function generateTextureCanvas(Night, building_color){
		// build a small canvas 32x64 and paint it in white
		var canvas	= document.createElement( 'canvas' );
		canvas.width	= 32;
		canvas.height	= 64;
		console.log("TEST");
		var context	= canvas.getContext( '2d' );
		// plain it in white
		context.fillStyle	= building_color;
		context.fillRect( 0, 0, 32, 64 );
		// draw the window rows - with a small noise to simulate light variations in each room
		for( var y = 2; y < 64; y += 2 ){
			for( var x = 0; x < 32; x += 2 ){
				var value	= Math.floor( Math.random() * 64 );
				context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.fillRect( x, y, 2, 1 );
				if(Night){
					if(x%5 == Math.floor(Math.random()*Math.random()*20)){
						context.fillStyle	= '#ffffee';
						context.fillRect( x, y, 2, 1 );
					}
				}
			}
		}

		// build a bigger canvas and copy the small one in it
		// This is a trick to upscale the texture without filtering
		var canvas2	= document.createElement( 'canvas' );
		canvas2.width	= 512;
		canvas2.height	= 1024;
		var context	= canvas2.getContext( '2d' );
		// disable smoothing
		context.imageSmoothingEnabled		= false;
		context.webkitImageSmoothingEnabled	= false;
		context.mozImageSmoothingEnabled	= false;
		// then draw the image
		context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
		// return the just built canvas2
		return canvas2;
	}

	
}


	//////////////////////////////////////////////////////////////////////////////////
	//		loop runner							//
	//////////////////////////////////////////////////////////////////////////////////

var lastTimeMsec= null
	var sun_location = 16 * (360/24) - 90;
	var intensidad_max = 0.5;
	
	var back_fog_color = 260;
	var back_fog_saturation = 100; 
	var back_fog_lightness = 95;
	
	requestAnimationFrame(function animate(nowMsec){
		// keep looping
		requestAnimationFrame( animate );
		// measure time
		var sun_location = 0.01*nowMsec;
		var sinus_y_position = Math.sin(sun_location * Math.PI / 180);
		var cosinus_x_position = Math.cos(sun_location * Math.PI / 180);

		dirLight.position.y = 1000 * sinus_y_position;
		dirLight.position.x = 1000 * cosinus_x_position;
		light.position.y = dirLight.position.y;
		light.position.x = dirLight.position.x;
		if (sinus_y_position > 0.4 )   // day
			{
				var f = 1;

				dirLight.intensity = f;
				light.intensity = f*0.8;
				document.body.style.backgroundColor = "hsl("+back_fog_color+", "+back_fog_saturation+"%, "+back_fog_lightness+"%)";
				scene.fog.color.setHSL( back_fog_color/360, back_fog_saturation/100, back_fog_lightness/100 );

				light.color.setHSL( 0.131, 1, 0.8 );
			}

			 else if (sinus_y_position < 0.4 && sinus_y_position > 0.0 )
			 {
				scene.remove(meshNight);
				scene.add(meshDay);
			 	var f = 2.5*sinus_y_position;

			 	dirLight.intensity = f;		
			 	light.intensity = f*0.8;
				multiplicator = back_fog_lightness/40
				var lightness = multiplicator*sinus_y_position*100;
				document.body.style.backgroundColor = "hsl("+back_fog_color+", "+back_fog_saturation+"%, "+lightness+"%)";
				scene.fog.color.setHSL( back_fog_color/360, back_fog_saturation/100, lightness/100);



				light.color.setHSL( 0.09, 1, 2*sinus_y_position );
		
			 }

			else  // night
			{
				scene.remove(meshDay);
				scene.add(meshNight);
				
				var f = sinus_y_position;
				dirLight.intensity = f;
				light.intensity = f;


			}
		console.log(sinus_y_position)

		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		// call each update function
		updateFcts.forEach(function(updateFn){
			updateFn(deltaMsec/1000, nowMsec/1000)
		})
	})