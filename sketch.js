//let floor;
//let ceiling;
let scoreCircle;
let ui;
let gameManager;
let noiseScale=500, noiseStrength=1, centerCircleRadius = 150;

function preload(){
}

function setup() {
  createCanvas(windowWidth-20, windowHeight-20);
  noStroke();

  matter.init();
  matter.mouseInteraction(canvas);
  matter.zeroGravity();

  //floor = matter.makeBarrier(width / 2, -50, width, 100);
  //ceiling = matter.makeBarrier(width / 2, height + 50, width, 100);
  //leftWall = matter.makeBarrier(-50, height / 2, 100, height);
  //rightWall = matter.makeBarrier(width + 50, height / 2, 100, height);
  scoreCircle = new ScoreCircle(centerCircleRadius);
  ui = new UI();
  gameManager = new GameManager();
}

/*function mousePressed() {
}*/

function draw() {
  background(0);

  //GAME LOGIC
  scoreCircle.getObjectsInside();
  ui.calculateScore();
  gameManager.doTick();

  //PHYSICS
  for (let i = 0; i < gameManager.objects.length; i++) {
    let o = gameManager.objects[i];
    o.move();
    o.draw();
    if (o.rigidbody.isOffCanvas(100)) {
      matter.forget(o.rigidbody);
      //splice returns an array of spliced objects which is why we list index here
      gameManager.uninstantiatedObjects.push(gameManager.objects.splice(i, 1)[0]);
    }
  }

  //UI
  scoreCircle.draw();
  ui.drawScoreBar();
}

class ScoreCircle{
  constructor(radius){
    this.radius = radius;
    this.objectsInside = [];
  }

  draw(){
    drawingContext.setLineDash([5, 10, 30, 10]);
    stroke(255);
    noFill();
    ellipse(windowWidth/2, windowHeight/2, this.radius*2);
  }

  getObjectsInside(){
    this.objectsInside = [];
    for(let i = 0; i < gameManager.objects.length; i++){
      let object = gameManager.objects[i];
      if (dist(object.rigidbody.getPositionX(), object.rigidbody.getPositionY(), windowWidth/2, windowHeight/2) <= this.radius){
        this.objectsInside.push(object);
      }
    }
  }
}

class UI{
  constructor(){
    this.score = 100;
  }

  drawScoreBar(){
    let dimensions = [240, 10, windowWidth-500, 15, 5];
    let alpha = map(min(this.score, 90), 90, 70, 0, 1, true);
    //background
    noStroke();
    fill('rgba(150,150,150,' + min(alpha, 0.25) + ')');
    rect(dimensions[0], dimensions[1], dimensions[2], dimensions[3], dimensions[4]);
    //progress
    fill('rgba(255,50,100,' + alpha + ')');
    rect(dimensions[0]+1, dimensions[1]+1, max(this.score/100*dimensions[2]-1, 1), dimensions[3]-1, dimensions[4]);
    //outline
    stroke('rgba(255,255,255,' + alpha + ')');
    noFill();
    drawingContext.setLineDash([5, 5]);
    rect(dimensions[0], dimensions[1], dimensions[2], dimensions[3], dimensions[4]);
  }

  calculateScore(){
    if(gameManager.objects.length > 0){
      let percentInside = map(scoreCircle.objectsInside.length, 0, gameManager.objects.length, 0, 100, true);
      let damage = map(percentInside, 0, 100, 0.08, -0.01);
      this.score -= damage;
    }
  }
}

class PhysicsObject{
  constructor(){
    if (this.draw === undefined){
      throw new TypeError('Classes extending the abstract class "PhysicsObject" must contain "draw()"')
    }
    if (this.remember === undefined){
      throw new TypeError('Classes extending the abstract class "PhysicsObject" must contain "remember()"');
    }
  }

  move(){
    let x = this.rigidbody.getPositionX();
    let y = this.rigidbody.getPositionY();
    let angle=noise(x/noiseScale, y/noiseScale, frameCount/noiseScale)*TWO_PI*noiseStrength;
    let forceFraction = 100;
    if (scoreCircle.objectsInside.includes(this)){
      forceFraction = 500;
    }
    this.addForce(cos(angle)/forceFraction, sin(angle)/forceFraction);
  }

  addForce(x,y){
    let xv = this.rigidbody.getVelocityX();
    let yv = this.rigidbody.getVelocityY();
    this.rigidbody.setVelocity(xv + x, yv + y);
  }
}

class Rectangle extends PhysicsObject{
  constructor(x,y,w,h){
    super();
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    let randomBlock = matter.makeBlock(x, y, w, h, {frictionAir: 0.01});
    randomBlock.color = color(random(0, 255), random(0, 255), random(0, 255));
    randomBlock.setAngle(random(0,360));
    this.rigidbody = randomBlock;
  }

  draw(){
    fill(this.rigidbody.color);
    noStroke();
    this.rigidbody.show();
  }

  remember(){
    let randomBlock = matter.makeBlock(this.x, this.y, this.w, this.h, {frictionAir: 0.01});
    randomBlock.color = color(random(0, 255), random(0, 255), random(0, 255));
    randomBlock.setAngle(random(0,360));
    this.rigidbody = randomBlock;
  }
}

class ToothBrush extends Rectangle{
  constructor(x,y,sprite){
    super(x,y,200,50);
    this.sprite = sprite;
  }
  draw(){

  }
}

class GameManager{
  constructor(){
    this.objects = [];
    this.timerLength = 5;
    this.uninstantiatedObjects = [];
    for (let i = 0; i < 4; i++) {
      this.uninstantiatedObjects.push(this.spawnObject());
    }
    this.timer = this.timerLength;
  }

  doTick(){
    this.timer -= 1/frameRate();
    if (this.timer <= 0){
      this.timer = this.timerLength;
      this.objects.push(this.getObject());
    }
  }

  spawnObject(){
    let newObj = new Rectangle(random(windowWidth, windowWidth+50), random(50, windowHeight-50), 40, 40);
    return newObj;
  }

  getObject(){
    let object;
    if (this.uninstantiatedObjects.length == 0){
      object = this.spawnObject();
    } else {
      object = this.uninstantiatedObjects.pop(); 
      object.remember();
    }
    let pos = createVector(object.rigidbody.getPositionX(), object.rigidbody.getPositionY());
    let c = dist(pos.x, pos.y, windowWidth/2, windowHeight/2);
    let dirX = (pos.x-windowWidth/2)/c;
    let dirY = (pos.y-windowHeight/2)/c;
    object.rigidbody.setVelocity(-dirX, -dirY);
    return object;
  }
}