let scoreCircle;
let ui;
let gameManager;
let noiseScale=500, noiseStrength=1, centerCircleRadius = 170;
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
let receipt;

let closed_hand;
let open_hand;
let clock;

function mouseWheel(event) {
  window.scrollBy(0,event.delta);
}

function preload(){
  toothbrush = loadImage("https://cdn.iconscout.com/icon/free/png-256/toothbrush-1828030-1551575.png");
  message = loadImage("images/SpeechBubble.png");
  phoneAlert = loadImage("images/PhoneAlert.png");
  email = loadImage("images/Email.png");
  heart = loadImage("images/Heart.png");
  brokenHeart = loadImage("images/BrokenHeart.png");
  notes = loadImage("images/Writing.png");
  groceries = loadImage("images/Groceries.png");
  medicine = loadImage("images/Pills.png");
  broom = loadImage("images/Broom.png");
  calendar = loadImage("images/Calendar.png");
  emailAlert = loadImage("images/EmailAlert.png");
  money = loadImage("images/Money.png");
  phone = loadImage("images/Phone.png");
  receipt = loadImage("images/Receipt.png");
  
  closed_hand = loadImage("https://img.icons8.com/external-soft-fill-juicy-fish/512/external-grab-cursors-soft-fill-soft-fill-juicy-fish-2.png");
  open_hand = loadImage("https://img.icons8.com/external-soft-fill-juicy-fish/512/external-hand-cursors-soft-fill-soft-fill-juicy-fish-2.png");
  clock = loadImage("images/ClockFace.png");
}

function windowResized() {
  resizeCanvas(windowWidth*0.888, windowHeight);
}

function setup() {
  createCanvas(windowWidth*0.888, windowHeight);
  noStroke();

  matter.init();
  matter.mouseInteraction(canvas);
  matter.zeroGravity();
  scoreCircle = new ScoreCircle(centerCircleRadius);
  ui = new UI();
  gameManager = new GameManager();
  
  startButtonFill = color(108, 47, 0);
  startBtnOriginX = width/2-75;
  startBtnOriginY = height/2-50;
  
  step = round(width/25);
}

function mousePressed() {
  if (mouseX >= startBtnOriginX && mouseX <= startBtnOriginX+150 && mouseY >= startBtnOriginY && mouseY <= startBtnOriginY+100) {
    startButtonFill = color(146, 73, 17);
  }
}

function mouseReleased(){
  if (mouseX >= startBtnOriginX && mouseX <= startBtnOriginX+150 && mouseY >= startBtnOriginY && mouseY <= startBtnOriginY+100) {
    startGame = true;
  }
  else{
    startButtonFill = color(108, 47, 0);
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
      fill(color(146, 73, 17));
    }
    rect(startBtnOriginX, startBtnOriginY, 150, 100, 20, 20);
    fill(146, 111, 17);
    stroke(210, 176, 81);
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

      //Draw score circle under objects
      scoreCircle.draw();

      //PHYSICS
      for (let i = 0; i < gameManager.objects.length; i++) {
        let o = gameManager.objects[i];
        o.move();
        o.draw();
        if (o.rigidbody.isOffCanvas(100)) {
          matter.forget(o.rigidbody);
          gameManager.objects.splice(i, 1);
          //splice returns an array of spliced objects which is why we list index here
          //gameManager.uninstantiatedObjects.push(gameManager.objects.splice(i, 1)[0]);
        }
      }

      //UI
      ui.drawHand();
      ui.drawScoreBar();
    }
    //GAME OVER
    else{
      textFont("Gill Sans");
      background('rgba(0,0,0,0.05)');
      fill(color(146, 73, 17));
      textSize(width/10);
      textAlign(CENTER, CENTER);
      text('it all fell apart...', width/2, height/2);
      textSize(width/20);
      fill(color(146, 111, 17));
      text("It's okay though, it's just a game", width/2, height/2+100);
    }
  }
}

function playAgainButtton(){
  startGame = false;
  setup();
  cursor();
}

function drawBackground(){
  if(frameRate() < 40 && step < width/20){
    step += 2;
  }
  else if(frameRate()>100){
    step -= 2;
  }
  
  noStroke();
  let n;
  let from = color(218, 165, 32);
  let to = color(72, 61, 139);
  let circleSize = step+step/2;
  let numNoiseCalls = 0;
  let numCalls = 0;
  let intStep = step;//round(step);
  background(color(72, 61, 139));
  for(let x = 0; x < width+2*intStep; x+=intStep){
    for(let y = 0; y < height+2*intStep; y+=intStep){
      numCalls += 1;
      if(round(x+y) % 2 == 0){
        n = noise(x/noiseScale,y/noiseScale,frameCount/noiseScale);
        numNoiseCalls += 1;
      }
      let c = lerpColor(from, to, n);
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
    ellipse(width/2, height/2, this.radius*2);
    image(clock, width/2-centerCircleRadius, height/2-centerCircleRadius, centerCircleRadius*2, centerCircleRadius*2);
  }

  getObjectsInside(){
    this.objectsInside = [];
    for(let i = 0; i < gameManager.objects.length; i++){
      let object = gameManager.objects[i];
      if (dist(object.rigidbody.getPositionX(), object.rigidbody.getPositionY(), width/2, height/2) <= this.radius){
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
    let dimensions = [240, 10, width-500, 15, 5];
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
    text('Keep it together!', width/2, dimensions[1]+textSize());
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
    let theta = atan((mouseY-height/2)/(mouseX-width/2)) + PI/2;
    if(mouseX < width/2){
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
      forceFraction = 8;
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
    super(x,y,message.width/5, message.height/5);
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

class Phone extends Rectangle{
  constructor(x,y){
    super(x,y,phone.width/5, phone.height/5);
    this.sprite = phone;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}

class PhoneAlert extends Rectangle{
  constructor(x,y){
    super(x,y,phoneAlert.width/6, phoneAlert.height/6);
    this.sprite = phoneAlert;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}

class Email extends Rectangle{
  constructor(x,y){
    let img = random([email, emailAlert]);
    super(x,y,img.width/7, img.height/7);
    this.sprite = img;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}

class Receipt extends Rectangle{
  constructor(x,y){
    super(x,y,receipt.width/5, receipt.height/5);
    this.sprite = receipt;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}

class Heart extends Rectangle{
  constructor(x,y){
    let img = random([heart, brokenHeart]);
    super(x,y,img.width/4, img.height/4);
    this.sprite = img;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}

class Notes extends Rectangle{
  constructor(x,y){
    super(x,y,notes.width/7, notes.height/7);
    this.sprite = notes;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}

class Groceries extends Rectangle{
  constructor(x,y){
    super(x,y,groceries.width/6, groceries.height/6);
    this.sprite = groceries;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}

class Medicine extends Rectangle{
  constructor(x,y){
    super(x,y,medicine.width/5, medicine.height/5);
    this.sprite = medicine;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}

class Broom extends Rectangle{
  constructor(x,y){
    super(x,y,broom.width/5, broom.height/5);
    this.sprite = broom;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}

class Calendar extends Rectangle{
  constructor(x,y){
    super(x,y,calendar.width/6, calendar.height/6);
    this.sprite = calendar;
  }
  draw(){
    push();
    translate(this.rigidbody.getPositionX(), this.rigidbody.getPositionY());
    rotate(this.rigidbody.getAngle());
    image(this.sprite, -this.rigidbody.getWidth()/2, -this.rigidbody.getHeight()/2, this.rigidbody.getWidth(), this.rigidbody.getHeight());
    pop();
  }
}

class Money extends Rectangle{
  constructor(x,y){
    super(x,y,money.width/5, money.height/5);
    this.sprite = money;
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
    for (let i = 0; i < 10; i++) {
      this.uninstantiatedObjects.push(this.spawnObject(i));
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

  spawnObject(i=-1){
    if(i == -1)
      i = int(random(0,11));
    switch(i){
      case 0:
        return new Message(random(width, width+50), random(50, height-50));
      case 1:
        return new PhoneAlert(random(width, width+50), random(50, height-50));
      case 2:
        return new Email(random(width, width+50), random(50, height-50));
      case 3:
        return new Heart(random(width, width+50), random(50, height-50));
      case 4:
        return new Notes(random(width, width+50), random(50, height-50));
      case 5:
        return new Medicine(random(width, width+50), random(50, height-50));
      case 6:
        return new Broom(random(width, width+50), random(50, height-50));
      case 7:
        return new Calendar(random(width, width+50), random(50, height-50));
      case 8:
        return new Money(random(width, width+50), random(50, height-50));
      case 9:
        return new Phone(random(width, width+50), random(50, height-50));
      case 10:
        return new Receipt(random(width, width+50), random(50, height-50));
    }
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
    let c = dist(pos.x, pos.y, width/2, height/2);
    let dirX = (pos.x-width/2)/c;
    let dirY = (pos.y-height/2)/c;
    object.rigidbody.setVelocity(-dirX, -dirY);
    return object;
  }
}