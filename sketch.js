let scoreCircle;
let ui;
let gameManager;
let noiseScale=500, noiseStrength=1, centerCircleRadius = 150;
let startGame = false;

let startButtonFill;
let startBtnOriginX;
let startBtnOriginY;

let step;

let toothbrush;
let message;
let phoneAlert;
let email;
let heart;
let brokenHeart;
let notes;
let groceries;
let medicine;
let broom;
let calendar;
let emailAlert;
let money;
let phone;
let closed_hand;
let open_hand;

function preload(){
  toothbrush = loadImage("https://cdn.iconscout.com/icon/free/png-256/toothbrush-1828030-1551575.png");
  message = loadImage("SpeechBubble.png");
  phoneAlert = loadImage("PhoneAlert.png");
  email = loadImage("Email.png");
  heart = loadImage("Heart.png");
  brokenHeart = loadImage("BrokenHeart.png");
  notes = loadImage("Writing.png");
  groceries = loadImage("Groceries.png");
  medicine = loadImage("Pills.png");
  broom = loadImage("Broom.png");
  calendar = loadImage("Calendar.png");
  emailAlert = loadImage("EmailAlert.png");
  money = loadImage("Money.png");
  phone = loadImage("Phone.png");
  
  closed_hand = loadImage("https://img.icons8.com/external-soft-fill-juicy-fish/512/external-grab-cursors-soft-fill-soft-fill-juicy-fish-2.png");
  open_hand = loadImage("https://img.icons8.com/external-soft-fill-juicy-fish/512/external-hand-cursors-soft-fill-soft-fill-juicy-fish-2.png");
}

function setup() {
  createCanvas(windowWidth-20, windowHeight-20);
  noStroke();

  matter.init();
  matter.mouseInteraction(canvas);
  matter.zeroGravity();
  scoreCircle = new ScoreCircle(centerCircleRadius);
  ui = new UI();
  gameManager = new GameManager();
  
  startButtonFill = color(100);
  startBtnOriginX = windowWidth/2-75;
  startBtnOriginY = windowHeight/2-50;
  
  step = round(windowWidth/30);
}

function mousePressed() {
  if (mouseX >= startBtnOriginX && mouseX <= startBtnOriginX+150 && mouseY >= startBtnOriginY && mouseY <= startBtnOriginY+100) {
    startButtonFill = color(50);
  }
}

function mouseReleased(){
  if (mouseX >= startBtnOriginX && mouseX <= startBtnOriginX+150 && mouseY >= startBtnOriginY && mouseY <= startBtnOriginY+100) {
    startGame = true;
  }
  else{
    startButtonFill = color(100);
  }
}

function draw() {
  if (!startGame){
    drawBackground();
    noStroke();

    if(mouseX >= startBtnOriginX && mouseX <= startBtnOriginX+150 && mouseY >= startBtnOriginY && mouseY <= startBtnOriginY+100){
      fill(startButtonFill);
    }
    else{
      fill(color(200));
    }
    rect(startBtnOriginX, startBtnOriginY, 150, 100, 20, 20);
    fill(0);
    stroke(255);
    triangle(startBtnOriginX+150/3, startBtnOriginY+100/3.5, startBtnOriginX+150/3, startBtnOriginY+100*(1-1/3.5), startBtnOriginX+150*(2/3), startBtnOriginY+50);
  }
  else{
    //IN GAME
    if(ui.score > 0){
      noCursor();
      drawBackground();
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
      ui.drawHand();
      ui.drawScoreBar();
    }
    //GAME OVER
    else{
      textFont("Baskerville");
      background('rgba(0,0,0,0.05)');
      textSize(windowWidth/10);
      textAlign(CENTER, CENTER);
      text('it all fell apart...', windowWidth/2, windowHeight/2);
    }
  }
}

function playAgainButtton(){
  startGame = false;
  setup();
  cursor();
}

function drawBackground(){
  if(frameRate() < 40 && step < windowWidth/20){
    step += 2;
  }
  else if(frameRate()>100){
    step -= 2;
  }
  let n;
  let from = color(218, 165, 32);
  let to = color(72, 61, 139);
  let circleSize = step+step/2;
  let numNoiseCalls = 0;
  let numCalls = 0;
  let intStep = step;//round(step);
  background(color(72, 61, 139));
  for(let x = 0; x < windowWidth+intStep; x+=intStep){
    for(let y = 0; y < windowHeight+intStep; y+=intStep){
      numCalls += 1;
      if(round(x+y) % 2 == 0){
        n = noise(x/noiseScale,y/noiseScale,frameCount/noiseScale);
        numNoiseCalls += 1;
      }
      let c = lerpColor(from, to, n);
      noStroke();
      fill(c);
      ellipse(x-circleSize/2,y-circleSize/2,circleSize,circleSize);
    }
  }
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

  getPercentInside(){
    return map(this.objectsInside.length, 0, gameManager.objects.length, 0, 100, true);
  }
}

class UI{
  constructor(){
    this.score = 100;
    this.warningTextAlpha = 0;
  }

  drawScoreBar(){
    let dimensions = [240, 10, windowWidth-500, 15, 5];
    let alpha = map(min(this.score, 90), 90, 70, 0, 1, true);
    //background
    noStroke();
    fill('rgba(198, 214, 31,' + min(alpha, 0.2) + ')');
    rect(dimensions[0], dimensions[1], dimensions[2], dimensions[3], dimensions[4]);
    //progress
    fill('rgba(218, 74, 32,' + alpha + ')');
    rect(dimensions[0]+1, dimensions[1]+1, max(this.score/100*dimensions[2]-1, 1), dimensions[3]-1, dimensions[4]);
    //outline
    stroke('rgba(255,255,255,' + alpha + ')');
    noFill();
    drawingContext.setLineDash([5, 5]);
    rect(dimensions[0], dimensions[1], dimensions[2], dimensions[3], dimensions[4]);

    let percentInside = scoreCircle.getPercentInside();
    if(percentInside < 50 && this.warningTextAlpha < 1){
      this.warningTextAlpha += 1/frameRate();
    }
    else if(this.warningTextAlpha > 0){
      this.warningTextAlpha -= 1/frameRate();
    }
    textFont("Gill Sans");
    textSize(40);
    textAlign(CENTER, CENTER);
    fill("rgba(218, 74, 32,"+constrain(this.warningTextAlpha, 0, 1)+")");
    noStroke();
    text('Keep it together!', windowWidth/2, dimensions[1]+textSize());
  }

  calculateScore(){
    if(gameManager.objects.length > 0){
      let percentInside = scoreCircle.getPercentInside();
      this.damage = map(percentInside, 0, 100, 5, -1);
      this.score -= this.damage/frameRate();
    }
  }

  drawHand(){
    push();
    let hand;
    if(mouseIsPressed){
      hand = closed_hand;
    } else {
      hand = open_hand;
    }

    translate(mouseX, mouseY);
    let theta = atan((mouseY-windowHeight/2)/(mouseX-windowWidth/2)) + PI/2;
    if(mouseX < windowWidth/2){
      theta += PI;
    }
    rotate(theta);
    image(hand, -hand.width/2/10, -hand.height/2/10, hand.width/10, hand.height/10);
    pop();
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
    let forceFraction = 2;
    if (scoreCircle.objectsInside.includes(this)){
      forceFraction = 6;
    }
    this.addForce(cos(angle)/forceFraction, sin(angle)/forceFraction);
  }

  addForce(x,y){
    let xv = this.rigidbody.getVelocityX();
    let yv = this.rigidbody.getVelocityY();
    this.rigidbody.setVelocity(xv + x/frameRate(), yv + y/frameRate());
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
  constructor(x,y){
    super(x,y,toothbrush.width/3,toothbrush.height/3);
    this.sprite = toothbrush;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}
class Message extends Rectangle{
  constructor(x,y){
    super(x,y,message.width, message.height);
    this.sprite = message;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
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
    let newObj = new Message(random(windowWidth, windowWidth+50), random(50, windowHeight-50));
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