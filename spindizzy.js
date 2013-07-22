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
var bsd = [
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

//
// Setup game widget
//
function Install() {
  // defaults
  var hasCanvas = "HTMLCanvasElement" in window;

  function setupWebGL(gl) {
    // initialize building webgl module
    gl.clearColor(0,0,0,0.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LEQUAL);
    gl.clear( gl.COLOR_BUFFER_BIT + gl.DEPTH_BUFFER_BIT );

    // compile shaders
    var program = gl.createProgram();
    
    function initShader(id, type) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, $('#'+id).text() );
      gl.compileShader(shader);
      gl.attachShader(program, shader);
      return shader; 
    }

    var vshader = initShader('bldg-vs',gl.VERTEX_SHADER),
        fshader = initShader('bldg-fs',gl.FRAGMENT_SHADER);
    
    gl.linkProgram(program);
    gl.useProgram(program);

    program.vertexPosAttrib = gl.getAttribLocation(program, 'pos');
    gl.enableVertexAttribArray(program.vertexPosAttrib);

    program.normalPosAttrib = gl.getAttribLocation(program, 'norm');
    gl.enableVertexAttribArray(program.normalPosAttrib);

    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var centerdegLocation  = gl.getUniformLocation(program, "u_centerdeg");
    var lightdirLocation   = gl.getUniformLocation(program, "u_lightdir");
    
    var lx=3, ly=2, lz=5;
    r = Math.sqrt(lx*lx+ly*ly+lz*lz);
    gl.uniform3f(lightdirLocation, lx/r,ly/r,lz/r );

    return function() {
      // draw arrays
      var dx = wma_width/2, dy = wma_height/2
        , f0 = 60.0/(128*1<<wma_zoom);

      if( ll.lon > 180 ) { ll.lon -= 360.0 };

      // set zoom and position
      gl.uniform3f(resolutionLocation, dx*f0, dy*f0, 850);
      gl.uniform3f(centerdegLocation, ll.lon,ll.lat, 0 );

      // clear and render
      gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
      
      //wmajt.renderWebGLBuildingData();
    }
  }
}
