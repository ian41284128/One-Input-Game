let floor;
let ceiling;
let objects = [];
let noiseScale=500, noiseStrength=1, centerCircleRadius = 150;

function setup() {
  createCanvas(windowWidth-20, windowHeight-20);
  noStroke();

  matter.init();
  matter.mouseInteraction(canvas);
  matter.zeroGravity();

  floor = matter.makeBarrier(width / 2, -50, width, 100);
  ceiling = matter.makeBarrier(width / 2, height + 50, width, 100);
  leftWall = matter.makeBarrier(-50, height / 2, 100, height);
  rightWall = matter.makeBarrier(width + 50, height / 2, 100, height);

  for (let i = 0; i < 10; i++) {
    // var randomBall = matter.makeBall(random(0, width), random(0, height), random(30, 60), {frictionAir: 0.01});
    // randomBall.color = color(random(0, 255), random(0, 255), random(0, 255));
    // objects.push(randomBall);
    // randomBall.setVelocity(random(-1,1),random(-1,1));
    objects.push(new Rectangle(random(0, windowWidth), random(0, windowHeight), 40, 40));
  }
}

/*function mousePressed() {
}*/

function draw() {
  background(0);

  for (let i = 0; i < objects.length; i++) {
    let o = objects[i];
    fill(o.rigidbody.color);
    noStroke();
    o.move();
    o.rigidbody.show();
    if (o.rigidbody.isOffCanvas()) {
      matter.rigidBody.forget(o);
      objects.splice(i, 1);
    }
  }

  drawingContext.setLineDash([5, 10, 30, 10]);
  stroke(255);
  noFill();
  ellipse(windowWidth/2, windowHeight/2, centerCircleRadius*2);
}

class PhysicsObject{
  constructor(sprite){
    if (this.pointInside === undefined) {
      throw new TypeError('Classes extending the abstract class "PhysicsObject" must contain "pointInside()"');
    }
    this.sprite = sprite;
  }

  move(){
    let x = this.rigidbody.getPositionX();
    let y = this.rigidbody.getPositionY();
    let angle=noise(x/noiseScale, y/noiseScale, frameCount/noiseScale)*TWO_PI*noiseStrength;
    let forceFraction = 100;
    if (dist(x,y,windowWidth/2,windowHeight/2) <= centerCircleRadius){
      forceFraction = 500;
    }
    this.addForce(cos(angle)/forceFraction, sin(angle)/forceFraction);
  }

  addForce(x,y){
    let xv = this.rigidbody.getVelocityX();
    let yv = this.rigidbody.getVelocityY();
    this.rigidbody.setVelocity(xv + x, yv + y);
  }

  show(){

  }
}

class Rectangle extends PhysicsObject{
  constructor(x,y,w,h){
    super(null);

    var randomBlock = matter.makeBlock(x, y, w, h, {frictionAir: 0.01});
    randomBlock.color = color(random(0, 255), random(0, 255), random(0, 255));
    randomBlock.setAngle(random(0,360));
    randomBlock.options = {frictionAir: 0};
    this.rigidbody = randomBlock;
  }

  pointInside(x,y){

  }
}