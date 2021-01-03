function misc1(e,l,r,k){
  var temp = {x:0,y:0};
  for(var i=l;i<=r && i<e.arr.length;i++){
  if(e.arr[i].x<0){
    temp={x:0,y:0};
    r=i+k;
    l=i+1;
    continue;
  }
  temp.x+=e.arr[i].x/k;
  temp.y+=e.arr[i].y/k;
}
return [l,temp];
}

function eqlpt(a,b){
  if(a.x==b.x && a.y==b.y)return 1;
  else return 0;
}
function max(a){
  var m = 0;
  for(var i=0;i<a.length;i++){
    m = m>a[i]? m : a[i];
  }
  return m;
}
