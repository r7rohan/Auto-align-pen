function average(mod1,f,i,n){
  var c=0, mean={x:0,y:0};
  for(var j=-n; j<=n ;j++){
    if(i+j>f||j==0||f-(i+j)>=mod1.length)continue;
    mean.x+=mod1[f-(i+j)].x
    mean.y+=mod1[f-(i+j)].y
    c+=1;}
  mean.x=~~(mean.x/c);mean.y=~~(mean.y/c);
  return mean;
}

function eqlpt(a,b){
  if(a.x==b.x && a.y==b.y)return 1;
  else return 0;
}
function max(a){
  var m = -100000000000;
  for(var i=0;i<a.length;i++){
    m = m>a[i]? m : a[i];
  }
  return m;
}

function min(a){
  var m = 100000000000;
  for(var i=0;i<a.length;i++){
    m = m<a[i]? m : a[i];
  }
  return m;
}
