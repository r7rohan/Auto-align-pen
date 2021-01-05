class imgc{

 constructor(img,canvas,width,contrast){

   this.canvas = canvas;
   this.context = this.canvas.getContext('2d');
   this.canvas.width = width;
   this.canvas.height = img.height*width/img.width;
   this.kernels = {
         'sobel':{
             x:  [[-1, 0, 1],
                 [-2, 0, 2],
                 [-1, 0, 1]],
             y:  [[-1, -2, -1],
                 [0, 0, 0],
                 [1, 2, 1]],
            z: [[-2, -1, 0],
                [-1, 0, 1],
                [0, 1, 2]]
         }
     }


   this.context.drawImage(img, 0, 0, img.width,img.height,0, 0, this.canvas.width, this.canvas.height);
   this.img = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
   this.threshold = 200;
   this.contrast=contrast;
   this.mag;
   this.drc;
   this.length;
   this.sobelimg;
   this.sobel();
 }

 sobel(){
        var context = this.context;
        var canvas = this.canvas;
        // array of pixel data
        var data = this.img.data;
        var length = data.length;
        var arr = new Array(length / 4);
        var i = 0;
        while (i < length) {
          arr[i / 4] = [data[i], data[i+1], data[i+2], data[i+3]];
          i += 4;
        }
        data=arr;

        // convolution kernels
        var kernelX = this.kernels['sobel'].x;
        var kernelY = this.kernels['sobel'].y;

        var kernelSize = kernelX.length;

        // offset value to get window of pixels
        var rowOffset = canvas.width;

        // math to get 3x3 window of pixels because image data given is just a 1D array of pixels
        var maxPixelOffset = canvas.width * 2 + kernelSize - 1;

        // optimizations
        var SQRT = Math.sqrt;
        var ATAN2 =  Math.atan2;

        this.length = data.length - maxPixelOffset

        this.mag = new Array(this.length);
        this.drc = new Array(this.length);

        for(var i = 0; i < this.length; i++){
            // sum of each pixel * kernel value
            var sumXr = 0, sumYr = 0;
            var sumXg = 0, sumYg = 0;
            var sumXb = 0, sumYb = 0;
            for(var x = 0; x < kernelSize; x++){
                for(var y = 0; y < kernelSize; y++){
                    var px = data[i + (rowOffset * y) + x];
                    var r = px[0];
                    var g = px[1];
                    var b = px[2];
                    sumXr += r * kernelX[y][x]*this.contrast ;
                    sumYr += r * kernelY[y][x]*this.contrast ;
                    sumXg += g * kernelX[y][x]*this.contrast ;
                    sumYg += g * kernelY[y][x]*this.contrast ;
                    sumXb += b * kernelX[y][x]*this.contrast ;
                    sumYb += b * kernelY[y][x]*this.contrast ;
                }
            }
            this.mag[i] = SQRT(max([sumXr*sumXr + sumYr*sumYr],[sumXg*sumXg + sumYg*sumYg],[sumXb*sumXb + sumYb*sumYb]));
            this.drc[i] = ATAN2(sumXr,sumYr);


        }
    }


    sobelt(){
      var thresh=this.threshold*this.contrast;
      var magnitudes = new Array(this.length);
      var directions = new Array(this.length);
      // set magnitude to 0 if doesn't exceed threshold, else set to magnitude
      for(var i = 0; i < this.length; i++){
        magnitudes[i] = this.mag[i]> thresh? this.mag[i] : 0;
        directions[i] = this.mag[i] > thresh? this.drc[i] : 0;
      }

        var dataLength = this.canvas.width * this.canvas.height * 4;
        // keep edge and direction magnitude for each pixel
        this.edges = new Array(dataLength/4);
        this.directions = new Array(dataLength/4);

        var edges = new Array(dataLength);
        var i = 0;

        while(i < dataLength){
            edges[i] =  0;
            if(!(i % 4)) {
              var m = magnitudes[i / 4];
              var d = directions[i / 4];

              this.edges[i/4]       = m;
              this.directions[i/4]  = d;

              if(m != 0) {
                edges[i - 1] = m / 4;
              }
            }
            i++;
        }
        return new ImageData(new Uint8ClampedArray(edges), this.canvas.width, this.canvas.height);
    }

    draw(which){
      if (which == 'normal')
      this.context.putImageData(this.img,0,0);
      else{
        this.sobelimg=this.sobelt();
        this.context.putImageData(this.sobelimg,0,0);}
    }

}


class strokec{
  constructor(canvas,maxdist, lineWidth){
      this.canvas = canvas;
      this.context = this.canvas.getContext('2d');
      this.lineWidth = lineWidth;
      this.maxdist = maxdist;
      this.reset();
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

  maketree(pic){
    pic.sobelimg=pic.sobelt();
    var imgarr = [];
    var rowOffset = this.canvas.width;
    var data = pic.edges.slice();

    for(var i=0; i<data.length;i++){
      if(data[i]>0)
        imgarr.push({x:i%rowOffset,y:Math.floor(i/rowOffset)});
    }
    this.tree = new kdTree(imgarr, this.distance, ["x", "y"]);
  }

  apply(){
    for(var i = this.arr.length-1;i>=0;i--){
      if(this.arr[i].x<0)break;
      this.arr[i]=this.nearest(this.arr[i]);
    }
  }

  smooth(k,r){
    //only the last segment
    var i=this.arr.length-2;
    if(i<=0)return;
    for(;i>=0;i--)if(this.arr[i].x<0) break;
    i+=1;

    var d = Math.floor(k/2),temp;
    i=misc1(this,i,i+k-1,k);
    temp=i[1];
    i=i[0];

    for (;i<this.arr.length-k;i++){
      if(this.distance(temp,this.arr[i+d])>r)
        this.arr[i+d] = {x:temp.x,y:temp.y};

      if(this.arr[i+k].x<0){
        i=misc1(this,i+k+1,i+k+1+k-1,k);
        temp=i[1];
        i=i[0];
        continue;}
      temp.x += (this.arr[i+k].x-this.arr[i].x)/k;
      temp.y += (this.arr[i+k].y-this.arr[i].y)/k;
    }
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

/****************************************************/

  distance(pos1,pos2){
    return (pos1.x-pos2.x)*(pos1.x-pos2.x)+(pos1.y-pos2.y)*(pos1.y-pos2.y);
  }
  push(a){
    if(this.arr.length==0)this.arr.push(a);
    else if(!eqlpt(this.last(),a))
      this.arr.push(a);
  }
  nearest(point){
    var nearest = this.tree.nearest(point, 1, this.maxdist);
    return nearest.length? nearest[0][0]:point;
  }
  last(){
    if(!this.arr.length)return {x:-1,y:-1};
    return this.arr[this.arr.length-1];
  }
}
