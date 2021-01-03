var pic;
var stroke1;
var which = "normal";

var contrast = 3;
var maxdist = Number(15*15);
var lineWidth = Number(3);
var smoothness=50;

var width=Number(800);
var canvas=document.getElementById('canvas')


//Loading image on canvas
document.getElementById('inp').onchange = function(e) {
  var img = new Image();
  img.onerror = failed;
  img.src = URL.createObjectURL(this.files[0]);
  img.onload = function(){
    pic=new imgc(img,canvas,width,contrast);
    stroke1=new strokec(canvas, maxdist, lineWidth);
    setupcontrols();
    }

};
function failed() {
  console.error("The provided file couldn't be loaded as an Image media");
}


//controls
function setupcontrols(){
  document.getElementById('picture').onclick = function(){pic.draw("normal");stroke1.draw();which="normal"};
  document.getElementById('sobel').onclick = function(){pic.draw("sobel");stroke1.draw();which="sobel"};
  document.getElementById('apply').onclick = function(){stroke1.apply(pic); pic.draw(which); stroke1.draw(); console.log("applied");};
  document.getElementById('smooth').onclick = function(){stroke1.smooth(smoothness,2*2); pic.draw(which); stroke1.draw(); console.log("smooth");};
  document.getElementById('undo').onclick = function(){pic.draw(which); stroke1.undo();  stroke1.draw(); console.log("undone");};
  document.getElementById('reset').onclick = function(){stroke1.reset();pic.draw(which);};

  document.getElementById("Threshold").onchange=function(){
    pic.threshold=document.getElementById('Threshold').value;
    console.log(pic.threshold)
  }

  document.getElementById("max").onchange=function(){
    if(!document.getElementById("max").checked)stroke1.maxdist=maxdist;else stroke1.maxdist=1000*1000;
    console.log('maxdist changed');}

  document.getElementById('dl').onclick=function(){
    var dt = canvas.toDataURL('image/png');
    dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
    dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');
    this.href = dt;
  }
  document.addEventListener('mousemove', draw);
  document.addEventListener('mousedown', setPosition);
  document.addEventListener('mouseenter', setPosition);
}


//draw
var pos = { x: 0, y: 0 };
// new position from mouse event
function setPosition(e) {
  pos.x = e.pageX - canvas.offsetLeft;
  pos.y = e.pageY - canvas.offsetTop;
}

var notbrek=1;
function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1) {
      if(notbrek)
        stroke1.arr.push({x:-1,y:-1});
      notbrek = 0;
      return};
  // begin
  var ctx=canvas.getContext('2d')
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#AAAAFF';
  //move
  ctx.moveTo(pos.x, pos.y); // from
  setPosition(e);

  if(pos.x>canvas.width || pos.y>canvas.height){
    if(notbrek)
      stroke1.arr.push({x:-1,y:-1});
    notbrek=0;
    return;}

  notbrek=1;
  ctx.lineTo(pos.x, pos.y); // to
  ctx.stroke(); // draw it!
  //store
  stroke1.arr.push({x:pos.x,y:pos.y});
}
