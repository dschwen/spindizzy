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
    { h:[0,0,0,0],s:0 }, //  0 flat floor
    { h:[1,1,0,0],s:0 }, //  1 shallow ramp NE
    { h:[0,1,1,0],s:0 }, //  2 shallow ramp ES
    { h:[0,0,1,1],s:0 }, //  3 shallow ramp SW
    { h:[1,0,0,1],s:0 }, //  4 shallow ramp WN
    { h:[2,2,0,0],s:0 }, //  5 steep ramp NE
    { h:[0,2,2,0],s:0 }, //  6 steep ramp ES
    { h:[0,0,2,2],s:0 }, //  7 steep ramp SW
    { h:[2,0,0,2],s:0 }, //  8 steep ramp WN
    { h:[1,0,0,0],s:1 }, //  1 shallow gable N
    { h:[0,1,0,0],s:2 }, //  1 shallow gable E
    { h:[0,0,1,0],s:1 }, //  1 shallow gable S
    { h:[0,0,0,1],s:2 }, //  1 shallow gable W
    { h:[2,0,0,0],s:1 }, //  1 steep gable N
    { h:[0,2,0,0],s:2 }, //  1 steep gable E
    { h:[0,0,2,0],s:1 }, //  1 steep gable S
    { h:[0,0,0,2],s:2 }, //  1 steep gable W
  ];

  // Stage size
  var sx=8, sy=8;

  // Test-level
  var level1 = {
    // bocktable [bgeo_id,z,base_depth]
    bt: [ [0,0,1],[0,1,2] ], 
    // initializer function for procedural level generation (optional)
    pre: function() { 
      var x,y,b = [];
      for(x=0;x<sx;++x) {
        b[x]=[]; for(y=0;y<sx;++y) b[x][y]=(x==0||y==0||x==sx-1||y==sy-1)?[1]:[0]; 
      }
      this.b = b; // final level data stored in b
    },
    // x,y,bt_id level data to be added to the procedurally initialized level
    data: [], //[[4,4,2]],
    // procedural post processing
    post: function() {
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
  var gl, g={};

  // build the triangle and normal buffers for the level l
  function triLevel(l) {
    if( !('b'in l) ) prepareLevel(l);

    var a,c,bg, i,j,j2,k=0,x,y,z,z0, glBufSize=6000,base=[[0,0],[1,0],[1,1],[0,1]],norm=[[0,-1],[-1,0],[0,1],[1,0]];

    if( !g.va || !g.na || !g.ca ) {
      g.va = new Float32Array(glBufSize*9);
      g.na = new Float32Array(glBufSize*9);
      g.ca = new Float32Array(glBufSize*3);
    }

    function vncPush(v,n,c) {
      g.ca[k/3]=c;
      g.ca[k/3+1]=c;
      g.ca[k/3+2]=c;
      for(var i=0;i<9;++i) {
        g.va[k]=v[i];
        g.na[k++]=n[i];
      }
    }

    for(x=0;x<sx;++x) {
      for(y=0;y<sy;++y) {
        c=l.b[x][y];
        for(i=0;i<c.length;++i) {
          if(c[i]<0) continue;
          a=l.bt[c[i]]; // block table entry
          z=a[1];       // surface level
          z0=z-a[2];    // bottom end of base
          bg=bgeo[a[0]]; // block geometry descriptor
          for(j=0;j<4;++j) { // loop over 4 edges NE ES SW WN
            j2=(j+1)%4;
            // insert two triangles for each side
            vncPush([x+base[j][0],z0,y+base[j][1], x+base[j2][0],z0,y+base[j2][1], x+base[j][0],z+bg.h[j],y+base[j][1]], 
                    [norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1]],1);
            vncPush([x+base[j2][0],z0,y+base[j2][1], x+base[j2][0],z+bg.h[j2],y+base[j2][1], x+base[j][0],z+bg.h[j],y+base[j][1]], 
                    [norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1]],2);
          }
          // insert two triangles for the top surface
        }
      }
    }
    g.numTri = k/3;

    g.vb =  gl.createBuffer();
    g.nb =  gl.createBuffer();
    g.cb =  gl.createBuffer();
  
    gl.bindBuffer(gl.ARRAY_BUFFER, g.vb );
    gl.bufferData( gl.ARRAY_BUFFER, g.va, gl.STATIC_DRAW );
    gl.bindBuffer(gl.ARRAY_BUFFER, g.nb );
    gl.bufferData( gl.ARRAY_BUFFER, g.na, gl.STATIC_DRAW );
    gl.bindBuffer(gl.ARRAY_BUFFER, g.cb );
    gl.bufferData( gl.ARRAY_BUFFER, g.ca, gl.STATIC_DRAW );
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

  var cw,ch,rot=Math.PI/4, targetRot=0, mat=[], xangle=-Math.PI/6;
  var r2=[1,0,0,0,0,Math.cos(xangle),Math.sin(xangle),0,0,-Math.sin(xangle),Math.cos(xangle),0,0,0,0,1];
  function updateProjection() {
    var sx,sy,sz=0.1,s=Math.sin(rot),c=Math.cos(rot);
    sx=0.1; sy=0.1; //TODO:screen apsect ratio!
    var s1=[sx,0,0,0,0,sy,0,0,0,0,sz,0,0,0,0,1];
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
    
    // bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, g.nb );
    gl.vertexAttribPointer(g.program.normalPosAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, g.vb );
    gl.vertexAttribPointer(g.program.vertexPosAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, g.cb );
    gl.vertexAttribPointer(g.program.colIdxAttrib, 1, gl.FLOAT, false, 0, 0);

    gl.drawArrays( gl.TRIANGLES, 0, g.numTri );

    rot+=0.01;
    setTimeout(draw,22);
    updateProjection();
  }

  //
  // Setup game widget
  //
  function Install() {
    // defaults
    var hasCanvas = "HTMLCanvasElement" in window;

    if( !hasCanvas ) return;

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

    g.program.colIdxAttrib = gl.getAttribLocation(g.program, 'cidx');
    gl.enableVertexAttribArray(g.program.colIdxAttrib);

    g.u_mvp      = gl.getUniformLocation(g.program, "u_mvp"),
    g.u_lightdir = gl.getUniformLocation(g.program, "u_lightdir"),
    g.u_palette  = gl.getUniformLocation(g.program, "u_palette");
    
    updatePalette();
    updateProjection();

    var lx=3, ly=2, lz=5;
    r = Math.sqrt(lx*lx+ly*ly+lz*lz);
    gl.uniform3f(g.u_lightdir, lx/r,ly/r,lz/r );

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }

  Install();

  triLevel(level1);
  draw();
}
