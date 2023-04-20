const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  app.use(express.static(__dirname + '/public'));
});


let index = 0;
const GRAV = 10;
let keyArray = [];
let spriteArray = [];
class Sprite{
   constructor(x,y,h,src,width){
     this.x=x;
     this.y=y;
     this.h=h;
     this.src=src;
     this.w = width;
     this.l = width;
     this.id = index;
     this.g=GRAV
     index++;
     this.vx = 0;
     this.vy = 0;
     this.vh = 0;
     this.rot = 0;
  }
  update(){
    x += vx;
    y += vy;
    h += vy;
    vy -= g;
    if(h<=1){
      h = 1;
      vy = 0;
    }
  }
}
function initSprites(){
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//qb
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//wr
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//wr
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//wr
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//wr
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//rb
  spriteArray.push(new Sprite(480,480,1,'ball.jpg',16));//ball
}
function moveToTarget(x,y,targetX,targetY,speed){
  deltaX = Math.abs(x-targetX);
  deltaY = Math.abs(y-targetY);
  console.log('x: ' + deltaX);
  console.log('y: ' + deltaY);
  theta = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
  console.log('theta: '+ theta);
  dX = Math.cos(theta)*speed;
  dY = Math.cos(theta)*speed;
  if(targetX < x){
    dX = dX * -1;
  }
  if(targetY > y){
    dY = dY * -1;
  }
  //console.log(dX);
  //console.log(dY);
  return{
    x:dX,
    y:dY
  }
}
function runRoute(obj, route, tick, speed){
  let dy = 0;
  let dx = 0;
  if(tick<route[0]){
    dy = speed;
  }
  else if(route[1] == 45){
    dy = speed;
    dx = speed;
  }
  else if(route[1] == -45){
    dy = speed;
    dx = -(speed);
  }
  else if(route[1] == 135){
    dy = -(speed);
    dx = speed;
  }
  else if(route[1] == -135){
    dy = -(speed);
    dx = -(speed);
  }
  else if(route[1] == 90){
    dy = 0;
    dx = speed;
  }
  else if(route[1] == -90){
    dy = 0;
    dx = -speed;
  }
  return[dx,-dy];

}

const hrtimeMs = function() {
    let time = process.hrtime()
    return time[0] * 1000 + time[1] / 1000000
}
let rArray = [
  [220,0],
  [220,45],
  [220,-45],
  [220,90],
  [220,-90],
  [220,-135],
  [220,135],
  [220,-90],
  [220,90],
  [220,45],
]
const TICK_RATE = 20;
let tick = 0
let previous = hrtimeMs()
let tickLengthMs = 1000 / TICK_RATE
let movex = 750;
let movey = 2280;
let idI = 1;
let gameLoop = false;
let startTeam = 'none'
let ready = 0;
let pStartX = 750;
let pStartY = 2280;
let hiked = false;
let r1 = [];
let r2 = [];
let r3 = [];
let r4 = [];
let routes  =[];
let playTick = 0;
let firstClick = false;
let clickX = 0;
let clickY = 0;
let qbIX = 0;
let qbIY = 0;
let loopStart = false;
io.on('connection', (socket) => {
  socket.emit('updateClientSprites',spriteArray);
  console.log('connection');
  socket.emit('playerId',idI);
  console.log('idI: ' + idI);
    idI++;
  const loop = () => {
      setTimeout(loop, tickLengthMs)
      let now = hrtimeMs()
      let delta = (now - previous) / 1000
      //console.log('delta', delta)
      //game logic
      if(loopStart == false){
        loopStart = true;
        console.log('init in loop')
        socket.emit('moveSprite',5,pStartX + 50,pStartY + 100);
        spriteArray[5].x = pStartX + 50;
        spriteArray[5].y = pStartY + 100;
      }
      socket.emit('getKeys');
      if(keyArray[68] == true && !(hiked)){
        console.log('snapped')
        hiked = true;
        playTick = 0;
        let r1 = rArray[Math.floor(Math.random() * rArray.length)];
        let r2 = rArray[Math.floor(Math.random() * rArray.length)];
        let r3 = rArray[Math.floor(Math.random() * rArray.length)];
        let r4 = rArray[Math.floor(Math.random() * rArray.length)];
        routes = [r1,r2,r3,r4]
      }
      //console.log(keyArray);
      //if(keyArray[68] == true){
      //  movex+=3;
      //  socket.emit('moveSprite',0,movex,movey);
      //}
      if(hiked){
        socket.emit('moveSprite',0,spriteArray[0].x, spriteArray[0].y + 5)
        for(i = 1; i < 5; i++){
          let newPos = runRoute(spriteArray[i],routes[i-1],playTick,0.15);
          socket.emit('moveSprite',i,spriteArray[i].x + newPos[0],spriteArray[i].y+newPos[1]);
          spriteArray[i].x += newPos[0];
          spriteArray[i].y += newPos[1];
        }
        if(firstClick){
          let tX = 0;
          let tY = 0;
          let qX = spriteArray[0].x
          let qY = spriteArray[0].y
          if(clickX > qX){
            tX = qX - (clickX - qX);
          }
          else{
            tX = qX+(qX - clickX);
          }
          if(clickY > qY){
            tY = qy - (clickY - qY);
          }
          else{
            tY = qY+(qY - clickY);
          }
          socket.emit('moveSprite',6,spriteArray[6].x + moveToTarget(qX,qY,tX,tY,0.5).x,spriteArray[6].y+moveToTarget(qX,qY,tX,tY,0.5).y);
          spriteArray[6].x += moveToTarget(qX,qY,tX,tY,0.5).x;
          spriteArray[6].y += moveToTarget(qX,qY,tX,tY,0.5).y;
        }
        playTick++
      }
      //console.log('('+ movex + ', '+ movey + ')');
      //game logic end
      previous = now
      tick++
  }
  socket.emit('serverAlert','Hello World!');
  socket.on('cClicked',function(x,y){
    if(!firstClick && hiked){
      clickX = x;
      clickY = y;
      firstClick = true;
    }

  });
  socket.on('ready',function(){
    ready++;
    if(idI == 3 && ready > 1){
      //start game
      console.log('gameStarting...');
      io.emit('startGame')
      socket.emit('moveSprite',0,pStartX,pStartY + 100);
      socket.emit('moveSprite',1,pStartX - 300,pStartY);
      socket.emit('moveSprite',2,pStartX - 150,pStartY + 25);
      socket.emit('moveSprite',3,pStartX + 150,pStartY);
      socket.emit('moveSprite',4,pStartX + 300,pStartY);
      socket.emit('moveSprite',5,pStartX + 50,pStartY + 100);
      socket.emit('moveSprite',6,pStartX,pStartY + 100);
      spriteArray[0].x = pStartX;
      spriteArray[1].x = pStartX - 300;
      spriteArray[2].x = pStartX - 150;
      spriteArray[3].x = pStartX + 150;
      spriteArray[4].x = pStartX + 300;
      spriteArray[5].x = pStartX + 50;
      spriteArray[6].x = pStartX;
      spriteArray[0].y = pStartY + 100;
      spriteArray[1].y = pStartY + 0;
      spriteArray[2].y = pStartY - 25;
      spriteArray[3].y = pStartY + 0;
      spriteArray[4].y = pStartY + 0;
      spriteArray[5].y = pStartY + 100;
      spriteArray[6].y = pStartY + 100;
    }
  });
  socket.on('move',function(){
    loop();
  });
  socket.on('setKeys', function(keys){
    keyArray = keys;
  });
  socket.on('disconnect', () => {
    io.sockets.emit('updateHeader',"A user as disconnected:Game Over")
    win = true;
    console.log('user disconnected');
  });
});
server.listen(3000, () => {
  initSprites();
  console.log('listening on *:3000');
});
