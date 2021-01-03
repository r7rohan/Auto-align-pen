# Auto-align-pen


### Demo
https://r7rohan.github.io/Auto-pen-Edge/


### Features
- Webpage for auto-alignment and edge detection

- Drawing can be done on any picture uploaded and then downloaded

- Aligns the drawing with the edges in the picture (`uses k-d trees`)

- Edge detection filter can be applied based on threshold selected (`uses Sobel filter`)

- Smoothening of drawing can be done

- Alignment and drawing can be erased and done like a normal editor<br><br>
`Choose File`: Upload the local image <br>
`Picture`: Show the actual picture <br>
`Sobel`: Show the Edges <br>
`Threshold`: Select the edge threshold <br>
`Align`: Align your drawing with the image <br>
`Undo Align`: Undo the last alignment <br>
`Smooth`: Smoothens your drawing <br>
`Reset`: Remove the drawing <br>
`Download`: Download whatever is on canvas <br>
`Maxdist off`: Align with anything, distance will not matter

### Working
- Drawing is processed into pixels and the picture is converted to edges. Each drawn pixel is aligned to its nearest neighbour among the edge pixels (uses k-d tree for fast execution). 

- Edge detection is done using `sobel` filter. Convulation is based on [this code](https://github.com/piratefsh/image-processing)

- Nearest neighbour is implemented using `k-d Tree`. k-d Tree is based on [this code](https://github.com/ubilabs/kd-tree-javascript)

- Smoothening is based on averaging neighbouring strokes

- Written in javascript
