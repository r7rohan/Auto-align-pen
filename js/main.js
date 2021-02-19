var pic;
var stroke1;
var which = "normal";
var realtime=0;
var usetree = 0;

var contrast = 2;
var maxdist = Number(10);
var lineWidth = Number(3);
var smoothness=50;

var canvas=document.getElementById('canvas');
//mobile
if (window.innerWidth<1000){
    var width=0.5*window.innerWidth
    document.getElementById("text").style.fontSize=0.021*window.innerWidth
    document.getElementById("text").style.lineHeight=0.0021*window.innerWidth
    document.getElementById("controls").style.width = 0.25*window.innerWidth
    document.getElementById("controls").style.fontSize = 0.021*window.innerWidth
    document.getElementById("main").style.width = 0.70*window.innerWidth
    smoothness=20;
    var mode=0;}
else {
    var mode=1;
    var width=0.6*window.innerWidth;}



//Loading image on canvas
document.getElementById('inp').onchange = function(e) {
  var img = new Image();
  img.onerror = failed;
  img.src = URL.createObjectURL(this.files[0]);
  img.onload = function(){
    pic=new imgc(img,canvas,width,contrast);
    stroke1=new strokec(canvas, maxdist, lineWidth);
    if(usetree)
    stroke1.maketree(pic);
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
  document.getElementById('smooth').onclick = function(){stroke1.smooth(smoothness,2*2); pic.draw(which); stroke1.draw(); console.log("smooth");};
  window.oncontextmenu =  function(){stroke1.undo(); pic.draw(which);  stroke1.draw(); console.log("undone");return false;};
  document.getElementById('reset').onclick = function(){stroke1.reset();pic.draw(which);};

  document.getElementById("Threshold").onchange=function(){
    pic.threshold=document.getElementById('Threshold').value;
    if(which == "sobel"){pic.draw("sobel");stroke1.draw();}
    if(usetree)stroke1.maketree(pic);
    console.log(pic.threshold);
  }

  document.getElementById("distance").onchange=function(){
    stroke1.maxdist = Number(document.getElementById("distance").value);
    console.log(stroke1.maxdist);
  }

  document.getElementById("max").onchange=function(){
    if(!document.getElementById("max").checked)stroke1.maxdist=maxdist;else stroke1.maxdist=1000*1000;
    console.log('maxdist changed');}

  document.getElementById("realtime").onchange=function(){
      if(this.checked)realtime=1;else realtime=0;
      console.log('realtime changed');}

  document.getElementById('dl').onclick=function(){
    var dt = canvas.toDataURL('image/png');
    dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
    dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');
    this.href = dt;
  }
  //mouse
  document.addEventListener('mousemove', draw);
  document.addEventListener('mouseup',up);
  //touch
  document.addEventListener('touchmove', draw);
  document.addEventListener('touchend',up);
  canvas.addEventListener("touchstart",  function(event) {event.preventDefault()})
  canvas.addEventListener("touchmove",   function(event) {event.preventDefault()})
  canvas.addEventListener("touchend",    function(event) {event.preventDefault()})
  canvas.addEventListener("touchcancel", function(event) {event.preventDefault()})
}



//draw
var pos = { x: 0, y: 0 };

function setPosition(e) {
  var v=e;
  if(!mode) v = e.targetTouches[0];

  var pos = {x:0,y:0};
  pos.x = v.pageX - canvas.offsetLeft;
  pos.y = v.pageY - canvas.offsetTop;
  return pos;
}

function up(e){
  if(!realtime){
    stroke1.apply(pic);pic.draw(which);stroke1.draw();
  }
  stroke1.push({x:-1,y:-1});
  console.log('up');
}

function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1 && mode) {
      return}
  //avoid repitition
  if(eqlpt(pos,setPosition(e)))return;

  //outside
  if(setPosition(e).x>canvas.width || setPosition(e).y>canvas.height){
    return;}

  // begin
  var ctx=canvas.getContext('2d')
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#AAAAFF';
  //move
  ctx.moveTo(pos.x, pos.y); // from
  pos=setPosition(e);

  //nearest
  if(realtime)
  pos = stroke1.nearest({x:pos.x,y:pos.y},pic);
  ctx.lineTo(pos.x, pos.y); // to

  //only if not start
  if(stroke1.last().x>=0)
  ctx.stroke(); // draw it!

  //store
  stroke1.push(pos);
}
