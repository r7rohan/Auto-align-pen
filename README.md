# Auto-align-pen


### Demo
https://r7rohan.github.io/Auto-align-pen/

Online tool for auto pen alignment. Drawing can be automatically aligned with the edges, either in realtime or when you release your mouse. It is similar to the magnetic lasso feature but has many more options to draw smooth computer aided traces. Additionally, edge detection and smoothening can be also done. 

### Features
- Webpage for auto-alignment and edge detection

- Drawing can be done and undone on any picture uploaded. It can then be downloaded like any normal editor

- Aligns the drawing with the edges in the picture (`uses k-d trees`)

- Two modes of alignment: <br>
`With the user`: Alignment will be done while drawing and will help the user to draw <br>
`After mouse release`: Alignment will be done when the user releases mouse-hold.<br> In this mode only the last drawing segment is aligned for the ease of the user drawing

- Edge detection filter can be applied based on threshold selected (`uses Sobel filter`)

- Smoothening of drawing can also be done. For ease it's only done on the last drawing segment.
<br><br>
`Picture`: Show the actual picture <br>
`Sobel`: Show the Edges <br>
`Threshold`: Select the edge threshold <br>
`Smooth`: Smoothens your drawing <br>
`Right click`: Undo the last change <br>
`Reset`: Remove the drawing <br>
`Real time on`: Alignment will be done while the user draws <br>
`Maxdist off`: Align with anything, distance will not matter <br>


### Working
- Drawing is processed into different stroke pixels and the picture is converted to edges. Each drawn pixel is aligned to its nearest neighbour among the edge pixels (uses k-d tree for fast execution). 

- Edge detection is done using `sobel` filter. Convulation is based on [this code](https://github.com/piratefsh/image-processing)

- Nearest neighbour is implemented using `k-d Tree`. k-d Tree is based on [this code](https://github.com/ubilabs/kd-tree-javascript)

- Smoothening is based on averaging neighbouring strokes

- Written in javascript
