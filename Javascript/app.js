// load in matrix objects
const { vec2, vec3, mat3, mat4 } = glMatrix;

// define gama atributes
var NUMBEROFBAC = 20;
var LIVES = 2;
var numOfBac = 20;
var bacLimit = 5;
var bacteriae = [];
var clicks_color =  [];
var score = 0;
var particles = [];
var lives = 2;
var rotation = false;
var rotation_values;


// define main playing surface coordinates and radius size, and color
var X = 0;
var Y = 0;
var Z = 0;
var R = 0.8;
var COLOR = [1, 1, 1];




window.onload = function init()
{
    ////////////////////
    // Bacteria Class //
    ////////////////////
    
    // get a div for displaying game text
    var scoreboard = document.getElementById('scoreboard');
    // get scoreboard elements
    var scoreOut = document.getElementById('score');
    var life1 = document.getElementById('life1');
    var life2 = document.getElementById('life2');
    var numOfBacOut = document.getElementById('bacLeft');
    
    
    
    
    /////////////////////
    // Initialize gl ///
    ////////////////////
    
    // get canvas from html doc
    var canvas = document.getElementById('canvas');

    var gl = canvas.getContext('webgl', {preserveDrawingBuffer: true})
    if ( !gl ) { 
        alert( "WebGL isn't available");
     	gl = canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true});
    }
    if (!gl){
        alert('your browser does not support webgl');
    }
    
    //set canvas size
    canvas.width = window.innerHeight-200;
	canvas.height = window.innerHeight-200;

    // get bounding box for offset of canvas. to find (x, y) orgin of canvas 
    var offset = canvas.getBoundingClientRect();

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


   	///////////////////
	////   Buffer  ////
	///////////////////

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



    function drawSphere(x,y,z,r,color, degrees) {

		var vertices = [];
		var colors = [];
		var indexes = [];
		

		for (var i=0; i <= degrees; i++) {
            var phi = i *  Math.PI/(degrees/2); 
			for (var j=0; j <= degrees; j++) {
                
                var theta = j * Math.PI/(degrees/2);  
                // push point to sphere
                vertices.push(r * Math.sin(phi) * Math.cos(theta) + x, r * Math.sin(phi)* Math.sin(theta) + y, r * Math.cos(phi) + z);


				colors.push(color[0], color[1], color[2]);

                // stops the last indexes added having connecting trianges to other spheres
                if(i != degrees && j != degrees){
                    var first = (i * (degrees + 1)) + j;
                    var second = first + degrees + 1;
                    
                    indexes.push(first, second, first + 1);

                    indexes.push(second, second + 1, first + 1);
                }
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

    
    ////////////////////
    // Bacteria Class //
    ////////////////////

    class Bacteria{

        constructor(){
            // spawn point
            this.x;
            this.y;
            this.z;
            //initial radius
            this.r = .1;
            this.color = [(Math.random()*1).toFixed(2), (Math.random()*1).toFixed(2), (Math.random()*1).toFixed(2)]
            this.consummed = false;
            //this.comsummer = false;

        }

        create(){
            // generate arbitrary points on main sphere for bacteria starting position
            var rand1 = Math.random()*360
            var rand2 = Math.random()*360
            this.x = R * Math.sin(rand2) * Math.cos(rand1)+X;
            this.y = R * Math.sin(rand2) * Math.sin(rand1)+Y;
            this.z = R * Math.cos(rand2)+ Z;

            for(var i = 0; i < bacteriae.length; i++){
                // make sure bacteria don't hit on creation
                if(isColliding(this.x, this.y, this.z,  this.r, bacteriae[i].x, bacteriae[i].y, bacteriae[i].z, bacteriae[i].r))
                    return false;
            }

            return true;

        }

        update(){
            if(this.consummed){
                this.consumed();
                return;
            }
            for(var i = 0; i < bacteriae.length; i++){
                // check if bacteria are colliding
                if(isColliding(this.x, this.y, this.z,  this.r, bacteriae[i].x, bacteriae[i].y, bacteriae[i].z, bacteriae[i].r)){
                    if(this.r < bacteriae[i].r){
                        //bacteriae[i].comsummer = true;
                        this.consummed = true;
                        var distx = bacteriae[i].x - this.x;
                        var disty = bacteriae[i].y - this.y ;
                        var distz = bacteriae[i].z - this.z

                    
                        // normalize speed so x and y cordinates are the same as consummer function calls 20 iterations
                        this.xMove = distx/100;
                        this.yMove = disty/100;
                        this.zMove = distz/100
                        this.consumeNum = 0;
                    }
                }

                this.r += 0.0001;

                    
            }
        }
        //when being consumed bacteria shrinks and moves into comsumer
        consumed(){
            if(this.consumeNum == 100){
                this.r -= 0.01    
            }else{
                this.r -= 0.001;
                this.x += this.xMove;
                this.y += this.yMove;
                this.consumeNum++;
            }
            if(this.r <= 0){
                this.destroy();
            }
        }
        // when eating a bacteria the bacteria eating grows faster
        // consumer(){


        // }


        destroy(){
            score += Math.ceil((.2 - this.r) * 150);
            numOfBac--;
            this.x =0;
            this.y =0;
            this.r =0;
            this.z =0;
            this.removeMe = true;

        }

    }

    ////////////////////
    // Rotation Class //
    ////////////////////
    class Rotation{
        constructor(rotAngle1, rotAngle2){
            this.rotAngle1 = rotAngle1;
            this.rotAngle2 = rotAngle2;
       }
    }


    ////////////////////
    // Particle Class //
    ////////////////////

    class Particle{

        constructor(x, y, z, dx, dy, dz, r, color, moves){
            this.x = x;
            this.y = y;
            this.z = z;
            this.r = r;
            this.color = color;
            this.moves = moves; 
            this.dx = dx;
            this.dy = dy; 
            this.dz = dz;
        }

        update(){
            if(this.moves <= 0){
                this.destroy();
            }
            this.x += this.dx;
            this.y += this.dy;
            this.z += this.dz;
            this.color[3] -=0.01 ;
            this.moves--;
        }
        

        destroy(){
            this.x =0;
            this.y =0; 
            this.r =0;
            this.z =0;
            this.removeMe = true;
        }
    }
    
    ////////////////////
    //// Functions  ////
    ////////////////////
    
    // calculate Euclidean distance between 2 points in 3d space
    
    function distance(x1, y1, z1, x2, y2, z2){
        return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2) + Math.pow(z2-z1, 2));
    }


    // is colliding takes in 3d sphere cordinates and radius and checks if they are colliding
    // bacteria are not spheres but the funtion will work the same because collisions will always ouccur on the main sphere
    
    function isColliding(x1, y1, z1, r1, x2, y2, z2, r2){
        // find distance's between radius's
        dist_orgins = distance(x1, y1, z1, x2, y2, z2);
        // find combined radius of sphere 1 and 2
        radius_dist = r1+r2
        
        // combined radius greater than distance between orgins circles are colliding
        if(radius_dist > dist_orgins)
            return true;
        
        return false;
    }


    // Create bacteria ensuring there is no collisions on spawn 
    // then adds them to bacteriae array
    function addBacteria(){
        var bac = new Bacteria();
        test = false;
        while(!test){ 
            test = bac.create();
        }
        bacteriae.push(bac);
    }

    // based on rotation parameters will rotate camerea view
    function rotate(rotAngle1, rotAngle2){
        mat4.fromRotation(rotx, -rotAngle1, [0,0,1]);
        mat4.fromRotation(rotz, rotAngle2, [0,1,0]);
        mat4.multiply(world,rotz,rotx);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, world);  
    }

    //remove heart
    function removeLife(){
        if(lives == 2){
            life1.remove();
            lives--;
            score += -50    
        }else if(lives == 1){
            life2.remove();
            lives--;
            score += -50
        }
    }
    // if won display you won
    function win(){
        // remove canvas 
        canvas.remove();

        // create a new div to replace canvas
        div = document.createElement('div');
        div.setAttribute("id", "game_over")
        div.style.width = canvas.width + "px";
        div.style.height = canvas.height + "px";
        div.classList.add("win");

        // add you lose text
        var paragraph = document.createElement("p");
        paragraph.innerHTML = "You win!";
        div.appendChild(paragraph);
        
        //add button to div
        var button = document.createElement("button");
        button.setAttribute("id", "btn")
        button.appendChild(document.createTextNode("Play Again"));
        button.addEventListener('click', function() {
            resetGame()
        }, false);
        div.appendChild(button);

        // insert game end screen in correct location
       var header = document.getElementById('main_header');
       header.parentNode.insertBefore(div, header.nextSibling)
   }

   // display if you lost
   function lose(){
    // remove canvas 
    canvas.remove();

    // create a new div to replace canvas
    div = document.createElement('div');
    div.setAttribute("id", "game_over")
    div.style.width = canvas.width + "px";
    div.style.height = canvas.height + "px";
    div.classList.add("lose");

    // add you lose text
    var paragraph = document.createElement("p");
    paragraph.innerHTML = "You Lose!";
    div.appendChild(paragraph);
    
    //add button to div
    var button = document.createElement("button");
    button.setAttribute("id", "btn")
    button.appendChild(document.createTextNode("Play Again"));
    button.addEventListener('click', function() {
        resetGame()
    }, false);
    div.appendChild(button);

    // insert game end screen in correct location
    var header = document.getElementById('main_header');
    header.parentNode.insertBefore(div, header.nextSibling)
    }

    // create particles 
    function create_particles(bacX, bacY, bacZ, bacColor){
        var numOfParticles = 10 + Math.random()*20;
        for(var i =0; i < numOfParticles; i++){

            // randomly generate a positive or negitive num
            var posOrNeg1 = Math.random() < 0.5 ? -1 : 1;
            var posOrNeg2 = Math.random() < 0.5 ? -1 : 1;
            var posOrNeg3 = Math.random() < 0.5 ? -1 : 1;

            //shift particles slightly in an random direction
            var x = bacX + (Math.random() *.02 * posOrNeg1);
            var y = bacY + (Math.random() *.02 * posOrNeg2);
            var z = bacZ + (Math.random() *.02 * posOrNeg3);

            // generate rate of change for x and y direction of particles
            dx = Math.random() *.009 * posOrNeg1;
            dy = Math.random() *.009 * posOrNeg2;
            dz = Math.random() *.009 * posOrNeg3;

            
            // generate random radius
            var r = Math.random() * .02;

            // generate random transparentcy change
            var color = [bacColor[0], bacColor[1], bacColor[2], 1 * Math.random()]

            // generate num of moves
            var moves = Math.random() * 50

            particles.push(new Particle(x, y, z, dx, dy, dz, r, color,moves));
        }
    }
    // checks if click color is equal to bacteria color
    // color two is a in byte form 
    function colorCheck(color1, color2){
        return color1[0] == (color2[0]/255).toFixed(2) && color1[1] == (color2[1]/255).toFixed(2) && color1[2] == (color2[2]/255).toFixed(2)

    }


    ////////////////////
    ////  GAME LOOP ////
    ////////////////////

    // rendering loop 
    var loop = function(){
        
        // compares bacteria colors to clicked colors if color is the same remove bacteria
        for(var i = 0; i < clicks_color.length; i++){
            for(var j = 0; j < bacteriae.length; j++){
                if(colorCheck(bacteriae[j].color, clicks_color[i])){
                    create_particles(bacteriae[j].x, bacteriae[j].y, bacteriae[j].z,  bacteriae[j].color)
                    bacteriae[j].destroy();

                }
            }
        }
        //sort bacteriae array if being consumed move to the front
        // bacteriae.sort(function(a){
        //     if (a.consumed){
        //         return -1;
        //     }
        //     return 1;
        // })


        // clear background set colour
        gl.clearColor(0,0,0,1.0);
        // set background color initialy
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

        
        // draw game Sphere
        drawSphere(X,Y,Z,R, COLOR, 50);

        // draw bacteria
        for(var i = 0; i < bacteriae.length; i++){
            bacteriae[i].update();
            drawSphere(bacteriae[i].x, bacteriae[i].y, bacteriae[i].z,bacteriae[i].r ,bacteriae[i].color, 25);
            // if bacteria gets to large before being killed you lose a life
            if(bacteriae[i].r > 0.3){
                bacteriae[i].destroy()
                removeLife();
            }
        }

        // remove dead bacteria
        bacteriae.forEach((bac, index, object) =>{
            if(bac.removeMe == true){
                object.splice(index, 1);
            }
        });
        
        // draw particles
        for(var i = 0; i < particles.length; i++){
            particles[i].update();
            drawSphere(particles[i].x, particles[i].y, particles[i].z, particles[i].r ,particles[i].color, 10);
        }

        // // remove expired particles
        // bacteriae.forEach((bac, index, object) =>{
        //     if(bac.removeMe == true){
        //         object.splice(index, 1);
        //     }
        // });
        



        // add new bacteria if length of bacteria is less than bac limit
        if(bacteriae.length < bacLimit && bacteriae.length < numOfBac){
            addBacteria();
        }

        
        // check winning and losing conditions
        if(lives == 0){
            lose();
            //break loop
            return;
        }
        if(numOfBac == 0){
            win();
            //break loop
            return;
        }



        // //update score and bac remaining
        numOfBacOut.innerHTML = "Bacteria Left: "+ numOfBac;
        scoreOut.innerHTML = "Score: " + score

        // reset clicks color
        clicks_color = [];

        requestAnimationFrame(loop);
    }  

    ///////////////////
    // Mouse Listners//
    ///////////////////

    // listen for a clicks 
    // left click: and records pixel values for pixel clicked
    // right click: set rotation to be true
    canvas.onmousedown = function(ev){
        if(ev.button === 0){
            var pixelValues = new Uint8Array(4);
		    gl.readPixels((ev.clientX - offset.x),canvas.height - (ev.clientY - offset.y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelValues);            
            clicks_color.push(pixelValues);
        }
        if(ev.button === 2){
            rotation = true;
        }
    }

    // if rotation is true call rotate function
    canvas.onmousemove = function(ev){
        if(rotation){
            rotate(ev.clientY/50, ev.clientX/50);
        }
    }

    // Listens for mouse up
    // right click: stop rotation
    canvas.onmouseup = function(ev){
        if(ev.button === 2){
            rotation = false;
        }
    }

    

    ///////////////////
    /// Starts GAME ///
    ///////////////////

    // create initial bacteria
    for(var i = 0; i < bacLimit; i++){
        addBacteria();
    }


    requestAnimationFrame(loop);    


}

function resetGame(){
    // remove game over div
    var div = document.getElementById("game_over");
    div.remove();
    
    // add new canvas to the screen
    var canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas");
    canvas.oncontextmenu = function(ev){
        return false;
    }

    // add canvas back to screen
    var header = document.getElementById('main_header');
    header.parentNode.insertBefore(canvas, header.nextSibling);

    // reset numOfBac and lives
    numOfBac = NUMBEROFBAC;
    lives = LIVES;
    score = 0;

    // re add lifes if needed
    var span = document.getElementById('score');

    var element = document.getElementById("life1");
    try{
        element.remove();
    }catch(e){
        
    }
    //If it isn't "undefined" and it isn't "null", then it exists.
    
    var life1 = document.createElement("img");
    life1.src = "./images/heart.png";
    life1.setAttribute("id", "life1");
    life1.classList.add("health");
    span.parentNode.insertBefore(life1, span.nextSibling);
     
    
    element = document.getElementById("life2");
    // remove if life exist if not continue
    try{
        element.remove();
    }catch(e){
        
    }

    var life2 = document.createElement("img");
    life2.src = "./images/heart.png";
    life2.setAttribute("id", "life2");
    life2.classList.add("health");
    span.parentNode.insertBefore(life2, span.nextSibling);
     
    // empty bateriae and particles
    bacteriae =[];
    particles =[];
    //reset game
    window.onload();
}
