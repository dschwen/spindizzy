function Spindizzy() {
  // Block-surface descriptors
  // h = height at NESW points
  //
  //      N
  //  W       E
  //      S
  //
  // s = triangle splitting
  //   0 = none (surface is a planar quadrilateral)
  //   1 = split along NS axis
  //   2 = split along EW axis
  //
  var bgeo = [
    { h:[0,0,0,0],s:0,t:2 }, //  0 flat floor
    { h:[1,1,0,0],s:0,t:2 }, //  1 shallow ramp NE
    { h:[0,1,1,0],s:0,t:2 }, //  2 shallow ramp ES
    { h:[0,0,1,1],s:0,t:2 }, //  3 shallow ramp SW
    { h:[1,0,0,1],s:0,t:2 }, //  4 shallow ramp WN
    { h:[2,2,0,0],s:0,t:2 }, //  5 steep ramp NE
    { h:[0,2,2,0],s:0,t:2 }, //  6 steep ramp ES
    { h:[0,0,2,2],s:0,t:2 }, //  7 steep ramp SW
    { h:[2,0,0,2],s:0,t:2 }, //  8 steep ramp WN
    { h:[1,0,0,0],s:1,t:4 }, //  9 shallow gable N
    { h:[0,1,0,0],s:2,t:5 }, // 10 shallow gable E
    { h:[0,0,1,0],s:1,t:4 }, // 11 shallow gable S
    { h:[0,0,0,1],s:2,t:5 }, // 12 shallow gable W
    { h:[2,0,0,0],s:1,t:5 }, // 13 steep gable N
    { h:[0,2,0,0],s:2,t:5 }, // 14 steep gable E
    { h:[0,0,2,0],s:1,t:4 }, // 15 steep gable S
    { h:[0,0,0,2],s:2,t:5 }, // 16 steep gable W
    { h:[0,0,0,0],s:0,t:1 }, // 17 trampoline
    { h:[0,0,0,0],s:0,t:6 }, // 18 switch circle
    { h:[0,0,0,0],s:0,t:7 }, // 19 switch diamond
    { h:[0,0,0,0],s:0,t:8 }, // 20 neutralizer
    { h:[0,0,0,0],s:0,t:11 },// 21 water
    { h:[0,0,0,0],s:0,t:15 },// 22 arrow NE
    { h:[0,0,0,0],s:0,t:16 },// 23 arrow ES
    { h:[0,0,0,0],s:0,t:17 },// 24 arrow SW
    { h:[0,0,0,0],s:0,t:18 } // 25 arrow WN
  ];

  // Stage size
  var sx=8, sy=8;

  // Test-level
  var level1 = {
    // bocktable [bgeo_id,z,base_depth]
    bt: [ [0,0,0],[0,1,2],[1,2,3],[22,0,1] ], 
    // initializer function for procedural level generation (optional)
    pre: function() { 
      var x,y,b = [];
      for(x=0;x<sx;++x) {
        b[x]=[]; for(y=0;y<sx;++y) b[x][y]=(x==0||y==0||x==sx-1||y==sy-1)?[1]:[0]; 
      }
      this.b = b; // final level data stored in b
    },
    // x,y,bt_id level data to be added to the procedurally initialized level
    data: [[4,4,2]],
    // procedural post processing
    post: function() {
      var b=this.b;
      b[3][0][0]=3;
      b[4][0][0]=3;
    }
  };

  // prepare level object
  function prepareLevel(l) {
    var x,y,i;

    // initialize level
    l.b=[];
    for(x=0;x<sx;++x) {
      l.b[x]=[]; for(y=0;y<sy;++y) l.b[x][y]=[]; 
    }

    // pre process
    if( ('pre' in l) && (typeof l.pre == 'function') ) l.pre();

    // insert data
    for(i=0; i<l.data.length; ++i) l.b[l.data[i][0]][l.data[i][1]].push(l.data[i][2]);

    // post process
    if( ('post' in l) && (typeof l.post == 'function') ) l.post();
  }

  // WebGL context
  var gl, g={}, k2, k3;

  function vntPush(v,n,t,tid) {
    var xfac=1/32;
    for(var i=0;i<9;++i) {
      g.va[k3]=v[i];
      g.na[k3++]=n[i];
    }
    for(var i=0;i<6;i+=2) {
      g.ta[k2++]=xfac*(t[i]+tid); // 10x1 textures in atlas
      g.ta[k2++]=t[i+1];
    }
  }

  // build the triangle and normal buffers for the level l
  function triLevel(l) {
    if( !('b'in l) ) prepareLevel(l);

    var a,c,bg, i,j,j2,x,y,x0,y0,z,z0, base=[[0,0],[1,0],[1,1],[0,1]],norm=[[0,-1],[-1,0],[0,1],[1,0]];
    k2=0; k3=0;

    for(x=0;x<sx;++x) {
      for(y=0;y<sy;++y) {
        c=l.b[x][y];
        for(i=0;i<c.length;++i) {
          if(c[i]<0) continue;
          a=l.bt[c[i]]; // block table entry
          z=a[1];       // surface level
          bg=bgeo[a[0]]; // block geometry descriptor
          z0=z-a[2];    // bottom end of base
          for(j=0;j<4;++j) { // loop over 4 edges NE ES SW WN
            j2=(j+1)%4;
            // insert two triangles for each side
            if( a[2]!=0 || bg.h[j]!=0 || bg.h[j2]!=0 ) {
              vntPush([x+base[j][0],z0,y+base[j][1], x+base[j2][0],z0,y+base[j2][1], x+base[j][0],z+bg.h[j],y+base[j][1]], 
                      [norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1]],[0,1, 1,1, 0,0.5*(1-a[2]-bg.h[j])],3);
              vntPush([x+base[j2][0],z0,y+base[j2][1], x+base[j2][0],z+bg.h[j2],y+base[j2][1], x+base[j][0],z+bg.h[j],y+base[j][1]], 
                      [norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1]],[1,1, 1,0.5*(1-a[2]-bg.h[j2]), 0,0.5*(1-a[2]-bg.h[j]) ],3);
            }
          }
          // insert two triangles for the top surface
          if( bg.s!=2 ) {
            vntPush([ x+base[0][0],z+bg.h[0],y+base[0][1], x+base[1][0],z+bg.h[1],y+base[1][1], x+base[2][0],z+bg.h[2],y+base[2][1] ],
                    [0,1,0,0,1,0,0,1,0],[0,0,1,0,1,1],bg.t);
            vntPush([ x+base[0][0],z+bg.h[0],y+base[0][1], x+base[2][0],z+bg.h[2],y+base[2][1], x+base[3][0],z+bg.h[3],y+base[3][1] ],
                    [0,1,0,0,1,0,0,1,0],[0,0,1,1,0,1],bg.t);
          } else {
            vntPush([ x+base[1][0],z+bg.h[1],y+base[1][1], x+base[2][0],z+bg.h[2],y+base[2][1], x+base[3][0],z+bg.h[3],y+base[3][1] ],
                    [0,1,0,0,1,0,0,1,0],[1,0,1,1,0,1],bg.t);
            vntPush([ x+base[0][0],z+bg.h[0],y+base[0][1], x+base[1][0],z+bg.h[1],y+base[1][1], x+base[3][0],z+bg.h[3],y+base[3][1] ],
                    [0,1,0,0,1,0,0,1,0],[0,0,1,0,0,1],bg.t);
          }
        }
      }
    }
    g.e[0].numTri = k3/3;

    g.e[0].vb =  gl.createBuffer();
    g.e[0].nb =  gl.createBuffer();
    g.e[0].tb =  gl.createBuffer();
  
    gl.bindBuffer(gl.ARRAY_BUFFER, g.e[0].vb );
    gl.bufferData( gl.ARRAY_BUFFER, g.va, gl.STATIC_DRAW );
    gl.bindBuffer(gl.ARRAY_BUFFER, g.e[0].nb );
    gl.bufferData( gl.ARRAY_BUFFER, g.na, gl.STATIC_DRAW );
    gl.bindBuffer(gl.ARRAY_BUFFER, g.e[0].tb );
    gl.bufferData( gl.ARRAY_BUFFER, g.ta, gl.STATIC_DRAW );
  }

  // 16 color palette (last color is random)
  var palette = [ 0,0,0, 1,1,1, 1,0,0, 0,1,0, 
                  0,0,1, 1,1,0, 0,1,1, 1,0,1, 
                  .5,.5,.5, 1,.5,.5, .5,1,.5, .5,.5,1,
                  1,1,.5, .5,1,1, 1,.5,1, 0,0,0 ];
  function updatePalette() {
    for(var i=15*3; i<16*3; ++i) palette[i] = Math.random();
    gl.uniform3fv(g.u_palette, palette);
  }

  var cw,ch,rot=Math.PI/4, targetRot=0, mat=[], xangle=-Math.PI/4;
  var r2=[1,0,0,0,0,Math.cos(xangle),Math.sin(xangle),0,0,-Math.sin(xangle),Math.cos(xangle),0,0,0,0,1];
  function updateProjection() {
    var sx,sy,sz=0.1,s=Math.sin(rot),c=Math.cos(rot);
    sx=0.1; sy=0.1; //TODO:screen apsect ratio!
    var s1=[sx,0,0,0,0,sy,0,0,0,0,sz,0,0,-0.3,0,1];
    var r1=[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1];
    
    function mul(a,b) {
      var i,j,k,p,q=0,r=0,m=[];
      for(i=0;i<4;++i){
        for(j=0;j<4;++j){
          m[r]=0; p=r%4;
          for(k=0;k<4;++k){
            m[r]+=b[q+k]*a[p+4*k];
          }
          r++;
        }
        q=q+4;
      }
      return m;
    }
    mat = mul(mul(r2,r1),s1);
    gl.uniformMatrix4fv(g.u_mvp, false, new Float32Array(mat));
  }

  function draw() {
    // clear and render
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    var i;
    for(i=0;i<2;++i) {
      // bind buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, g.e[i].nb );
      gl.vertexAttribPointer(g.program.normalPosAttrib, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, g.e[i].vb );
      gl.vertexAttribPointer(g.program.vertexPosAttrib, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, g.e[i].tb );
      gl.vertexAttribPointer(g.program.textureAttrib, 2, gl.FLOAT, false, 0, 0);

      // entity shift
      gl.uniform3f(g.u_shift, g.e[i].x-4, g.e[i].y, g.e[i].z-4 );

      // draw call
      gl.drawArrays( gl.TRIANGLES, 0, g.e[i].numTri );
    }
    rot+=0.02;
    requestAnimFrame(draw);
    updateProjection();
    updatePalette();
  }

  //
  // Setup game widget
  //
  function Install() {
    // defaults
    var hasCanvas = "HTMLCanvasElement" in window;

    if( !hasCanvas ) return;

    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                function( callback ){
                   window.setTimeout(callback, 1000 / 60);
                };
    })();

    var c = document.getElementById('gamecanvas');
    cw=c.clientWidth;
    ch=c.clientHeight;
    c.width=cw;
    c.height=ch;
    gl = c.getContext("experimental-webgl");

    // initialize building webgl module
    gl.clearColor(0,0,0,1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LEQUAL);
    gl.clear( gl.COLOR_BUFFER_BIT + gl.DEPTH_BUFFER_BIT );

    // compile shaders
    g.program = gl.createProgram();
    
    function initShader(id, type) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, document.getElementById(id).text );
      gl.compileShader(shader);
      gl.attachShader(g.program, shader);
      console.log(id, gl.getShaderInfoLog(shader) );
      return shader; 
    }

    var vshader = initShader('block-vs',gl.VERTEX_SHADER),
        fshader = initShader('block-fs',gl.FRAGMENT_SHADER);
    
    gl.linkProgram(g.program);
    gl.useProgram(g.program);

    g.program.vertexPosAttrib = gl.getAttribLocation(g.program, 'pos');
    gl.enableVertexAttribArray(g.program.vertexPosAttrib);

    g.program.normalPosAttrib = gl.getAttribLocation(g.program, 'norm');
    gl.enableVertexAttribArray(g.program.normalPosAttrib);

    g.program.textureAttrib = gl.getAttribLocation(g.program, 'tex');
    gl.enableVertexAttribArray(g.program.textureAttrib);

    g.u_mvp      = gl.getUniformLocation(g.program, "u_mvp"),
    g.u_shift    = gl.getUniformLocation(g.program, "u_shift"),
    g.u_lightdir = gl.getUniformLocation(g.program, "u_lightdir"),
    g.u_palette  = gl.getUniformLocation(g.program, "u_palette");
    
    gl.uniform1i(gl.getUniformLocation(g.program, "u_sampler"), 0);

    updatePalette();
    updateProjection();

    var lx=3, ly=2, lz=5;
    r = Math.sqrt(lx*lx+ly*ly+lz*lz);
    gl.uniform3f(g.u_lightdir, lx/r,ly/r,lz/r );

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.FRONT);
    gl.cullFace(gl.BACK);
    
    // load texture atlas
    var tex = gl.createTexture();
    texImage = new Image();
    texImage.onload = function() { handleTextureLoaded(texImage, tex); }
    texImage.src = "image/texture.png";

    function handleTextureLoaded(image, texture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    // temporary geometry buffers
    var glBufSize = 6000;
    g.va = new Float32Array(glBufSize*9);
    g.na = new Float32Array(glBufSize*9);
    g.ta = new Float32Array(glBufSize*3);

    // entity list (stage is e[0])
    g.e=[{x:0,y:0,z:0}];

    // build movable entities
    var i,l1=.25,l2=1.5,l3=0.5,l4=0.025,base=[[-1,-1],[1,-1],[1,1],[-1,1]],norm=[[0,-1],[-1,0],[0,1],[1,0]],j,j2;
    for( i=1; i<2; ++i ) {
      g.e[i]={x:3,y:0,z:3};
      g.e[i].vb =  gl.createBuffer();
      g.e[i].nb =  gl.createBuffer();
      g.e[i].tb =  gl.createBuffer();
      k2=0; k3=0;

      switch(i) {
        case 1: // player
            // top
            vntPush([ -l1,l2,-l1, l1,l2,-l1, l1,l2,l1 ], [0,1,0,0,1,0,0,1,0],[0,0,1,0,1,1],13);
            vntPush([ -l1,l2,-l1, l1,l2,l1, -l1,l2,l1 ], [0,1,0,0,1,0,0,1,0],[0,0,1,1,0,1],13);
            // bottom
            vntPush([ -l1,l2,-l1, 0,l3,0, l1,l2,-l1 ], [0,1,0,0,1,0,0,1,0],[0,0,.5,.5,1,0],12);
            vntPush([ l1,l2,-l1, 0,l3,0, l1,l2,l1 ], [0,1,0,0,1,0,0,1,0],[1,0,.5,.5,1,1],12);
            vntPush([ l1,l2,l1, 0,l3,0, -l1,l2,l1 ], [0,1,0,0,1,0,0,1,0],[1,1,.5,.5,0,1],12);
            vntPush([ -l1,l2,l1, 0,l3,0, -l1,l2,-l1 ], [0,1,0,0,1,0,0,1,0],[0,1,.5,.5,0,0],12);
            // stem
            for(j=0;j<4;++j) { // loop over 4 edges NE ES SW WN
              j2=(j+1)%4;
              // insert two triangles for each side
              vntPush([l4*base[j][0],0,l4*base[j][1], l4*base[j2][0],0,l4*base[j2][1], l4*base[j][0],(l1+l2)/2,l4*base[j][1]], 
                      [norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1]],[0,1, 1,1, 0,0],14);
              vntPush([l4*base[j2][0],0,l4*base[j2][1], l4*base[j2][0],(l1+l2)/2,l4*base[j2][1], l4*base[j][0],(l1+l2)/2,l4*base[j][1]], 
                      [norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1]],[1,1, 1,0, 0,0 ],14);
            }
          break;
      }

      g.e[i].numTri = k3/3;
  
      gl.bindBuffer(gl.ARRAY_BUFFER, g.e[1].vb );
      gl.bufferData( gl.ARRAY_BUFFER, g.va, gl.STATIC_DRAW );
      gl.bindBuffer(gl.ARRAY_BUFFER, g.e[1].nb );
      gl.bufferData( gl.ARRAY_BUFFER, g.na, gl.STATIC_DRAW );
      gl.bindBuffer(gl.ARRAY_BUFFER, g.e[1].tb );
      gl.bufferData( gl.ARRAY_BUFFER, g.ta, gl.STATIC_DRAW );
    }
  }

  Install();

  triLevel(level1);
  draw();
}
