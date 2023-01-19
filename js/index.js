    var Engine = Matter.Engine;
    var Render = Matter.Render;
    var Mouse = Matter.Mouse;
    var MouseConstraint = Matter.MouseConstraint;
    var World = Matter.World;
    var Bodies = Matter.Bodies;
    var Body = Matter.Body;
    var Events = Matter.Events;
  
  const width = 1000;
  const height = 850;
  const xStart = width / 2;
  const yStart = 100;
  const rows = 18;
  const ballRadius = 10;
  const pegGap = 4 * ballRadius;
  const pegRadius = 0.2 * ballRadius;
  let xGap = pegGap;
  let yGap = 0.5 * xGap;
  const maxBalls = 250;
  const restitution = 0.6;
  const friction = 0.05;
  const frictionAir = 0.06;
  const frictionStatic = 0;
  const slop = 0;
  const gravity = 1;
  const gravitySF = 0.0018;
  const timeScale = 1;
  

let engine = Engine.create();
engine.timing.timeScale = timeScale;
Engine.run(engine);
  
let render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width,
      height,
      wireframes: false,
      showAngleIndicator: false,
      background: "#000"
    }
  });
Render.run(render);
let world = engine.world;
  world.gravity.scale = gravitySF;
const buckettoStartGap = 50;
const bucketwallLength = 600;
const bucketwallAngle = Math.PI / 4;
const bucketOpening = 6 * ballRadius;
// pozice sten kosiku
let leftBumper_xpos = xStart - (bucketwallLength * Math.cos(bucketwallAngle) + bucketOpening) / 2;
let bumpers_ypos = yStart - ((bucketwallLength * Math.sin(bucketwallAngle)) / 2 + buckettoStartGap);
let rightBumper_xpos = xStart + (bucketwallLength * Math.cos(bucketwallAngle) + bucketOpening) / 2;

//generace kosiku
function createTopBucket(){
    let leftBumper = Bodies.rectangle(leftBumper_xpos, bumpers_ypos, bucketwallLength, 5, {
      restitution,
      friction: 0,
      frictionStatic: 0,
      isStatic: true
    });
    Body.rotate(leftBumper, bucketwallAngle);
  
    let rightBumper = Bodies.rectangle(rightBumper_xpos, bumpers_ypos, bucketwallLength, 5, {
      restitution,
      friction: 0,
      isStatic: true
    });
    Body.rotate(rightBumper, -bucketwallAngle);
  
    World.add(world, [leftBumper, rightBumper]);
  }
  createTopBucket();
  
  const starttoPegsGap = 10;
  const rowOffset = 5;

// generace tecek
function createPegs(){
    for (let row = 0 + rowOffset; row < rows + rowOffset; row++) {
      let yOffset = yGap * (row - rowOffset) + starttoPegsGap;
      let xRowOffset = (xGap * row - xGap) / 2;
      for (let j = 0; j < row; j++) {
        let xOffset = xGap * j;
        let peg = Bodies.circle(xStart - xRowOffset + xOffset, yStart + yOffset, pegRadius, {
          restitution,
          friction,
          isStatic: true
        });
        World.add(world, peg);
      }
    }
  }
  createPegs();
  
//zakladna piliru
  const pegstoBaseGap = yGap;
  const floorHeight = 20;
  let floor = Bodies.rectangle(xStart, height - floorHeight / 2, width - 4, floorHeight, {
    restitution: 0,
    isStatic: true
  })
  World.add(world, floor);
//pilire
  let wallHeight = height - (yStart + starttoPegsGap + rows * yGap + pegstoBaseGap);
  const createPartitionSet = () => {
    for (let i = 0; i < rows + rowOffset + 1; i++) {
      let partition = Bodies.rectangle(
        xStart - ((rows + rowOffset - 1) * pegGap) / 2 + (i - 0.5) * pegGap,
        height - (floorHeight + wallHeight / 2),
        4,
        wallHeight,
        {
          isStatic: true
        }
      );
      World.add(world, partition);
    }
  }
  createPartitionSet();
  
//nahodny generator
  let randomPosNeg = () => {
    let random = Math.sin(2 * Math.PI * Math.random());
    return random;
  }
  let vx = () => {
    return 0.3 * randomPosNeg();
  }
 
  
//mice
  function addBall(x, y){
    let ball = Bodies.circle(x, y, ballRadius, {
      restitution,
      friction,
      frictionAir,
      slop,
      isStatic: false,
      label: "ball"
    });
    Body.setVelocity(ball, { x: vx(), y: 0 });
    Body.setAngularVelocity(ball, randomPosNeg() / 8);
    World.add(world, ball);
  }
  let createBalls = (numberBalls) => {
    for (let i = 0; i < numberBalls; i++) {
      addBall(xStart + randomPosNeg() * numberBalls, yStart - 300 - i * ballRadius);
    }
  }
  createBalls(maxBalls);
  
function existingBalls(){
    return world.bodies.filter((body) => body.label === "ball");
  };
//zpevni micky po tom co spadnou mezi pilire
const makeStaticInterval = setInterval(() => {
    existingBalls().forEach(function(ball) {
      let minHeight = height - (floorHeight + wallHeight);
      if (ball.position.y > minHeight && ball.speed < 1) {
        Body.set(ball, { isStatic: true });
      }
    });
  }, 1200);

//ovladani mysi
  let mouse = Mouse.create(render.canvas);
  let mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
  });
  
  Events.on(mouseConstraint, "mousedown", (event) => {
    addBall(mouse.position.x, mouse.position.y);
  });