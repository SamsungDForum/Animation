var ColorTable = ColorTable || (function() {
    function ColorTable(){
      this.colorTable = [];
      this.sampleTable = null;
    }

    ColorTable.prototype.constructor = ColorTable;

    // lc : left Color Set
    // rc : right Color Set
    // hl : HardLight Color Set
    ColorTable.prototype.createColorPattern = function(props) {
      var _row = props.row, _lc = props.lc, _rc = props.rc, _hl = props.hl;
      var step = props.col;
      var _month = [];

      // set base Color Table
      var _index = 0, _isDir = 1;
      for(var i = 0; i < _row; ++i){
        _month[i] = [];
        var _leftColor = new THREE.Color(_lc[_index]);
        var _rightColor = new THREE.Color(_rc[_index]);
        var _result = this.calculateGradient(_leftColor, _rightColor, step);
        _month[i] = _month[i].concat(_result);

        // if the number of row is more than color in Color-set,
        // Color-set repeats itself.
        // for example, 1 2 3 4 5 6 5 4 3 2 1 2 3 4 ...
        // if they are the same, it doesn't need to use
        if(_index + _isDir < 0 || _index + _isDir >= _lc.length || _index + _isDir >= _rc.length)
          _isDir *= -1;
        _index += _isDir;
      }
      // end base Color Table


      //Create Hardlight Color Table
      var _colTable = [];
      var _top = new THREE.Color(_hl[0]), _middle = new THREE.Color(_hl[1]), _bottom = new THREE.Color(_hl[2]);
      var _mPoint = Math.floor(_row / 2);
      var _r1 = this.calculateGradient(_top, _middle, _mPoint + 1);
      _r1.pop();
      var _r2 = this.calculateGradient(_middle, _bottom, _row - _mPoint);
      _colTable = _r1.concat(_r2);
      //End Hardlight Color Table

      //start Hardlight blending
      var _radian = Math.PI / 180;
      var _alpha, _degree;
      var src, dest;
      for(var i = 0; i < _row; ++i){
        this.colorTable[i] = [];
        dest = _colTable[i];
        for(var j = 0; j < step; ++j){
          src = _month[i][j];
          _degree = 30 * j * _radian;
          _alpha = ((Math.sin(_degree) + 1) * 0.5) * 0.5;
          _month[i][j] = this.calculateHardLight(src, dest, _alpha);
          this.colorTable[i].push(new THREE.Color(_month[i][j]));
        }
      }
      //End Hardlight blending
      this.sampleTable = _month;
    }

    ColorTable.prototype.calculateGradient = function(src, dest, step){
      var _arrColor = [];
      _arrColor.push(src);
      for(var i = 1; i < step - 1; ++i){
        var _color = new THREE.Color();
        _color.r = src.r * ( 1 - (i / (step - 1))) + dest.r * (i / (step - 1));
        _color.g = src.g * ( 1 - (i / (step - 1))) + dest.g * (i / (step - 1));
        _color.b = src.b * ( 1 - (i / (step - 1))) + dest.b * (i / (step - 1));
        _arrColor.push(_color);
      }
      _arrColor.push(dest);
      return _arrColor;
    }

    ColorTable.prototype.calculateHardLight = function(src, dest, alpha){
      var _hardlight = new THREE.Color();
      var _color = new THREE.Color();

      if(dest.r < 0.5)  _hardlight.r = 2 * src.r * dest.r;
      else              _hardlight.r = 1 - 2 * (1 - src.r) * (1 - dest.r);

      if(dest.g < 0.5)  _hardlight.g = 2 * src.g * dest.g;
      else              _hardlight.g = 1 - 2 * (1 - src.g) * (1 - dest.g);

      if(dest.b < 0.5)  _hardlight.b = 2 * src.b * dest.b;
      else              _hardlight.b = 1 - 2 * (1 - src.b) * (1 - dest.b);

      _color.r = src.r * (1 - alpha) + _hardlight.r * alpha;
      _color.g = src.g * (1 - alpha) + _hardlight.g * alpha;
      _color.b = src.b * (1 - alpha) + _hardlight.b * alpha;

      return _color;
    }

    ColorTable.prototype.getColorTable = function() {
      return this.sampleTable;
    }
    ColorTable.prototype.getColor = function(i, j) {
      return this.sampleTable[i][j];
    }

    ColorTable.prototype.clearTable = function() {
      for(var i = 0; i < this.colorTable.length; ++i){
        for(var j = 0; j < this.colorTable[i].length; ++j){
          this.sampleTable[i][j] = new THREE.Color(this.colorTable[i][j]);
        }
      }
    }

    return new ColorTable();
})();
