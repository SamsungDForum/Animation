var App = App || (function (){
  function App(){
    this.renderer = this.camera = this.scene = null;
    this.mouse = new THREE.Vector2();
    this.keyInput = {x:0, y:0};
    this.isJSONLoad = false;
  }

  App.prototype.constructor = App;

  App.prototype.initialize = function() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    var _canvas = document.createElement("canvas");
    var isWebglSupported = window.WebGLRenderingContext && (_canvas.getContext("webgl") || _canvas.getContext("experimental-webgl"));
    this.renderer = isWebglSupported ? new THREE.WebGLRenderer({alpha: true}) : new THREE.CanvasRenderer({alpha: true});
    this.renderer.setSize(this.width, this.height);

    $('body').append(this.renderer.domElement);

    const _w = this.width * 0.5;
    const _h = this.height * 0.5;
    this.camera = new THREE.OrthographicCamera(-_w, _w, _h, -_h, 0, 1000);
    this.camera.position.z = 1000;

    this.scene = new THREE.Scene();

    document.addEventListener( 'mousemove', this.onMouseMove.bind(this), false);
    document.addEventListener( 'keyup', this.onKeyUp.bind(this));
    document.addEventListener( 'keydown', this.onKeyDown.bind(this));

    var _leftColorSet, _rightColorSet, _hardLightColorSet;
    var _this = this;
    $.getJSON("./config.json", function(data){
      _this.isJSONLoad = Cube.initialize({scene: _this.scene
        , leftColor: data.color.left, rightColor: data.color.right, hardLightColor: data.color.hardLight
        , row: data.row, col: data.col});
    });

    requestAnimationFrame( (t) => { this.onAnimate(t); } );
  }

  App.prototype.onAnimate = function(t) {
    requestAnimationFrame( (t) => { this.onAnimate(t); } );
    if(this.isJSONLoad) {
      Cube.keyUpdate(this.keyInput.x, this.keyInput.y);
      Cube.update(this.mouse.x, this.mouse.y);
    }
    this.render();
  }

  App.prototype.onMouseMove = function( e ) {
    event.preventDefault();
    this.mouse.x = event.clientX - 960;
    this.mouse.y = 540 - event.clientY;
  }

  App.prototype.onKeyDown = function(e) {
    if(e.keyCode == 37 || e.keyCode == 39){
      this.keyInput.x = e.keyCode - 38;
    }
    if(e.keyCode == 38 || e.keyCode == 40){
      this.keyInput.y = e.keyCode - 39;
    }
  }

  App.prototype.onKeyUp = function(e) {
    if(e.keyCode == 37 || e.keyCode == 39){
      if(this.keyInput.x + 38 == e.keyCode) this.keyInput.x = 0;
    }
    if(e.keyCode == 38 || e.keyCode == 40){
      if(this.keyInput.y + 39 == e.keyCode) this.keyInput.y = 0;
    }
  }

  App.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
  }

  return new App();
})();
