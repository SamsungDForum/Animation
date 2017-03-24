var Cube = Cube || (function(){
    var ROW, COL, CUBE_DEFAULT_WIDTH, CUBE_DEFAULT_HEIGHT, X, Y;
    var CALENDAR_POSITION_X = 0;
    var CALENDAR_POSITION_Y = 0;
    var XINDEX = 0;
    var YINDEX = 0;

    function Cube(){
      this.inputMode = false;
      this.cube = [];
      this.mx = -1; this.my = -1;
      this.kx = 0; this.ky = 0;
      this.circle = null;
      this.controls = null;
    }

    Cube.prototype.constructor = Cube;

    Cube.prototype.initialize = function (props){
      ROW = props.row; COL = props.col;
      CUBE_DEFAULT_WIDTH = 1920 / COL;
      CUBE_DEFAULT_HEIGHT = 1080 / ROW;
      X = -960 + CUBE_DEFAULT_WIDTH * 0.5;
      Y = 540 - CUBE_DEFAULT_HEIGHT * 0.5;

      ColorTable.createColorPattern({row: ROW, col: COL
        ,lc: props.leftColor, rc: props.rightColor, hl: props.hardLightColor});

      this.lastTime = (new Date()).getMilliseconds();
      this.fpsCount = 1;

      this.createCalendar(props.scene);

      return true;
    }

    Cube.prototype.createCalendar = function (scene) {
      var _geometry, _mesh, _material, _x, _y;

      // cube 생성
      for(var i = 0; i < ROW; ++i){
        this.cube[i] = [];
        var _cube = this.cube[i];
        for(var j = 0; j < COL; ++ j){
          _geometry = new THREE.PlaneGeometry(1, 1);
          _material = new THREE.MeshBasicMaterial({side : THREE.DoubleSide, transparent: true});
          _mesh = new THREE.Mesh(_geometry, _material);

          _mesh.spx = _mesh.spy = 0.0;

          _x = CALENDAR_POSITION_X + CUBE_DEFAULT_WIDTH * j;
          _y = CALENDAR_POSITION_Y + i * CUBE_DEFAULT_HEIGHT;
          this.setPosition(_mesh, _x, _y, CUBE_DEFAULT_HEIGHT * 0.5);
          _mesh.scale.set(CUBE_DEFAULT_WIDTH, CUBE_DEFAULT_HEIGHT, 1);

          scene.add(_mesh);
          _cube.push(_mesh);
        }
      }

      _geometry = new THREE.CircleGeometry(1, 64);
      _material = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true});
      _mesh = new THREE.Mesh(_geometry, _material);
      this.setPosition(_mesh, 50, 50, CUBE_DEFAULT_HEIGHT);
      scene.add(_mesh);
      this.circle = _mesh;

      // set gui pannel
      this.controls = new function() {
        this.fps = "0";
        this.keyInputMode = true;
        this.saturation = 25;
        this.lightness = 0;
        this.row = 1;
        this.col = 4;
        this.circleRadius = 500;
        this.isShowCircle = false;
      };
      this.gui = new dat.GUI();
      this.gui.add(this.controls, 'fps').listen();
      this.gui.add(this.controls, 'keyInputMode');
      this.gui.add(this.controls, 'saturation', -100, 100).step(1);
      this.gui.add(this.controls, 'lightness', -100, 100).step(1);
      this.gui.add(this.controls, 'row', 1, 5).step(1);
      this.gui.add(this.controls, 'col', 0, 10).step(1);
      this.gui.add(this.controls, 'circleRadius', 0, 700);
      this.gui.add(this.controls, 'isShowCircle');
      // end gui
    }

    Cube.prototype.update = function(x, y) {
      var _cube, _dist, _color, _dx, _dy, _pwr;
      var _guiX, _guiY;
      var _limit = 15;
      var _xIndex = 0, _yIndex = 0;
      var _time = (new Date()).getMilliseconds();

      // for frame rate
      if(this.lastTime > _time){
        this.controls.fps = ""+this.fpsCount;
        this.fpsCount = 1;
      }
      else this.fpsCount += 1;
      this.lastTime = _time;
      // end frame rate

      if(this.controls.keyInputMode){
        _cube = this.cube[YINDEX][XINDEX];
        x = _cube.position.x; y = _cube.position.y;
        _dx = x - this.kx;
        _dy = y - this.ky;
        this.kx = x; this.ky = y;
        _xIndex = XINDEX; _yIndex = YINDEX;
      }
      else{
        _xIndex = Math.floor((x + 960) / CUBE_DEFAULT_WIDTH), _yIndex = Math.floor((540 - y) / CUBE_DEFAULT_HEIGHT);
        if(this.mx == -1)
          _dx = _dy = 0;
        else {
          _dx = x - this.mx;
          _dy = y - this.my;
        }
      }

      this.mx = x; this.my = y;

      // for debug
      var _opacity = this.controls.isShowCircle ? 1 : 0;
      this.circle.position.x = x;
      this.circle.position.y = y;
      this.circle.scale.x = this.controls.circleRadius;
      this.circle.scale.y = this.controls.circleRadius;
      this.circle.material.opacity = 0.3 * _opacity;
      // end for debug


      // dx/dy -> more than _limit
      if(_dx > 0 && _dx < _limit) _dx = _limit;
      else if(_dx < 0 && _dx > -_limit) _dx = -_limit;
      if(_dy > 0 && _dy < _limit) _dy = _limit;
      else if(_dy < 0 && _dy > -_limit) _dy = -_limit;


      for(var i = 0; i < this.cube.length; ++i){
        for(var j = 0; j < this.cube[i].length; ++j){
          _cube = this.cube[i][j];

          // start color Effect
          _dist = this.intersectCircle(x, y, _cube.position.x, _cube.position.y, this.controls.circleRadius);
          _color = new THREE.Color(ColorTable.getColor(i, j));
          this.colorEffect(_cube, _dist, _color);
          // end color effect

          // start flip Effect
          _guiX = Math.floor(this.controls.col);
          _guiY = Math.floor(this.controls.row - 1);
          if(j >= _xIndex - _guiX && j <= _xIndex + _guiX
              && i >= _yIndex - _guiY && i <= _yIndex + _guiY){
              _pwr = _guiX - Math.abs(j - _xIndex);
              _pwr = 0.2 + 0.8 * _pwr / _guiX;
              if(!(_cube.spy != 0 && _dx == 0))
                _cube.spy = (_dx * Math.PI / 180) * _pwr;
              if(!(_cube.spx != 0 && _dy == 0)){
                _cube.spx = (-_dy * Math.PI / 180) * _pwr;
              }
          }
          this.repulsion(_cube);
          // end flip Effect
        }
      }
    }

    Cube.prototype.keyUpdate = function(x, y) {
      if(!this.controls.keyInputMode) return;
      if(!(XINDEX + x < 0 || XINDEX + x >= COL))
        XINDEX += x;
      if(!(YINDEX + y < 0 || YINDEX + y >= ROW))
        YINDEX += y;
    }

    Cube.prototype.colorEffect = function(c, dist, color) {
      var _hsl, _s, _l;
      _hsl = color.getHSL();
      _s = Math.max(0, Math.min(1.0, _hsl.s + dist * this.controls.saturation * 0.01));
      _l = Math.max(0, Math.min(1.0, _hsl.l + dist * this.controls.lightness * 0.01));
      c.material.color.setHSL(_hsl.h, _s, _l);
    }

    Cube.prototype.repulsion = function(c) {
      var _pwr = 0.27;

      c.rotation.x += c.spx;
      c.rotation.y += c.spy;

      c.spx *= 0.88;
      c.spy *= 0.88;

      c.rotation.x += (0 - c.rotation.x) * _pwr;
      c.rotation.y += (0 - c.rotation.y) * _pwr;
    }

    Cube.prototype.intersectCircle = function(x, y, cx, cy, r) {
      var d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      var _result = 0;
      if(d > r) return 0;
      _result = r - d;
      return (_result / r);
    }

    Cube.prototype.getDistance = function(x1, y1, x2, y2) {
      var x = x2 - x1, y = y2 - y1;
      return Math.sqrt(x * x + y * y);
    }

    // you can set coordinates as follows below
    // 0, 0    -----   1920, 0
    // 0, 1080 -----   1920, 1080
    Cube.prototype.setPosition = function(obj, x, y, z) {
      obj.position.x = X + x;
      obj.position.y = Y - y;
      obj.position.z = z;
    }

    return new Cube();
})();
