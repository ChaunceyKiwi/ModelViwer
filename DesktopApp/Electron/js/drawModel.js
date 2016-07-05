  var container, stats, controls, object;
  var camera, scene, renderer;
  var mouseX = 0, mouseY = 0;
  var width = document.getElementById("ModelSpace").offsetWidth;
  var height = window.innerHeight/2;
  var mapWidth = width * 0.8 * 10 / 12 * 0.95;
  var videoWidth = width * 0.6;
  var eyePos, viewPos;
  var maxEyeHeight = 300 , maxViewHeight = 300;
  var initialEyeHeight = 150;
  var geometry = new THREE.SphereGeometry( 2, 32, 32 );
  var geometry2 = new THREE.SphereGeometry( 1, 32, 32 );
  var material1 = new THREE.MeshBasicMaterial( {color: 0xFFC02B} );
  var material2 = new THREE.MeshBasicMaterial( {color: 0x2BB8FF} );
  var material3 = new THREE.MeshBasicMaterial( {color: 0xFF0000} );
  var materialGreen = new THREE.MeshBasicMaterial( {color: 0x00FF00} );


  var cameraOrAt = 0; // 0 to put camera, 1 to put position look at.
  var mxInModel_camera;
  var myInModel_camera;
  var mzInModel_camera;
  var mxInModel_LookAt;
  var myInModel_LookAt;
  var mzInModel_LookAt;

  var lineIndex = 0;
  var drawCount = 0;
  var drawCountLooAt = 0;

  var MAX_POINTS = 100;
  var newPoint = [];
  var newPointLookAt = [];
  var geometryOfLine = new THREE.BufferGeometry();
  var positionsOfLine = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
  geometryOfLine.addAttribute( 'position', new THREE.BufferAttribute( positionsOfLine, 3 ) );
  geometryOfLine.setDrawRange( 0, drawCount );
  var materialOfLine = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 2 } );
  var line = new THREE.Line( geometryOfLine,  materialOfLine );
  
  var addTraceMode = 0;
  var radius;
  var circle_x, circle_y;



  var cameraChange = function(slideEvt) {
    camera.position.z = maxEyeHeight - slideEvt.value;
    eyePos.position.z = maxEyeHeight - slideEvt.value;

  };

  var viewChange = function(slideEvt) {
    viewPos.position.z = maxViewHeight - slideEvt.value;
  };

  var heightCamera = $("#heightCamera").slider().on('slide', cameraChange);
  var heightView = $("#heightView").slider().on('slide',viewChange);

  document.getElementById("canvas").height = height;
  document.getElementById("canvas").width = mapWidth;
  document.getElementById("videoFrame").height = height;
  document.getElementById("videoFrame").width = videoWidth;

  init();
  animate();

  function init() {
    container = document.createElement( 'modelViewer' );
    document.getElementById("ModelSpace").appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, width / height, 1, 100000 );
    camera.position.z = initialEyeHeight;

    // scene
    scene = new THREE.Scene();

    var light1 = new THREE.PointLight( 0xffffff, 1);
    light1.position.set(178.69, -15.43, 108.97);
    scene.add( light1 );

    var light2 = new THREE.PointLight( 0xffffff, 1);
    light2.position.set(-227.92, -118.25, -29.05);
    scene.add( light2 );

    var light3 = new THREE.PointLight( 0xffffff, 1);
    light3.position.set(94.86, 143.11, -52.78);
    scene.add( light3 );

    // texture
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
      console.log( item, loaded, total );
    };

    // model
    var loader2 = new THREE.OBJLoader( manager );
    loader2.load( 'models/house.obj', function ( object ) {
      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          //child.material.map = texture;
        }
      } );
      scene.add( object );
    } );

    viewPos = new THREE.Mesh( geometry, material1 );
    eyePos = new THREE.Mesh( geometry, material2 );

    scene.add( eyePos );
    scene.add( viewPos );

    camera.up.copy(new THREE.Vector3(0, 0, 1));
    camera.lookAt(new THREE.Vector3(viewPos.position.x,viewPos.position.y,viewPos.position.z));

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    controls = new THREE.TrackballControls( camera,container);

    controls.rotationDampening        = .98;
    controls.zoom                     = 40;
    controls.zoomDampening            = .6;
    controls.zoomCutoff               = .9;
    controls.minZoom                  = 20;
    controls.maxZoom                  = 80;
    controls.zoomSpeed = 1;
    controls.rotationSpeed            = 40;
    controls.panSpeed = 0.24;

    renderer.setClearColor( 0xa0a0a0 );
  }

  function onWindowResize() {
    width = document.getElementById("ModelSpace").offsetWidth;
    height = window.innerHeight/2;
    mapWidth = width * 0.8 * 10 / 12 * 0.95;
    videoWidth = width * 0.6;
    camera.aspect =  width/ height;
    document.getElementById("canvas").height = height;
    document.getElementById("canvas").width = mapWidth;
    document.getElementById("videoFrame").height = height;
    document.getElementById("videoFrame").width = videoWidth;
    initViewPoint();
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
    line.geometry.attributes.position.needsUpdate = true; // required after the first render
  }

  function addPoint(x, y, z, x2, y2, z2){
    newPoint[drawCount] = new THREE.Mesh( geometry2, material3);
    newPoint[drawCount].position.x = x;
    newPoint[drawCount].position.y = y;
    newPoint[drawCount].position.z = z;

    newPointLookAt[drawCountLooAt] = new THREE.Mesh( geometry2, materialGreen);
    newPointLookAt[drawCountLooAt].position.x = x2;
    newPointLookAt[drawCountLooAt].position.y = y2;
    newPointLookAt[drawCountLooAt].position.z = z2;

    scene.add( newPoint[drawCount] );
    scene.add( newPointLookAt[drawCountLooAt] );

    positionsOfLine[ lineIndex ++ ] = x;
    positionsOfLine[ lineIndex ++ ] = y;
    positionsOfLine[ lineIndex ++ ] = z;
    scene.add( line );
    line.geometry.attributes.position.needsUpdate = true; // required after the first render

    var origin = newPoint[drawCount].position;
    var target = newPointLookAt[drawCountLooAt].position;
    var dir = new THREE.Vector3(target.x - origin.x, target.y - origin.y, target.z - origin.z);
    dir = dir.normalize();

    var length = 10;
    var hex = 0xff0000;

    var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
    scene.add( arrowHelper );

    drawCount++;
    drawCountLooAt++;

    geometryOfLine.setDrawRange( 0, drawCount );
  }

  function render() {
    renderer.render( scene, camera );
    controls.update();
    camera.lookAt(new THREE.Vector3(viewPos.position.x,viewPos.position.y,viewPos.position.z));
  }