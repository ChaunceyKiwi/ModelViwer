var boxes = []; // holds all our rectangles
var canvas;
var ctx;
var WIDTH;
var HEIGHT;
var INTERVAL = 20;  // how often, in milliseconds, we check to see if a redraw is needed
var isDrag = false;
var mx, my; // mouse coordinates

var EyePosX, EyePosY;
var ViewPosX, ViewPosY;

// when set to true, the canvas will redraw everything
// invalidate() just sets this to false right now
// we want to call invalidate() whenever we make a change
var canvasValid = false;

// The node (if any) being selected.
// If in the future we want to select multiple objects, this will get turned into an array
var mySel;

// we use a fake canvas to draw individual shapes for selection testing
var ghostcanvas;
var gctx; // fake canvas context

// since we can drag from anywhere in a node
// instead of just its x/y corner, we need to save
// the offset of the mouse when we start dragging.
var offsetx, offsety;

// Padding and border style widths for mouse offsets
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

initViewPoint();

//Box object to hold data for all drawn rects
function Box() {
    this.x = 0;
    this.y = 0;
    this.w = 1; // default width and height?
    this.h = 1;
    this.fill = '#444444';
}

//Initialize a new Box, add it, and invalidate the canvas
function addRect(x, y, w, h, fill) {
    var rect = new Box;
    rect.x = x;
    rect.y = y;
    rect.w = w
    rect.h = h;
    rect.fill = fill;
    boxes.push(rect);
    invalidate();
}

// initialize our canvas, add a ghost canvas, set draw loop
// then add everything we want to initially exist on the canvas
function initViewPoint() {
    canvas = document.getElementById('canvas');
    HEIGHT = canvas.height;
    WIDTH = canvas.width;
    ctx = canvas.getContext('2d');
    ghostcanvas = document.createElement('canvas');
    ghostcanvas.height = HEIGHT;
    ghostcanvas.width = WIDTH;
    gctx = ghostcanvas.getContext('2d');

    //fixes a problem where double clicking causes text to get selected on the canvas
    canvas.onselectstart = function () { return false; }

    // fixes mouse co-ordinate problems when there's a border or padding
    // see getMouse for more detail
    if (document.defaultView && document.defaultView.getComputedStyle) {
        stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
        stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
        styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
        styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
    }

    // make draw() fire every INTERVAL milliseconds
    setInterval(draw, INTERVAL);

    // set our events. Up and down are for dragging,
    // double click is for making new boxes
    canvas.onmousedown = myDown;
    canvas.onmouseup = myUp;
    canvas.ondblclick = myDblClick;

    // add custom initialization here:

    // add an orange rectangle
    addRect(150, 170, 10, 10, '#FFC02B');

    // add a smaller blue rectangle
    addRect(200, 300, 10, 10, '#2BB8FF');

    posSync();

}

//wipes the canvas context
function clear(c) {
    c.clearRect(0, 0, WIDTH, HEIGHT);
}


// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function draw() {
    if (canvasValid == false) {
        clear(ctx);

        //Add stuff you want drawn in the background all the time here
        var bg = document.getElementById("mapFrame");

        ctx.drawImage(bg,0,0,mapWidth,height);

        // var eye = document.getElementById("eye");
        // ctx.drawImage(eye,0,0,30,30);

        // draw all boxes
        var l = boxes.length;
        for (var i = 0; i < l; i++) {
            drawshape(ctx, boxes[i], boxes[i].fill);
        }

        drawCircle(ctx, circle_x , circle_y, radius);

        // Add stuff you want drawn on top all the time here
        canvasValid = true;
    }
}

// Draws a single shape to a single context
// draw() will call this with the normal canvas
// myDown will call this with the ghost canvas
function drawshape(context, shape, fill) {
    context.fillStyle = fill;

    // We can skip the drawing of elements that have moved off the screen:
    if (shape.x > WIDTH || shape.y > HEIGHT) return;
    if (shape.x + shape.w < 0 || shape.y + shape.h < 0) return;

    context.fillRect(shape.x,shape.y,shape.w,shape.h);
}

function drawCircle(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2*Math.PI);
    ctx.stroke();
}

// Happens when the mouse is moving inside the canvas
function myMove(e){
    if (isDrag){
        getMouse(e);

        mySel.x = mx - offsetx;
        mySel.y = my - offsety;

        posSync();

        // something is changing position so we better invalidate the canvas!
        invalidate();
    }
}

// Happens when the mouse is clicked in the canvas
function myDown(e){
    getMouse(e);
    clear(gctx);
    var l = boxes.length;
    for (var i = l-1; i >= 0; i--) {
        // draw shape onto ghost context
        drawshape(gctx, boxes[i], 'black');

        // get image data at the mouse x,y pixel
        var imageData = gctx.getImageData(mx, my, 1, 1);

        // if the mouse pixel exists, select and break
        if (imageData.data[3] > 0) {
            mySel = boxes[i];
            offsetx = mx - mySel.x;
            offsety = my - mySel.y;
            mySel.x = mx - offsetx;
            mySel.y = my - offsety;
            isDrag = true;
            canvas.onmousemove = myMove;
            invalidate();
            clear(gctx);
            return;
        }
    }
    // haven't returned means we have selected nothing
    mySel = null;
    // clear the ghost canvas for next time
    clear(gctx);
    // invalidate because we might need the selection border to disappear
    invalidate();
}

function posSync(){
    EyePosX = (boxes[1].x / mapWidth) * 2 - 1;
    EyePosY = boxes[1].y / (window.innerHeight/2) * (-2) + 1;

    ViewPosX = (boxes[0].x / mapWidth) * 2 - 1;
    ViewPosY = boxes[0].y / (window.innerHeight/2) * (-2) + 1;

    eyePos.position.x = EyePosX * 93 ;
    eyePos.position.y = EyePosY * 93 ;
    eyePos.position.z = camera.position.z ;

    camera.position.x = eyePos.position.x;
    camera.position.y = eyePos.position.y;

    viewPos.position.x = ViewPosX * 93 ;
    viewPos.position.y = ViewPosY * 93 ;
}

function myUp(){
    isDrag = false;
    canvas.onmousemove = null;
}

function myDblClick(e) {
    if(addTraceMode == 0) {
        if (cameraOrAt == 0) {
            addRect(mx, my, 10, 10, '#FF0000');
            mxInModel_camera = ((mx / mapWidth) * 2 - 1) * 93;
            myInModel_camera = (my / (window.innerHeight / 2) * (-2) + 1) * 93;
            smalltalk.prompt('Prompt', 'Please enter the height', '1').then(function (value) {
                mzInModel_camera = value;
            }, function () {
                mzInModel_LookAt = 1;
            })

        } else {
            addRect(mx, my, 10, 10, '#00FF00');
            mxInModel_LookAt = ((mx / mapWidth) * 2 - 1) * 93;
            myInModel_LookAt = (my / (window.innerHeight / 2) * (-2) + 1) * 93;
            smalltalk.prompt('Prompt', 'Please enter the height', '1').then(function (value) {
                mzInModel_LookAt = value;
            }, function () {
                mzInModel_LookAt = 1;
            })
            addPoint(mxInModel_camera, myInModel_camera, mzInModel_camera, mxInModel_LookAt, myInModel_LookAt, mzInModel_LookAt);
        }

        cameraOrAt = 1 - cameraOrAt;
    }else if(addTraceMode == 1){
        circle_x = mx;
        circle_y = my;
        addTraceMode = 0;
        invalidate();
    }
}

function invalidate() {
    canvasValid = false;
}

// Sets mx,my to the mouse position relative to the canvas
// unfortunately this can be tricky, we have to worry about padding and borders
function getMouse(e) {
    var element = canvas, offsetX = 0, offsetY = 0;

    if (element.offsetParent) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    offsetX += stylePaddingLeft;
    offsetY += stylePaddingTop;

    offsetX += styleBorderLeft;
    offsetY += styleBorderTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY
}