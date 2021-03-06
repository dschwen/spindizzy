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
  // r = safe tile for respawning
  //
  var bgeo = [
    { h:[0,0,0,0],s:0,t:2,r:true }, //  0 flat floor
    { h:[1,1,0,0],s:0,t:2,r:true }, //  1 shallow ramp NE
    { h:[0,1,1,0],s:0,t:2,r:true }, //  2 shallow ramp ES
    { h:[0,0,1,1],s:0,t:2,r:true }, //  3 shallow ramp SW
    { h:[1,0,0,1],s:0,t:2,r:true }, //  4 shallow ramp WN
    { h:[2,2,0,0],s:0,t:2 },        //  5 steep ramp NE
    { h:[0,2,2,0],s:0,t:2 },        //  6 steep ramp ES
    { h:[0,0,2,2],s:0,t:2 },        //  7 steep ramp SW
    { h:[2,0,0,2],s:0,t:2 },        //  8 steep ramp WN
    { h:[1,0,0,0],s:1,t:4,r:true }, //  9 shallow gable N
    { h:[0,1,0,0],s:2,t:5,r:true }, // 10 shallow gable E
    { h:[0,0,1,0],s:1,t:4,r:true }, // 11 shallow gable S
    { h:[0,0,0,1],s:2,t:5,r:true }, // 12 shallow gable W
    { h:[2,0,0,0],s:1,t:4 },        // 13 steep gable N
    { h:[0,2,0,0],s:2,t:5 },        // 14 steep gable E
    { h:[0,0,2,0],s:1,t:4 },        // 15 steep gable S
    { h:[0,0,0,2],s:2,t:5 },        // 16 steep gable W
    { h:[0,0,0,0],s:0,t:1 },        // 17 trampoline
    { h:[0,0,0,0],s:0,t:6,r:true }, // 18 switch circle
    { h:[0,0,0,0],s:0,t:7,r:true }, // 19 switch diamond
    { h:[0,0,0,0],s:0,t:8,r:true }, // 20 neutralizer
    { h:[0,0,0,0],s:0,t:11 },       // 21 water
    { h:[0,0,0,0],s:0,t:15,r:true },// 22 arrow NE
    { h:[0,0,0,0],s:0,t:16,r:true },// 23 arrow ES
    { h:[0,0,0,0],s:0,t:17,r:true },// 24 arrow SW
    { h:[0,0,0,0],s:0,t:18,r:true },// 25 arrow WN
    { h:[1,0,0,0],s:2,t:5,r:true }, // 26 banked corner N
    { h:[0,1,0,0],s:1,t:4,r:true }, // 27 banked corner E
    { h:[0,0,1,0],s:2,t:5,r:true }, // 28 banked corner S
    { h:[0,0,0,1],s:1,t:4,r:true }, // 29 banked corner W
    { h:[0,0,0,0],s:1,t:19,r:true } // 30 ice
  ];

  var nsample=5, snd = [
    { f:'assets/snd_trampoline.wav', v:0.75 },  // 0 trampoline bouncing sound
    { f:'assets/snd_clank.wav', v:0.25 },       // 1 player hitting the ground or a wall
    { f:'assets/snd_splash.wav', v:1.0 }        // 2 water tile sound
  ];
  
  function cacheSounds() {
    var i,j;
    for(i=0; i<snd.length; ++i) {
      snd[i].s=[];
      snd[i].c=0;
      for(j=0; j<nsample; ++j) {
        snd[i].s.push(new Audio(snd[i].f));
      }
    }
  }

  function playSound(n) {
    var s = snd[n].s[snd[n].c];
    s.load();
    s.volume = snd[n].v;
    s.play();
    snd[n].c = (snd[n].c+1) % nsample;
  }

  // Stage size
  var sx=8, sy=8;

  // Test-levels
  var level1 = {
    // bocktable [bgeo_id,z,base_depth]
    bt: [ [0,0,0],[0,1,2],[5,0,0],[22,0,1],[1,2,1],[1,3,1],[0,4,1],[17,0,0],[30,0,0],[21,0,0] ], 
    //bt: [ [0,0,0],[0,1,2],[1,2,3],[22,0,1] ], 
    // initializer function for procedural level generation (optional)
    pre: function() { 
      var x,y,b = [];
      for(x=0;x<sx;++x) {
        b[x]=[]; for(y=0;y<sx;++y) b[x][y]=(x==0||y==0||x==sx-1||y==sy-1)?[1]:[0]; 
      }
      this.b = b; // final level data stored in b
    },
    // x,y,bt_id level data to be added to the procedurally initialized level
    data: [[4,4,4],[4,3,5],[4,2,6]],
    // procedural post processing
    post: function() {
      var b=this.b;
      b[3][0][0]=3;
      b[4][0][0]=3;
      b[4][5][0]=2;
      b[3][2][0]=7;
      b[5][2][0]=8;
      b[5][3][0]=8;
      b[5][4][0]=8;
      b[5][5][0]=8;
      b[1][2][0]=9;
    }
  };
  var level2 = {
    // bocktable [bgeo_id,z,base_depth]
    bt: [ [1,0,1],[3,0,1] ], 
    // initializer function for procedural level generation (optional)
    pre: function() { 
      var x,y,b = [];
      for(x=0;x<sx;++x) {
        b[x]=[[],[],[],[],[],[],[],[]]; for(y=3;y<5;++y) b[x][y]=(y==3)?[0]:[1]; 
      }
      this.b = b; // final level data stored in b
    },
    // x,y,bt_id level data to be added to the procedurally initialized level
    data: [],
    // procedural post processing
    post: function() {
      var b=this.b;
      //b[3][0][0]=5;
    }
  };

  var levels = [
    // 0 start room 
    level2
    //"[[[[1],[1],[1],[2],[4],[1],[1],[1]],[[1],[0],[0],[9],[9],[0],[0],[1]],[[1],[0],[0],[0],[0],[0],[0],[1]],[[5],[6],[0],[0],[0],[0],[8],[0]],[[3],[6],[0],[0],[0],[0],[8],[3]],[[1],[0],[0],[0],[0],[0],[0],[1]],[[1],[0],[0],[0],[0],[0],[0],[1]],[[1],[10],[10],[10],[10],[10],[10],[1]]],[[0,0,0],[0,1,2],[1,0,1],[2,0,1],[3,0,1],[4,0,1],[22,0,0],[23,0,0],[24,0,0],[25,0,0],[0,0,1]]]"
  ]
      gems = [
    [[0,0,1],[1,6,0]] // 0 start room 
  ];

  // Test-levels
  var level1 = {
    // bocktable [bgeo_id,z,base_depth]
    bt: [ [0,0,0],[4,0,0],[17,0,0],[21,0,0] ], 
    //bt: [ [0,0,0],[0,1,2],[1,2,3],[22,0,1] ], 
    // initializer function for procedural level generation (optional)
    pre: function() { 
      var x,y,b = [];
      for(x=0;x<sx;++x) {
        b[x]=[]; for(y=0;y<sx;++y) b[x][y]=[3];
      }
      this.b = b; // final level data stored in b
    },
    // x,y,bt_id level data to be added to the procedurally initialized level
    data: [],
    // procedural post processing
    post: function() {
      var b=this.b;
      b[3][3][0]=0;
      b[4][3][0]=0;
      b[5][3][0]=0;
      b[6][3][0]=0;
      b[7][3][0]=0;
      b[7][4][0]=0;
      b[7][5][0]=0;
      b[6][5][0]=1;
      b[4][5][0]=2;
      b[2][5][0]=2;
      b[0][5][0]=0;
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

    var a,c,bg, i,j,j2,x,y,x0,y0,z,z0, base=[[0,0],[1,0],[1,1],[0,1]],norm=[[0,-1],[-1,0],[0,1],[1,0]],cpr=0.75;
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
                      [norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1]],[0,1, 1,1, 0,1-(cpr*(a[2]+bg.h[j]))],3);
              vntPush([x+base[j2][0],z0,y+base[j2][1], x+base[j2][0],z+bg.h[j2],y+base[j2][1], x+base[j][0],z+bg.h[j],y+base[j][1]], 
                      [norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1],norm[j][0],0,norm[j][1]],[1,1, 1,1-(cpr*(a[2]+bg.h[j2])), 0,1-(cpr*(a[2]+bg.h[j])) ],3);
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

  var cw,ch,rot=0, targetRot=0, mat=[], xangle=-Math.PI/4;
  var r2=[1,0,0,0,0,Math.cos(xangle),Math.sin(xangle),0,0,-Math.sin(xangle),Math.cos(xangle),0,0,0,0,1];
  function updateProjection() {
    var ax,ay,az=0.1,s=Math.sin(Math.PI/2*(rot+0.5)),c=Math.cos(Math.PI/2*(rot+0.5));
    ax=0.1; ay=0.1; //TODO:screen apsect ratio!
    var s1=[ax,0,0,0,0,ay,0,0,0,0,az,0,0,-0.3,0,1];
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

  var Player = {
    direction: [0,0],
    velocity:  [0,0,0],
    applyBrakes: false,
    applyTurbo: false,
    onIce: false,
    onGround: false,
    onWater: false,
    onLift: 0,
    lx:-1,ly:-1,li:-1, // last block below player
    rx:0,ry:0,ri:0     // respawn position (last safe block)
  };

  function drawEntity(e) {
    // bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, e.nb );
    gl.vertexAttribPointer(g.program.normalPosAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, e.vb );
    gl.vertexAttribPointer(g.program.vertexPosAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, e.tb );
    gl.vertexAttribPointer(g.program.textureAttrib, 2, gl.FLOAT, false, 0, 0);

    // entity shift
    if(e.phi==0) {
      gl.uniform2f(g.u_rot, 1, 0 );
    } else {
      gl.uniform2f(g.u_rot, Math.cos(e.phi), Math.sin(e.phi) );
    }

    // entity shift
    gl.uniform3f(g.u_shift, e.x-4, e.y, e.z-4 );

    // draw call
    gl.drawArrays( gl.TRIANGLES, 0, e.numTri );
  }

  function drawStage() {
    // clear and render
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    // player position for pseudoshadow
    gl.uniform3f(g.u_playerpos, g.e[1].x-4, g.e[1].y+1, g.e[1].z-4 );

    var i;

    // draw stage, player, and lifts
    for(i=0;i<4;++i) {
      if( g.e[i].show ) drawEntity(g.e[i]);
    }

    // draw gems
    var lg = gems[currentLevel];
    for(i=0;i<lg.length;++i) {
      g.e[4].x=lg[i][0]+0.5;
      g.e[4].z=lg[i][1]+0.5;
      g.e[4].y=lg[i][2];
      drawEntity(g.e[4]);
    }
  }

  var frame=0, currentLevel=0;

  function gameLoop() {
    // draw stage and entities
    drawStage();
    frame++;

    // request next gameLoop invocation at constant frame rate
    requestAnimFrame(gameLoop);

    // rotate the Player
    g.e[1].phi-=0.1;
    
    // rotate the diamonds
    g.e[4].phi = (g.e[4].phi+Math.PI/2+0.1) % (2*Math.PI);

    // accelerate the Player
    var drag = Player.onIce ? 1.0 : 0.995 
      , accel = ( Player.applyTurbo ? 0.002 : 0.001 ) * ( Player.onIce ? 0.1 : 1 )
      , gravity = 0.01
      , slopeGrav = 0.0025;
    
    if(Player.onGround) {
      if( !Player.onIce && Player.applyBrakes ) {
        Player.velocity[0] *= 0.9;
        Player.velocity[1] *= 0.9;
      }
      Player.velocity[0] = drag*( Player.velocity[0] + accel*Player.direction[0] );
      Player.velocity[1] = drag*( Player.velocity[1] + accel*Player.direction[1] );
    }
    Player.velocity[2] -= gravity;

    // get level data
    var l=levels[currentLevel], b=l.b, t=l.bt;

    // move the Player
    var dz, h
      , maxUp = 0.2  // maximum upwards step the player can take
      , hbr=0.2      // hitbox radius
      , hbh=1.5;     // hitbox height
    
    // determine total velocity
    var v = Math.sqrt(Player.velocity[0]*Player.velocity[0] + Player.velocity[2]*Player.velocity[2])
      , istep = Math.ceil(v/0.05)
      , dt = 1.0/istep;

    // multiple integration steps at high velocities
    for( step=0; step<istep; ++step ) {
      var mx,my;

      mx = dt*Player.velocity[0];
      my = dt*Player.velocity[1];

      if(Player.onGround) {
        var d = floorSlope(Player.tile,g.e[1].x % 1.0,g.e[1].z % 1.0);
      
        // vertical velocity is determined by horizontal speed and slope if the player is on the ground
        Player.velocity[2] = (d[0]*mx+d[1]*my)/dt;

        // accelerate player downhill
        if( d[0]<0 ) Player.velocity[0] += Math.sqrt( d[0]*d[0]*slopeGrav*slopeGrav/(d[0]*d[0]+1) );
        if( d[1]<0 ) Player.velocity[1] += Math.sqrt( d[1]*d[1]*slopeGrav*slopeGrav/(d[1]*d[1]+1) );
        if( d[0]>0 ) Player.velocity[0] -= Math.sqrt( d[0]*d[0]*slopeGrav*slopeGrav/(d[0]*d[0]+1) );
        if( d[1]>0 ) Player.velocity[1] -= Math.sqrt( d[1]*d[1]*slopeGrav*slopeGrav/(d[1]*d[1]+1) );
      }

      g.e[1].x += mx;
      g.e[1].z += my;
      g.e[1].y += dt*Player.velocity[2];


      function floorHeight(ct,dx,dy) {
        var z = ct[1], g=bgeo[ct[0]];
        if(g.s!=2) {
          if(dx-dy>0) { // upper triangle
            return z + g.h[1] + (g.h[0]-g.h[1])*(1-dx) + (g.h[2]-g.h[1])*dy;
          } else {      // lower triangle
            return z + g.h[3] + (g.h[2]-g.h[3])*dx + (g.h[0]-g.h[3])*(1-dy);
          }
        } else {
          if(dx+dy<1) { // upper triangle
            return z + g.h[0] + (g.h[1]-g.h[0])*dx + (g.h[3]-g.h[0])*dy;
          } else {      // lower triangle
            return z + g.h[2] + (g.h[3]-g.h[2])*(1-dx) + (g.h[1]-g.h[2])*(1-dy);
          }
        }
      }

      function floorSlope(ct,dx,dy) {
        var z = ct[1], g=bgeo[ct[0]];
        if( (g.s!=2) ? (dx-dy>0) : (dx+dy<1) ) {
          return g.d[0];
        } else {      // lower triangle
          return g.d[1];
        }
      }

      // player tile and in-tile position
      var x=Math.floor(g.e[1].x),
          y=Math.floor(g.e[1].z),
          z=g.e[1].y;
          dx=g.e[1].x-x,
          dy=g.e[1].z-y;

      function collisionTest(dir) {
        var tdx=dx, tdy=dy, sdx=dx, sdy=dy;
        if(dir[0]<0) { tdx=1.0; sdx=0.0; } 
        if(dir[0]>0) { tdx=0.0; sdx=1.0; }
        if(dir[1]<0) { tdy=1.0; sdy=0.0; }
        if(dir[1]>0) { tdy=0.0; sdy=1.0; }

        // height at current tile at projected exit point
        var sh=floorHeight(t[b[x][y][Player.li]],sdx,sdy);

        // out of screen collision
        var hx = x+dir[0], hy = y+dir[1], cb, tn, i, h;
        if( hx<0 || hy<0 || hx>=sx || hy>=sy  ) {
          return; // TODO fetch neighboring level and corresponding tile across boundary !!! needs a new tn
        } else {
          cb=b[hx][hy];
          tn=t;
        }

        // check for obstructing block in neighboring tile
        for(i=0; i<cb.length; ++i) {
          // tile is up too high
          if(tn[cb[i]][1]-tn[cb[i]][2]-hbh>z) continue;

          // check exact floor height
          h = floorHeight(tn[cb[i]],tdx,tdy);
          if(h-maxUp>sh) return true;
        }
        return false;
      }

      // moved to a new tile?
      if( x!=Player.lx || y!=Player.ly ) {
        // left map?
        if( x<0 || x>=sx || y<0 || y>=sy ) {
          if( x<0 || x>=sx ) Player.velocity[0] *= -1;
          if( y<0 || y>=sy ) Player.velocity[1] *= -1;
          return;
        }

        var cb=b[x][y];

        // find new block below player
        Player.onGround = false;
        if(cb.length==0) {
          Player.li = -1;
        } else {
          var i;
          for(i=0; i<cb.length; ++i) {
            // tile is up too high
            if(t[cb[i]][1]-maxUp>z) continue;

            // check exact floor height
            h = floorHeight(t[cb[i]],dx,dy);
            if(h-maxUp>z) continue;

            // select tile
            Player.li = i;

            // on ice?
            Player.onIce = (t[cb[i]][0]==30);
            Player.onWater = (t[cb[i]][0]==21);
          }

          if( z<h ) z=h; // step up tiny ledges (onto lifts)

          Player.lx = x;
          Player.ly = y;
        } 
      } 
      // test hitbox
      else {
        var hitDir = [0,0], tn;
        if( dx<hbr || 1-dx<hbr || dy<hbr || 1-dy<hbr ) {
          if(dx<hbr) hitDir[0]=-1;
          if(dy<hbr) hitDir[1]=-1;
          if(1-dx<hbr) hitDir[0]=1;
          if(1-dy<hbr) hitDir[1]=1;

          function sign(a) { return a<0?-1:1; }

          // diagonal move?
          var sound = false;
          if( hitDir[0]!=0 && hitDir[1]!=0 ) {
            // test all three neighboring blocks!
            var cx = collisionTest([hitDir[0],0])
              , cy = collisionTest([0,hitDir[1]])
              , cd = collisionTest(hitDir);

            if(cx||(cd&&!cy)) {
              sound |= ( sign(Player.velocity[0]) == sign(hitDir[0]) );
              Player.velocity[0] = -Math.abs(Player.velocity[0])*hitDir[0];
            }
            if(cy||(cd&&!cx)) {
              sound |= ( sign(Player.velocity[1]) == sign(hitDir[1]) );
              Player.velocity[1] = -Math.abs(Player.velocity[1])*hitDir[1];
            }
            if(sound) playSound(1);
          } else {
            if(collisionTest(hitDir)) {
              //if(hitDir[0]!=0) Player.velocity[0] = -Math.abs(Player.velocity[0])*hitDir[0];
              if(hitDir[0]!=0) {
                sound |= ( sign(Player.velocity[0]) == sign(hitDir[0]) );
                Player.velocity[0] = -Math.abs(Player.velocity[0])*hitDir[0];
              }
              if(hitDir[1]!=0) {
                sound |= ( sign(Player.velocity[1]) == sign(hitDir[1]) );
                Player.velocity[1] = -Math.abs(Player.velocity[1])*hitDir[1];
              }
              if(sound) playSound(1);
            }
          }
        }
      }

      // current blocktable item
      var ct = t[b[x][y][Player.li]]; // TODO li may be -1

      // get floor height at player position
      h = floorHeight(ct,dx,dy);
      if( !Player.onWater && g.e[1].y <= h ) {
        g.e[1].y = h;
        dz = h-z;
        if(ct[0]==17 && !Player.onGround && Player.velocity[2]<-0.05 ) { 
          // trampoline
          Player.velocity[2] = Math.abs(Player.velocity[2])*0.95;
          playSound(0);
        } else {
          if(!Player.onGround && Player.velocity[2]<-0.05) playSound(1); //TODO this triggers downhill on slopes!!
          Player.velocity[2] = (dz<0||!Player.onGround)?0:dz;
          Player.onGround = true;
          Player.tile = ct;

          // set respawn point
          if(bgeo[ct[0]].r) {
            Player.rx = x;
            Player.ry = y;
            Player.ri = Player.li;
          }
        }
      } else {
        // going down a slope?
        Player.onGround = false;
      }
    } // integration step loop


    if( (Player.onWater && z<-2) || z<-100 ) {
      playSound(2);
      console.log("dead!");
      // reset to last good position
      Player.lx=-1;
      Player.ly=-1;
      Player.onWater=false;
      Player.onGround=true;
      Player.velocity = [0,0,0];
      g.e[1].x = Player.rx+0.5;
      g.e[1].z = Player.ry+0.5;
      g.e[1].y = floorHeight(t[b[Player.rx][Player.ry][Player.ri]],0.5,0.5);
    }

    if( rot!=targetRot ) {
      rot += rot<targetRot ? 0.1 : -0.1;
      if( Math.abs(rot-targetRot)<0.09 ) rot=targetRot;
      updateProjection();
    }

    //updatePalette();
  }

  function cacheBlockSlopes() {
    var i,g;
    for(i=0; i<bgeo.length; ++i) {
      g=bgeo[i];
      if(g.s!=2) {
        g.d = [
          [ g.h[1]-g.h[0], g.h[2]-g.h[1] ],  // upper triangle
          [ g.h[2]-g.h[3], g.h[3]-g.h[0] ]   // lower triangle
        ];
      } else {
        g.d = [
          [ g.h[1]-g.h[0], g.h[3]-g.h[0] ],  // upper triangle
          [ g.h[2]-g.h[3], g.h[2]-g.h[1] ]   // lower triangle
        ];
      }
    }
  }

  function setupKeyHandlers() {
    var cursor_pressed = [false,false,false,false],
        directions     = [[-1,0],[0,1],[1,0],[0,-1]];

    function updateDirection() {
      var i,j,d;

      // clear current direction
      Player.direction[0] = 0;
      Player.direction[1] = 0;

      for(j=0;j<4;++j) {
        if(!cursor_pressed[j]) continue;
        i = (j-targetRot) % 4;
        d = directions[i<0 ? i+4 : i];

        Player.direction[0] += d[0];
        Player.direction[1] += d[1];
      }
    }

    function keyDown(e) {
      var k = e.keyCode;
      //console.log(k);
      switch(k) {
        case 65: // a
          targetRot--;
          break;
        case 68: // d
          targetRot++;
          break;
        case 16: // Shift
        case 17: // Ctrl
          Player.applyTurbo = true;
          break;
        case 32: // Space
          Player.applyBrakes = true;
          break;
        case 37: // Cursor left
        case 38: // Cursor up
        case 39: // Cursor right
        case 40: // Cursor down
          cursor_pressed[k-37] = true;
      }
      updateDirection();
    }
    function keyUp(e) {
      var k = e.keyCode;
      switch(k) {
        case 16: // Shift
        case 17: // Ctrl
          Player.applyTurbo = false;
          break;
        case 32: // Space
          Player.applyBrakes = false;
          break;
        case 37: // Cursor left
        case 38: // Cursor up
        case 39: // Cursor right
        case 40: // Cursor down
          cursor_pressed[k-37] = false;
      }
      updateDirection();
    }

    window.onkeydown = keyDown;
    window.onkeyup   = keyUp;
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
    g.u_rot      = gl.getUniformLocation(g.program, "u_rot"),
    g.u_shift    = gl.getUniformLocation(g.program, "u_shift"),
    g.u_lightdir = gl.getUniformLocation(g.program, "u_lightdir"),
    g.u_palette  = gl.getUniformLocation(g.program, "u_palette");

    g.u_playerpos = gl.getUniformLocation(g.program, "u_playerpos");
    
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
    texImage.onload = function() { textureLoaded(texImage, tex); }
    texImage.src = "assets/texture.png";

    // load samples
    cacheSounds();

    // cache block slopes
    cacheBlockSlopes();
  }
    
  // second half of setup once the texture is loaded
  function textureLoaded(image, texture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    // temporary geometry buffers
    var glBufSize = 6000;
    g.va = new Float32Array(glBufSize*9);
    g.na = new Float32Array(glBufSize*9);
    g.ta = new Float32Array(glBufSize*3);

    // entity list (stage is e[0])
    g.e=[{x:0,y:0,z:0,phi:0,show:true}];

    // build movable entities
    var i,l1,l2,l3,l4,l5,base=[[-1,-1],[1,-1],[1,1],[-1,1]],norm=[[0,-1],[-1,0],[0,1],[1,0]],j,j2;
    for( i=1; i<5; ++i ) {
      g.e[i]={x:3.5,y:1,z:3.5,phi:0};
      g.e[i].vb = gl.createBuffer();
      g.e[i].nb = gl.createBuffer();
      g.e[i].tb = gl.createBuffer();
      k2=0; k3=0;

      switch(i) {
        case 1: // player
          l1=.25; l2=1.5; l3=0.5; l4=0.025; l5=0.001;
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
          g.e[i].show = true;
          break;
        case 2: // lift1
        case 3: // lift2
          vntPush([ 0,l5,0, 1,l5,0, 1,l5,1 ], [0,1,0,0,1,0,0,1,0],[0,0,1,0,1,1],i+7);
          vntPush([ 0,l5,0, 1,l5,1, 0,l5,1 ], [0,1,0,0,1,0,0,1,0],[0,0,1,1,0,1],i+7);
          break;
        case 4: // diamond
          l1=0.4;l2=0.8;l3=1.6;
          vntPush([ l1,l2,-l1, 0,l3,0, -l1,l2,-l1 ], [0,1,0,0,1,0,0,1,0],[0,0,.5,.5,1,0],20);
          vntPush([ l1,l2,l1, 0,l3,0, l1,l2,-l1 ], [0,1,0,0,1,0,0,1,0],[1,0,.5,.5,1,1],20);
          vntPush([ -l1,l2,l1, 0,l3,0, l1,l2,l1 ], [0,1,0,0,1,0,0,1,0],[1,1,.5,.5,0,1],20);
          vntPush([ -l1,l2,-l1, 0,l3,0, -l1,l2,l1 ], [0,1,0,0,1,0,0,1,0],[0,1,.5,.5,0,0],20);
          l3=0.0;
          vntPush([ -l1,l2,-l1, 0,l3,0, l1,l2,-l1 ], [0,1,0,0,1,0,0,1,0],[0,0,.5,.5,1,0],20);
          vntPush([ l1,l2,-l1, 0,l3,0, l1,l2,l1 ], [0,1,0,0,1,0,0,1,0],[1,0,.5,.5,1,1],20);
          vntPush([ l1,l2,l1, 0,l3,0, -l1,l2,l1 ], [0,1,0,0,1,0,0,1,0],[1,1,.5,.5,0,1],20);
          vntPush([ -l1,l2,l1, 0,l3,0, -l1,l2,-l1 ], [0,1,0,0,1,0,0,1,0],[0,1,.5,.5,0,0],20);
          g.e[i].x=0.5; g.e[i].y=1; g.e[i].z=0.5;
          g.e[i].show = true;
          break;
      }

      g.e[i].numTri = k3/3;
  
      gl.bindBuffer(gl.ARRAY_BUFFER, g.e[i].vb );
      gl.bufferData( gl.ARRAY_BUFFER, g.va, gl.STATIC_DRAW );
      gl.bindBuffer(gl.ARRAY_BUFFER, g.e[i].nb );
      gl.bufferData( gl.ARRAY_BUFFER, g.na, gl.STATIC_DRAW );
      gl.bindBuffer(gl.ARRAY_BUFFER, g.e[i].tb );
      gl.bufferData( gl.ARRAY_BUFFER, g.ta, gl.STATIC_DRAW );
    }

    // install key handler 
    setupKeyHandlers();

    // load level
    triLevel(level2);

    setInterval(function(){ console.log(frame, 'fps'); frame=0; },1000);
    // enter game loop
    gameLoop();

  }

  Install();

}
