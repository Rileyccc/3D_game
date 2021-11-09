// load in matrix objects
const { vec2, vec3, mat3, mat4 } = glMatrix;

// define gama atributes
var NUMBEROFBAC = 20;
var LIVES = 2;
var numOfBac = 20;
var bacLimit = 5;
var bacteriae = [];
var clicks = []
var score = 0;
var particles = [];
var lives = 2;


// define main playing surface coordinates and radius size, and color
var X = 0;
var Y = 0;
var Z = 0;
var R = 0.8;
var COLOR = [0.4,.4,.4];




window.onload = function init()
{
    // get canvas from html doc
    var canvas = document.getElementById('canvas');

    // get a div for displaying game text
    var scoreboard = document.getElementById('scoreboard');
    // get scoreboard elements
    var scoreOut = document.getElementById('score');
    var life1 = document.getElementById('life1');
    var life2 = document.getElementById('life2');
    var numOfBacOut = document.getElementById('bacLeft');


    var gl = canvas.getContext('webgl')
    if ( !gl ) { 
        alert( "WebGL isn't available");
     	gl = canvas.getContext('experimental-webgl');
    }
    if (!gl){
        alert('your browser does not support webgl');
    }
    
    //set canvas size
    canvas.width = window.innerHeight-200;
	canvas.height = window.innerHeight-200;

    // set scoreboard width and height
    scoreboard.style.width = canvas.width + "px"; 
    scoreboard.style.height = '100px';
    
    //set web gl viewport size
	gl.viewport(0,0,canvas.width,canvas.height);
    
    // clear canvas
    gl.clearColor(0.5,0.8,0.8,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    //create and bind vertexBuffer
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);


    // get shaders from html
    var vertShaderText = document.getElementById("vertex-shader").text;
    var fragShaderText = document.getElementById("fragment-shader").text;
	
    // create shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    // bind shaders to shaders text
    gl.shaderSource(vertexShader, vertShaderText);
    gl.shaderSource(fragmentShader, fragShaderText);

    // compile vertex shader
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error("error compiling the vertex shader!", gl.getShaderInfoLog(vertexShader));
        return;
    }

    // compile fragmentShader
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error("error compiling the fragement shader!" + gl.getShaderInfoLog(fragmentShader));
        return;
    }

    // create a program
    var program = gl.createProgram();

    // add shaders to program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // link program to webgl
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error('error linking the program', gl.getProgramInfo(program) );
        return;
    }


   	//////////////////////////////////
	//     buffer    //
	//////////////////////////////////

    // Create and store data into vertex buffer
    var vertex_buffer = gl.createBuffer ();
     
    

    // Create and store data into color buffer
    var color_buffer = gl.createBuffer ();
    

    // Create and store data into index buffer
    var index_buffer = gl.createBuffer ();
    

	//all arrays in JS is Float64 by default
	// Create and store data into vertex buffer

	var positionAttribLocation = gl.getAttribLocation(program,'position');
	var colorAttribLocation = gl.getAttribLocation(program,'color');
	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.vertexAttribPointer(
		positionAttribLocation, //attribute location
		3, //number of elements per attribute
		gl.FLOAT, 
		gl.FALSE,
		0,
		0
		);
	gl.enableVertexAttribArray(positionAttribLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
	gl.vertexAttribPointer(
		colorAttribLocation, //attribute location
		3, //number of elements per attribute
		gl.FLOAT, 
		gl.FALSE,
		0,
		0
		);
	gl.enableVertexAttribArray(colorAttribLocation);

	gl.useProgram(program);

    // get attributes locations from shader programs
    var positionAttribLocation = gl.getAttribLocation(program,'vertPosition');
	
	gl.enable(gl.DEPTH_TEST);






    //////////////////////////////////
	//            matrics           //
	//////////////////////////////////
	
	var world = new Float32Array(16);
	mat4.identity(world);
	//var rot = new Float32Array(16);
	//var trans = new Float32Array(16);
	//mat4.identity(rot);
	//mat4.identity(trans);
	//var x = -2;
	//var angle = glMatrix.glMatrix.toRadian(45);
	//mat4.fromRotation(rot,angle,[0,0,1]);
	//mat4.fromTranslation(trans,[x,0,0]);
	//mat4.multiply(world,trans,rot);

	var view = new Float32Array(16);
	mat4.lookAt(view, [0,0,5], [0,0,0],[0,1,0])

	var proj = new Float32Array(16);
	mat4.perspective(proj,glMatrix.glMatrix.toRadian(45),canvas.width/canvas.height,0.1,100);

    //////////////////////////////////
	//    send to vertex shader     //
	//////////////////////////////////
	
	//get the address of each matrix in the vertex shader
	var matWorldUniformLocation = gl.getUniformLocation(program, 'world');
	var matViewUniformLocation = gl.getUniformLocation(program, 'view');
	var matProjUniformLocation = gl.getUniformLocation(program, 'proj');

	//send each matrix to the correct location in vertex shader
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, world);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, view);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, proj);

	var angle = 0;
	var rotz = new Float32Array(16);
	var rotx = new Float32Array(16);
	
	mat4.identity(rotx);
	mat4.identity(rotx);



    function drawSphere(x,y,z,r,color) {

		var vertices = [];
		var colors = [];
		var indexes = [];

		degrees = 360;


		for (var i=0; i <= degrees; i++) {
            var phi = i *  Math.PI/180; 
			for (var j=0; j <= degrees; j++) {
                

				
                var theta = j * Math.PI/180;  
                // push point to sphere
                vertices.push(r * Math.sin(phi) * Math.cos(theta) + x, r * Math.sin(phi)* Math.sin(theta) + y, r * Math.cos(phi) + z);


				colors.push(color[0], color[1], color[2]);

				var first = (j * (degrees + 1)) + i;
				var second = first + degrees + 1;
				
                indexes.push(first, second, first + 1);

				indexes.push(second, second + 1, first + 1);
			}
		}
        // bind vertex buffer and add vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // bind color buffer and add colours
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        // bind index buffer and add indexes
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	    gl.drawElements(gl.TRIANGLES, indexes.length, gl.UNSIGNED_SHORT, 0);

	};

    drawSphere(X,Y,Z,R, COLOR);
}