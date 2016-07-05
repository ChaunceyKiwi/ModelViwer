    var net = require('net');
    var client = new net.Socket();

    function connect(){
        client.connect(60002, '127.0.0.1', function() {
            smalltalk.alert('Feedback:',"Connection is built!").then(function() {
                console.log('ok');
            }, function() {
                console.log('cancel');
            });
        });
    }


    // client.on('close', function() {
    //     console.log('Connection closed');
    // });

    client.on('data', function(data) {
        console.log('Received: ' + data);
        if((""+data) === "Done!"){
            smalltalk.alert('Feedback:', data + " Click next to show result.").then(function() {
                console.log('ok');
            }, function() {
                console.log('cancel');
            });
        }
        // client.destroy(); // kill client after server's response
    });

    function process(){
        const {dialog} = require('electron').remote;
        var addr = dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']});
        client.write("" + addr);
    }

    function next(){
    // texture
    var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
          console.log( item, loaded, total );
    };

    // model
    var loader = new THREE.OBJLoader( manager );
    loader.load( 'models/square.obj', function ( object ) {
      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          //child.material.map = texture;
        }
      } );
      scene.add( object );
    } );
    }

    function sendAddress(addr){
        client.write("" + addr);
    }

    function takeOff(){
        client.write("takeOff");

    }

    function hovering(){
        client.write("hovering");

    }

    function landing(){
        client.write("landing");
    }

    function initPath(){
        smalltalk.prompt('Prompt', 'Please enter the radius', '1').then(function(value) {
            radius = value;
        }, function() {
            radius = 1;
        })

        addTraceMode = 1;
    }

    var radius;
    var circle_x, circle_y;

    function sendPath(){
        client.write("Radius:" + radius + ", Position: (" + circle_x +","+ circle_y+").");
    }
