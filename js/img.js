class imgc{

 constructor(img,canvas,width,contrast){

   this.canvas = canvas;
   this.context = this.canvas.getContext('2d');
   this.canvas2 = document.createElement('canvas');
   this.context2 = this.canvas2.getContext('2d');
   this.canvas.width = width;
   this.canvas.height = img.height*width/img.width;
   this.canvas2.width = width;
   this.canvas2.height = img.height*width/img.width;

   this.context.drawImage(img, 0, 0, img.width,img.height,0, 0, this.canvas.width, this.canvas.height);
   this.context2.drawImage(img, 0, 0, img.width,img.height,0, 0, this.canvas.width, this.canvas.height);
   this.img = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
   this.threshold = 250;

 }
 detect(x1,y1,x,y){
     var newdata = this.context2.getImageData(x1,y1,x,y);
     let src = cv.matFromImageData(newdata);
     let dst = new cv.Mat();
     cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
      // You can try more different parameters
     cv.Canny(src, dst,Number(this.threshold)/1.5,Number(this.threshold), 3, false);
     src.delete();
     return dst;
   }
  edge(x1,y1,x,y){
     var dist = [];
     var temp = this.detect(x1,y1,x,y)
     var l = temp.data;
     for (var i = x1;i<x1+x;i++)
       for(var j = y1;j<y1+y;j++){
         var e = l[(j-y1)*x+i-x1];
         if(e>200)
           dist.push({x:i,y:j})
       }
     temp.delete();
   return dist;
   }

    draw(which){
      if (which == 'normal')
      this.context.putImageData(this.img,0,0);
      else{
      var ed = this.detect(0,0,this.canvas.width,this.canvas.height);
      cv.imshow(this.canvas,ed);
      ed.delete();
    }
  }
}


class strokec{
  constructor(canvas,maxdist, lineWidth){
      this.canvas = canvas;
      this.context = this.canvas.getContext('2d');
      this.lineWidth = lineWidth;
      this.maxdist = maxdist;
      this.smoothness=50*50;
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
    for(var i = this.arr.length-1;i>=0;i--){
      if(this.arr[i].x<0)break;
      this.arr[i]=this.nearest(this.arr[i],pic);
    }
    // Continuity Heuristic
    var n = 3, th = this.smoothness, dist=[];
    for(var i = this.arr.length-1;i>=0;i--){
      if(this.arr[i].x<0)break;
      var c=0,mean={x:0,y:0};
      for(var j=-n;j<=n;j++){
        if(i+j<0||i+j>this.arr.length-1)continue;
        if(this.arr[i+j].x<0){mean=this.arr[i];c=1;break;}
        mean.x+=this.arr[i+j].x
        mean.y+=this.arr[i+j].y
        c+=1;}
      mean.x/=c;mean.y/=c;
      if (this.distance(mean,this.arr[i])>th)
        dist.push(mean);
      else dist.push(this.arr[i]);
    }
    for(var i = this.arr.length-1;i>=0;i--){
      if(this.arr[i].x<0)break;
      this.arr[i]=dist[this.arr.length-1-i];}
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
  nearest(point,pic){
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
