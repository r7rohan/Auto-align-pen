class imgc{

 constructor(img,canvas,width){

   this.canvas = canvas; // main canvas
   this.context = this.canvas.getContext('2d');
   this.canvas2 = document.createElement('canvas'); // enhanced canvas
   this.context2 = this.canvas2.getContext('2d');
   this.canvas3 = document.createElement('canvas'); // store actual image
   this.context3 = this.canvas3.getContext('2d');
   this.canvas.width = width;
   this.canvas.height = img.height*width/img.width;
   this.canvas2.width = width;
   this.canvas2.height = this.canvas.height;
   this.canvas3.width = width;
   this.canvas3.height = this.canvas.height;

   this.context.drawImage(img, 0, 0, img.width,img.height,0, 0, this.canvas.width, this.canvas.height);
   this.context2.drawImage(img, 0, 0, img.width,img.height,0, 0, this.canvas.width, this.canvas.height);
   this.context3.drawImage(img, 0, 0, img.width,img.height,0, 0, this.canvas.width, this.canvas.height);
   this.img = this.context3.getImageData(0, 0, this.canvas.width, this.canvas.height);
   this.threshold = 90;

 }
 detect(x1,y1,x,y,ch=4){
     var newdata = this.context2.getImageData(x1,y1,x,y);
     var dst = edgedetect_canny(newdata,~~(this.threshold/1.5),this.threshold,5,1.8,ch);
     return dst;
   }
  edge(x1,y1,x,y){
     var dist = [];
     var temp = this.detect(x1,y1,x,y,1)
     var l = temp.data;
     for (var i = x1;i<x1+x;i++)
       for(var j = y1;j<y1+y;j++){
         var e = l[(j-y1)*x+i-x1];
         if(e>200)
           dist.push({x:i,y:j})
       }
   return dist;
   }
  draw(which="now"){
    if(which == "now"){
        this.context.putImageData(this.img,0,0);
    }
    else if (which == 'normal'){
        this.img = this.context3.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.context.putImageData(this.img,0,0);
        this.context2.putImageData(this.img,0,0);}
    else if(which == 'sobel'){
        this.img  = this.detect(0,0,this.canvas.width,this.canvas.height);
        this.context.putImageData(this.img ,0,0);
      }
    else if(which == 'clahe'){
        this.img = this.context2.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.img = clahe(this.img,64,0.015);
        this.context.putImageData(this.img,0,0);
        this.context2.putImageData(this.img,0,0);
    }
    else if(which == 'sharpen'){
        var filter = [[-1,-1,-1],[-1,14,-1],[-1,-1,-1]];
        this.img = this.context2.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.img = applyfilter(this.img,filter)
        this.context.putImageData(this.img,0,0);
        this.context2.putImageData(this.img,0,0);
    }
    else if(which == 'custom'){
        var input = prompt("Enter the 2D Kernel: Eg : [[1, 0], [0, 1]]"), f=0;
        try{
        var filter = JSON.parse(input), sz = filter[0].length;}
        catch{
          alert("Invalid Kernel : " + input);
          return;}
        for(var r=0; r<filter.length; r++)
        if(!Array.isArray(filter[r]) || filter[r].length!=sz || sz==0) f=1;
        else for(var c = 0; c<filter[r].length; c++)
            if(Array.isArray(filter[r][c]))f=1;
        if (f){
          alert("Invalid Kernel : " + input);
          return;}
        this.img = this.context2.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.img = applyfilter(this.img,filter)
        this.context.putImageData(this.img,0,0);
        this.context2.putImageData(this.img,0,0);
    }
  }
}


class strokec{
  constructor(canvas,maxdist, lineWidth){
      this.canvas = canvas;
      this.context = this.canvas.getContext('2d');
      this.lineWidth = lineWidth;
      this.maxdist = maxdist;
      this.smoothness= 4*4;
      this.arr;
      this.reset();
  }
  draw(){
    if(this.arr.length == 0)
      return;
    var pos = this.arr[0];

    this.context.beginPath(); // begin
    this.context.lineWidth = this.lineWidth;
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#AAFFAA';
    for(var i=0;i<this.arr.length;i++){
      if(pos.x<0){pos = this.arr[i];continue;}
      this.context.moveTo(pos.x,pos.y)
      pos = this.arr[i];
      if(pos.x<0)continue;
      this.context.lineTo(pos.x, pos.y);
    }
    this.context.stroke();
  }
  apply(pic){
    var n = 3, th = this.smoothness, lam=1.5;
    var mod1=[], mod2=[],nearest = [], pts = [], f = this.arr.length-1,f1=0,f2=0;
    // Nearest
    for(var i = this.arr.length-1;i>=0;i--){
      if(this.arr[i].x<0)break;
      var c = this.nearest(this.arr[i],pic,true);
      nearest.push(c[0]);
      pts.push(c[1]);}
    // Continuity Heuristic 1
    for(var i = f; i>=0 ;i--){
      if(this.arr[i].x<0)break;
      var mean = average(nearest,f,i,n);
      var dist = pts[f-i], mind = 10e10,point = this.arr[i],near=this.arr[i];
      for(var j =0;j<dist.length;j++){
          var d = lam*this.distance(point,dist[j])+this.distance(mean,dist[j]);
          if(d<mind){
              mind = d;
              near = dist[j];}}
      mod1.push(near);
      f1+=eqlpt(near,nearest[f-i]);f2+=1;}
    console.log("heuristic 1: ", f1/(f2-f1));
    f1=0;f2=0;
    // Continuity Heuristic 2
    for(var i = f; i>=0 ;i--){
      if(this.arr[i].x<0)break;
      var mean = average(mod1,f,i,n);
      if (this.distance(mean,mod1[f-i])>th){
          mod2.push(mean);f1++;}
      else {mod2.push(mod1[f-i]);f2++;}}
    // copy
    console.log("heuristic 2: ",f2/f1);
    for(var i = f; i>=0 ;i--){
        if(this.arr[i].x<0)break;
        this.arr[i]=mod2[f-i];}
  }
  reset(){
    this.arr=[];
  }
  undo(){
    this.arr.pop();
    for(var i=this.arr.length-1;i>=0;i--)
      if(this.arr[i].x==-1)break;
      else
      this.arr.pop();
  }
  nearest(point,pic,all = false){
    var r = this.maxdist
    var x1 = max([point.x-Math.floor(r/2),0])
    var y1 = max([point.y-Math.floor(r/2),0])
    var x = min([r,pic.canvas.width-x1])
    var y = min([r,pic.canvas.height-y1])
    var dist = pic.edge(x1,y1,x,y)
    var near = point;
    var d , mind = 1000000*100000;
    for(var i =0;i<dist.length;i++){
        var d = this.distance(point,dist[i]);
        if(d<mind){
            mind = d;
            near = dist[i];
        }
    }
    if(all)
      return [near,dist];
    else
      return near;
}
/****************************************************/

  distance(pos1,pos2){
    return (pos1.x-pos2.x)*(pos1.x-pos2.x)+(pos1.y-pos2.y)*(pos1.y-pos2.y);
  }

  push(a){
    if(this.arr.length==0)this.arr.push(a);
    else if(!eqlpt(this.last(),a))
      this.arr.push(a);
  }

  last(){
    if(!this.arr.length)return {x:-1,y:-1};
    return this.arr[this.arr.length-1];
  }
}
