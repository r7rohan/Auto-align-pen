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
   this.threshold = 100;
   this.contrast=contrast;
   this.mag;
   this.drc;
   this.length;
   this.max=0;
   this.sobelimg;
   this.sobel();
   this.sobelimg=this.sobelt();
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
            var sumX = 0, sumY = 0;
            for(var x = 0; x < kernelSize; x++){
                for(var y = 0; y < kernelSize; y++){
                    var px = data[i + (rowOffset * y) + x];
                    var r = px[0];

                    // use px[0] (i.e. R value) because grayscale anyway)
                    sumX += r * kernelX[y][x]*this.contrast;
                    sumY += r * kernelY[y][x]*this.contrast;
                }
            }
            this.mag[i] = SQRT(sumX*sumX + sumY*sumY);
            this.drc[i] = ATAN2(sumX,sumY);
            this.max = this.mag[i] > this.max ? this.mag[i] : this.max

        }
    }


    sobelt(){
      var thresh=this.threshold*this.contrast;
      var magnitudes = new Array(this.length);
      var directions = new Array(this.length);
      // set magnitude to 0 if doesn't exceed threshold, else set to magnitude
      for(var i = 0; i < this.length; i++){
        magnitudes[i] = this.mag[i] > thresh? this.mag[i] : 0;
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
    this.prevarr=[];
    this.arr=[];
  }
  undo(){
    this.arr=this.prevarr;
  }
  apply(pic){
    this.prevarr=this.arr.slice();
    pic.sobelimg=pic.sobelt();
    var imgarr = [];
    var rowOffset = this.canvas.width;
    var data = pic.edges;

    for(var i=0; i<data.length;i++){
      if(data[i]>0)
        imgarr.push({x:i%rowOffset,y:Math.floor(i/rowOffset)});
    }

    var tree = new kdTree(imgarr, this.distance, ["x", "y"]);

    for(var i=0; i<this.arr.length;i++){
      var point = this.arr[i];
      if(point.x<0)continue;
      var nearest = tree.nearest(point, 1, this.maxdist);
      this.arr[i] = nearest.length? nearest[0][0]:point;
    }
  }

  distance(pos1,pos2){
    return (pos1.x-pos2.x)*(pos1.x-pos2.x)+(pos1.y-pos2.y)*(pos1.y-pos2.y);
  }

  draw(){
    if(this.arr.length == 0)
      return;
    var pos = this.arr[0];

    this.context.beginPath(); // begin
    this.context.lineWidth = this.lineWidth;
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#AAAAFF';
    for(var i=0;i<this.arr.length;i++){
      if(pos.x==-1){pos = this.arr[i];continue;}
      this.context.moveTo(pos.x,pos.y)
      pos = this.arr[i];
      if(pos.x==-1)continue;
      this.context.lineTo(pos.x, pos.y);

    }
    this.context.stroke();
  }

}
