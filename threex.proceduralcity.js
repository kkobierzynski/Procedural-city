// from @mrdoob http://www.mrdoob.com/lab/javascript/webgl/city/01/

var THREEx = THREEx || {}
var meshDay = null;
var meshDay1 = null;
var meshDay2 = null;
var meshDay3 = null;
var meshDay4 = null;
var meshDay5 = null;
var meshNight = null;
var meshNightDeep = null;


THREEx.ProceduralCity	= function(){
	var building_counter = 0;
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
	var number_of_buildings = 20000;  //Number of buildings that are possible to build, it is not number of buildings that are going to be built!!!! lets say number of tries
	var table = [[]]; //table will be saving information about placed buildings to avoid plaicing others in the same spot 
	//defining array structure
	for (var i = 0; i < number_of_buildings; i++) {
		table[i] = new Array(2);
	}

	//----------------------------------------
	var cityGeometry= new THREE.Geometry();
	var cityGeometry_texture1 = new THREE.Geometry();
	var cityGeometry_texture2 = new THREE.Geometry();
	var cityGeometry_texture3 = new THREE.Geometry();
	var cityGeometry_texture4 = new THREE.Geometry();
	var cityGeometry_texture5 = new THREE.Geometry();

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
			//Because it is not known how many buildings will be created it is neccessary to add counter
			building_counter++;
			//Here the code assigns the building to the mesha based on the chances that have been determined.
			//Then the textures will be assigned to the specific mashes
			if(building_counter%100<75){
				THREE.GeometryUtils.merge( cityGeometry, buildingMesh );
			}else if(building_counter%100<80 && building_counter%100>75){
				THREE.GeometryUtils.merge( cityGeometry_texture1, buildingMesh );
			}else if(building_counter%100<85 && building_counter%100>80){
				THREE.GeometryUtils.merge( cityGeometry_texture2, buildingMesh );
			}else if(building_counter%100<90 && building_counter%100>85){
				THREE.GeometryUtils.merge( cityGeometry_texture3, buildingMesh );
			}else if(building_counter%100<95 && building_counter%100>90){
				THREE.GeometryUtils.merge( cityGeometry_texture4, buildingMesh );
			}else if(building_counter%100<100 && building_counter%100>95){
				THREE.GeometryUtils.merge( cityGeometry_texture5, buildingMesh );
			}

			// THREE.GeometryUtils.merge( cityGeometry, buildingMesh );
			table[i][0] = x_building;
			table[i][1] = z_building;
		}


	}

	//---------------PART RESPONSIBLE FOR CREATING DIFFERENT TEXTURES------------------
	//Textures and normals for balcony image
	THREE.ImageUtils.crossOrigin = '';
	var texture_balcony = new THREE.ImageUtils.loadTexture('./img/balcony.jpg');
	var texture_balcony_normal = new THREE.ImageUtils.loadTexture('./img/balcony_normal_map.png');

	texture_balcony_normal.wrapS = THREE.RepeatWrapping;
	texture_balcony_normal.wrapT = THREE.RepeatWrapping;
	texture_balcony_normal.anisotropy  = renderer.getMaxAnisotropy();
	texture_balcony_normal.repeat.set( 2, 4 );

	texture_balcony.wrapS = THREE.RepeatWrapping;
	texture_balcony.wrapT = THREE.RepeatWrapping;
	texture_balcony.anisotropy  = renderer.getMaxAnisotropy();
	texture_balcony.repeat.set( 2, 4 );

	
	//Textures and normals for brick_window image
	THREE.ImageUtils.crossOrigin = '';
	var texture_brick_window = new THREE.ImageUtils.loadTexture('./img/brick_window.jpg');
	var texture_brick_window_normal = new THREE.ImageUtils.loadTexture('./img/brick_window_normal_map.png');

	texture_brick_window_normal.wrapS = THREE.RepeatWrapping;
	texture_brick_window_normal.wrapT = THREE.RepeatWrapping;
	texture_brick_window_normal.anisotropy  = renderer.getMaxAnisotropy();
	texture_brick_window_normal.repeat.set( 4, 10 );

	texture_brick_window.wrapS = THREE.RepeatWrapping;
	texture_brick_window.wrapT = THREE.RepeatWrapping;
	texture_brick_window.anisotropy  = renderer.getMaxAnisotropy();
	texture_brick_window.repeat.set( 4, 10 );

	
	//Textures and normals for flat_gray_windows image
	THREE.ImageUtils.crossOrigin = '';
	var texture_flat_grey_windows = new THREE.ImageUtils.loadTexture('./img/flat_grey_windows.jpg');
	var texture_flat_grey_windows_normal = new THREE.ImageUtils.loadTexture('./img/flat_grey_windows_normal_map.png');

	texture_flat_grey_windows_normal.wrapS = THREE.RepeatWrapping;
	texture_flat_grey_windows_normal.wrapT = THREE.RepeatWrapping;
	texture_flat_grey_windows_normal.anisotropy  = renderer.getMaxAnisotropy();
	texture_flat_grey_windows_normal.repeat.set( 3, 6 );

	texture_flat_grey_windows.wrapS = THREE.RepeatWrapping;
	texture_flat_grey_windows.wrapT = THREE.RepeatWrapping;
	texture_flat_grey_windows.anisotropy  = renderer.getMaxAnisotropy();
	texture_flat_grey_windows.repeat.set( 3, 6 );

	
	//Textures and normals for glass image
	THREE.ImageUtils.crossOrigin = '';
	var texture_glass = new THREE.ImageUtils.loadTexture('./img/glass.jpg');
	var texture_glass_normal = new THREE.ImageUtils.loadTexture('./img/glass_normal_map.png');

	texture_glass_normal.wrapS = THREE.RepeatWrapping;
	texture_glass_normal.wrapT = THREE.RepeatWrapping;
	texture_glass_normal.anisotropy  = renderer.getMaxAnisotropy();
	texture_glass_normal.repeat.set( 3, 6 );

	texture_glass.wrapS = THREE.RepeatWrapping;
	texture_glass.wrapT = THREE.RepeatWrapping;
	texture_glass.anisotropy  = renderer.getMaxAnisotropy();
	texture_glass.repeat.set( 3, 6 );

	
	//Textures and normals for windows_grey image
	THREE.ImageUtils.crossOrigin = '';
	var texture_windows_grey = new THREE.ImageUtils.loadTexture('./img/windows_grey.jpg');
	var texture_windows_grey_normal = new THREE.ImageUtils.loadTexture('./img/windows_grey_normal_map.png');

	texture_windows_grey_normal.wrapS = THREE.RepeatWrapping;
	texture_windows_grey_normal.wrapT = THREE.RepeatWrapping;
	texture_windows_grey_normal.anisotropy  = renderer.getMaxAnisotropy();
	texture_windows_grey_normal.repeat.set( 2, 5 );

	texture_windows_grey.wrapS = THREE.RepeatWrapping;
	texture_windows_grey.wrapT = THREE.RepeatWrapping;
	texture_windows_grey.anisotropy  = renderer.getMaxAnisotropy();
	texture_windows_grey.repeat.set( 2, 5 );


	//Textures created for buildings in day
	var textureDay		= new THREE.Texture( generateTextureCanvas(false, "#ffffff") );
	textureDay.anisotropy	= renderer.getMaxAnisotropy();
	textureDay.needsUpdate	= true;


	//Textures created for buildings in night
	var textureNight		= new THREE.Texture( generateTextureCanvas(true, "#3D3D3B",50) );
	textureNight.anisotropy	= renderer.getMaxAnisotropy();
	textureNight.needsUpdate	= true;


	//Textures created for buildings in deep night responsible for turning on more lights
	var textureNightDeep		= new THREE.Texture( generateTextureCanvas(true, "#3D3D3B",3) );
	textureNightDeep.anisotropy	= renderer.getMaxAnisotropy();
	textureNightDeep.needsUpdate	= true;
	//----------------------------------------------------------------------------------------------------




	//-------------------------------CREATING MATERIALS FOR MESHES-----------------------------------------
	// Material for mesh day
	var materialDay	= new THREE.MeshLambertMaterial({
		map		: textureDay,
		vertexColors	: THREE.VertexColors,
	});

	// Material for mesh night
	var materialNight	= new THREE.MeshLambertMaterial({
		map		: textureNight,
		vertexColors	: THREE.VertexColors,
		emissive: "white"	//necessary to see buildings in night. It create ilusion that window lights illuminate the city
	});

	// Material for mesh deep night
	var materialNightDeep	= new THREE.MeshLambertMaterial({
		map		: textureNightDeep,
		vertexColors	: THREE.VertexColors,
		emissive: "white"	//necessary to see buildings in night. It create ilusion that window lights illuminate the city
	});

	// Material for mesh balcony
	var materialTexture1 = new THREE.MeshPhongMaterial({
		map		: texture_balcony,
		vertexColors	: THREE.VertexColors,
		normalMap: texture_balcony_normal,
	});

	// Material for mesh brick_window
	var materialTexture2	= new THREE.MeshPhongMaterial({
		map		: texture_brick_window,
		vertexColors	: THREE.VertexColors,
		normalMap: texture_brick_window_normal,
	});
		
	// Material for mesh texture_flat_grey_windows
	var materialTexture3	= new THREE.MeshPhongMaterial({
		map		: texture_flat_grey_windows,
		vertexColors	: THREE.VertexColors,
		normalMap: texture_flat_grey_windows_normal,
	});

	// Material for mesh glass
	var materialTexture4	= new THREE.MeshPhongMaterial({
		map		: texture_glass,
		vertexColors	: THREE.VertexColors,
		normalMap: texture_glass_normal,
	});

	// Material for mesh windows_grey texture
	var materialTexture5	= new THREE.MeshPhongMaterial({
		map		: texture_windows_grey,
		vertexColors	: THREE.VertexColors,
		normalMap: texture_windows_grey_normal,
	});
	//----------------------------------------------------------------------------------------------------




	//------------------------COMBINING MESHES WITH MATERIALS AND ADDING THEM TO SCENE--------------------------------------
	meshDay = new THREE.Mesh(cityGeometry, materialDay );
	meshDay1 = new THREE.Mesh(cityGeometry_texture1, materialTexture1 );
	meshDay2 = new THREE.Mesh(cityGeometry_texture2, materialTexture2 );
	meshDay3 = new THREE.Mesh(cityGeometry_texture3, materialTexture3 );
	meshDay4 = new THREE.Mesh(cityGeometry_texture4, materialTexture4 );
	meshDay5 = new THREE.Mesh(cityGeometry_texture5, materialTexture5 );
	meshNight = new THREE.Mesh(cityGeometry, materialNight );
	meshNightDeep = new THREE.Mesh(cityGeometry, materialNightDeep );
	scene.add(meshDay);
	scene.add(meshDay1);
	scene.add(meshDay2);
	scene.add(meshDay3);
	scene.add(meshDay4);
	scene.add(meshDay5);

	return meshDay
	//-----------------------------------------------------------------------------------------------------





	function generateTextureCanvas(Night, building_color, lights_number){
		// build a small canvas 32x64 and paint it in white
		var canvas	= document.createElement( 'canvas' );
		canvas.width	= 32;
		canvas.height	= 64;
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
				//Generate buildings light if you use this function for buildings in night
				if(Night){
					//Here is defined how many lights code will generate
					if(x%lights_number == Math.floor(Math.random()*Math.random()*20)){
						//To obtain different colors of windows it is necessary to ad another variable that gets random values from 0 to 1 
						light_color = Math.random();
						if(light_color>0 && light_color<0.2){
							context.fillStyle	= '#FFFAB2';
							context.fillRect( x, y, 2, 1 );
						}else if(light_color>0.2 && light_color<0.4){
							context.fillStyle	= '#FFEC88';
							context.fillRect( x, y, 2, 1 );
						}else if(light_color>0.4 && light_color<0.6){
							context.fillStyle	= '#FFFCD6';
							context.fillRect( x, y, 2, 1 );
						}else if(light_color>0.6 && light_color<0.8){
							context.fillStyle	= '#FFFC46';
							context.fillRect( x, y, 2, 1 );
						}else if(light_color>0.8 && light_color<0.99){
							context.fillStyle	= '#FFF000';
							context.fillRect( x, y, 2, 1 );
						}else{
							context.fillStyle	= '#FF0000';
							context.fillRect( x, y, 2, 1 );
						}
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

// Seting HSL values
var back_fog_color = 260;
var back_fog_saturation = 100; 
var back_fog_lightness = 95;
	
requestAnimationFrame(function animate(nowMsec){
	// keep looping
	requestAnimationFrame( animate );
	// Defining speed of animate sun movement
	var sun_location = 0.01*nowMsec;

	//creating circular sun movement
	var sinus_y_position = Math.sin(sun_location * Math.PI / 180);
	var cosinus_x_position = Math.cos(sun_location * Math.PI / 180);

	//data normalization
	dirLight.position.y = 1000 * sinus_y_position;
	dirLight.position.x = 1000 * cosinus_x_position;
	light.position.y = dirLight.position.y;
	light.position.x = dirLight.position.x;

	//DAY
	if (sinus_y_position > 0.4 ){
		//defining value for intensity
		var f = 1;

		//adding and deleting appropriate scenes
		scene.remove(meshNightDeep);
		scene.remove(meshNight);
		scene.add(meshDay);

		//assigning intensity background color, fog color, and light color
		dirLight.intensity = f;
		light.intensity = f*0.8;
		document.body.style.backgroundColor = "hsl("+back_fog_color+", "+back_fog_saturation+"%, "+back_fog_lightness+"%)";
		scene.fog.color.setHSL( back_fog_color/360, back_fog_saturation/100, back_fog_lightness/100 );
		light.color.setHSL( 0.131, 1, 0.8 );
	}
	//EVENING | MORNING
	else if (sinus_y_position < 0.4 && sinus_y_position > 0.0 )
	{
		//adding and deleting appropriate scenes so that nightlights continue to shine early in the morning or before night
		if(sinus_y_position>0.15){
			scene.remove(meshNightDeep);
			scene.remove(meshNight);
			scene.add(meshDay);
		}
		else if(sinus_y_position<0.15){
			scene.remove(meshNightDeep);
			scene.add(meshNight);
			scene.remove(meshDay);
		}

		//defining value for intensity
		var f = 2.5*sinus_y_position;

		//assigning intensity background color, fog color, and light color
		//Here intensity is dependent on sun position -> var lightness
		dirLight.intensity = f;		
		light.intensity = f*0.8;
		multiplicator = back_fog_lightness/40 	//normalization
		var lightness = multiplicator*sinus_y_position*100;
		document.body.style.backgroundColor = "hsl("+back_fog_color+", "+back_fog_saturation+"%, "+lightness+"%)";
		scene.fog.color.setHSL( back_fog_color/360, back_fog_saturation/100, lightness/100);
		light.color.setHSL( 0.09, 1, 2*sinus_y_position );

	}
	//NIGHT
	else
	{
		//adding and deleting appropriate scenes
		scene.remove(meshNight)
		scene.add(meshNightDeep);
		
		//defining value for intensity
		var f = sinus_y_position;
		dirLight.intensity = f;
		light.intensity = f;

		//If there is very late reduce the number of glowing windows to imitate that people are going to sleep
		if(sinus_y_position<-0.70){
			scene.add(meshNight)
			scene.remove(meshNightDeep);
		}

	}
	//console.log(sinus_y_position)

	lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
	var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
	lastTimeMsec	= nowMsec
	// call each update function
	updateFcts.forEach(function(updateFn){
		updateFn(deltaMsec/1000, nowMsec/1000)
	})
})