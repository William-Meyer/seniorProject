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
let keyArray1 = [];
let keyArray2 = [];
let oID = 1;
let dID = 2;
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
  isColliding(x1,y1,sw,sh){
    return(x1+sw > this.x  && x1<this.x+this.w)&&(y1<this.y && y1-sh>this.y-this.l);
  }
}
function initSprites(){
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//qb0
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//wr1
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//wr2
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//wr3
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//wr4
  spriteArray.push(new Sprite(480,480,1,'redPlayer.jpg',36));//rb5
  spriteArray.push(new Sprite(480,480,1,'ball.jpg',16));//ball6
  spriteArray.push(new Sprite(480,480,1,'bluePlayer.jpg',36));//cb1 7
  spriteArray.push(new Sprite(480,480,1,'bluePlayer.jpg',36));//cb2 8
  spriteArray.push(new Sprite(480,480,1,'bluePlayer.jpg',36));//cb3 9
  spriteArray.push(new Sprite(480,480,1,'bluePlayer.jpg',36));//cb4 10
  spriteArray.push(new Sprite(480,480,1,'bluePlayer.jpg',36));//s1 11
  spriteArray.push(new Sprite(480,480,1,'bluePlayer.jpg',36));//s2 12
  spriteArray.push(new Sprite(480,480,1,'bigBlue.jpg',36));//lb1 13
  spriteArray.push(new Sprite(480,480,1,'bigBlue.jpg',36));//lb2 14
}
function moveToTarget(x,y,targetX,targetY,speed){
  x = Math.floor(x);
  y = Math.floor(y);
  targetX = Math.floor(targetX);
  targetY = Math.floor(targetY);
  deltaX = Math.abs(x-targetX);
  deltaY = Math.abs(y-targetY);
  //theta = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
  theta = Math.atan2(deltaY, deltaX);
  dX = Math.cos(theta)*speed;
  dY = Math.sin(theta)*speed;
  if(targetX < x){
    dX -= 2*dX;
  }
  if(targetY < y){
    dY -= 2*dY;
  }
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
let ballCatch = false;
let ballReciever = -1;
let wr1 = 0;
let wr2 = 0;
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
        routes = [r1,r2,r3,r4];
        let wr1 = 1;
        let wr2 = 3;
      }
      //console.log(keyArray);
      //if(keyArray[68] == true){
      //  movex+=3;
      //  socket.emit('moveSprite',0,movex,movey);
      //}
      if(hiked){
        socket.emit('moveSprite',0,spriteArray[0].x, spriteArray[0].y + 5)
        for(i = 1; i < 5; i++){
          if(!ballCatch){
            let newPos = runRoute(spriteArray[i],routes[i-1],playTick,0.15);
            socket.emit('moveSprite',i,spriteArray[i].x + newPos[0],spriteArray[i].y+newPos[1]);
            spriteArray[i].x += newPos[0];
            spriteArray[i].y += newPos[1];
          }
          else{
            spriteArray[i].y -= 0.15;
            socket.emit('moveSprite',i,spriteArray[i].x,spriteArray[i].y);
          }

        }
        for(i = 7; i < 11; i++){
          moveX = moveToTarget(spriteArray[i].x,spriteArray[i].y,spriteArray[i-6].x,spriteArray[i-6].y,.1).x
          moveY = moveToTarget(spriteArray[i].x,spriteArray[i].y,spriteArray[i-6].x,spriteArray[i-6].y,.1).y
          socket.emit('moveSprite',i,spriteArray[i].x + moveX,spriteArray[i].y+moveY);
          spriteArray[i].x += moveX;
          spriteArray[i].y += moveY;
        }
        moveX = moveToTarget(spriteArray[11].x,spriteArray[11].y,spriteArray[wr1].x,spriteArray[wr1].y,.1).x
        moveY = moveToTarget(spriteArray[11].x,spriteArray[11].y,spriteArray[wr1].x,spriteArray[wr1].y,.1).y
        socket.emit('moveSprite',11,spriteArray[11].x + moveX,spriteArray[11].y+moveY);
        spriteArray[11].x += moveX;
        spriteArray[11].y += moveY;

        moveX = moveToTarget(spriteArray[12].x,spriteArray[12].y,spriteArray[wr2].x,spriteArray[wr2].y,.1).x
        moveY = moveToTarget(spriteArray[12].x,spriteArray[12].y,spriteArray[wr2].x,spriteArray[wr2].y,.1).y
        socket.emit('moveSprite',12,spriteArray[12].x + moveX,spriteArray[12].y+moveY);
        spriteArray[12].x += moveX;
        spriteArray[12].y += moveY;

        moveX = moveToTarget(spriteArray[13].x,spriteArray[13].y,spriteArray[0].x,spriteArray[0].y,.06).x
        moveY = moveToTarget(spriteArray[13].x,spriteArray[13].y,spriteArray[0].x,spriteArray[0].y,.06).y
        socket.emit('moveSprite',13,spriteArray[13].x + moveX,spriteArray[13].y+moveY);
        spriteArray[13].x += moveX;
        spriteArray[13].y += moveY;

        moveX = moveToTarget(spriteArray[14].x,spriteArray[14].y,spriteArray[0].x,spriteArray[0].y,.1).x
        moveY = moveToTarget(spriteArray[14].x,spriteArray[14].y,spriteArray[0].x,spriteArray[0].y,.1).y
        socket.emit('moveSprite',14,spriteArray[14].x + moveX,spriteArray[14].y+moveY);
        spriteArray[14].x += moveX;
        spriteArray[14].y += moveY;
        if(!ballCatch && !firstClick){
          if(spriteArray[14].y > spriteArray[0].y -15){
            hiked = false;
            console.log('not snapped');
          }
          if(spriteArray[13].y > spriteArray[0].y -15){
            hiked = false;
            console.log('not snapped');
          }

        }
        if(firstClick){
          if(!ballCatch){
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
              tY = qY - (clickY - qY);
            }
            else{
              tY = qY+(qY - clickY);
            }
            socket.emit('moveSprite',6,spriteArray[6].x + moveToTarget(qX,qY,tX,tY,.8).x,spriteArray[6].y+moveToTarget(qX,qY,tX,tY,0.8).y);
            spriteArray[6].x += moveToTarget(qX,qY,tX,tY,0.8).x;
            spriteArray[6].y += moveToTarget(qX,qY,tX,tY,0.8).y;
            for(let i = 1; i < 5; i++){

              if(spriteArray[i].isColliding(spriteArray[6].x,spriteArray[6].y,16,16)){
                ballCatch = true;
                ballReciever = i;
                break;
              }
            }
            for(let i = 7; i<15; i++){
              if(spriteArray[i].isColliding(spriteArray[6].x,spriteArray[6].y,16,16)){
                hiked = false;
                break;
              }
            }
          }
          else{
            socket.emit('moveSprite',6,spriteArray[ballReciever].x,spriteArray[ballReciever].y);
            spriteArray[6].x += spriteArray[ballReciever].x;
            spriteArray[6].y += spriteArray[ballReciever].y;
          }
        }
        playTick++
      }
      else{
        socket.emit('moveSprite',0,pStartX,pStartY + 100);//qb
        socket.emit('moveSprite',1,pStartX - 300,pStartY);//wr
        socket.emit('moveSprite',2,pStartX - 150,pStartY + 25);//wr
        socket.emit('moveSprite',3,pStartX + 150,pStartY);//wr
        socket.emit('moveSprite',4,pStartX + 300,pStartY);//wr
        socket.emit('moveSprite',5,pStartX + 50,pStartY + 100);//rb
        socket.emit('moveSprite',6,pStartX,pStartY + 100);//ball
        socket.emit('moveSprite',7,pStartX - 300,pStartY - 100);//cb
        socket.emit('moveSprite',8,pStartX - 150,pStartY - 100);//cb
        socket.emit('moveSprite',9,pStartX + 150,pStartY - 100);//cb
        socket.emit('moveSprite',10,pStartX + 300,pStartY - 100);//cb
        socket.emit('moveSprite',11,pStartX + 250,pStartY - 500);//s1
        socket.emit('moveSprite',12,pStartX - 250,pStartY - 500);//s1
        socket.emit('moveSprite',13,pStartX + 150,pStartY - 200);//lb1
        socket.emit('moveSprite',14,pStartX - 150,pStartY - 200);//lb2
        spriteArray[0].x = pStartX;
        spriteArray[1].x = pStartX - 300;
        spriteArray[2].x = pStartX - 150;
        spriteArray[3].x = pStartX + 150;
        spriteArray[4].x = pStartX + 300;
        spriteArray[5].x = pStartX + 50;
        spriteArray[6].x = pStartX;
        spriteArray[7].x = pStartX - 300;
        spriteArray[8].x = pStartX - 150;
        spriteArray[9].x = pStartX + 150;
        spriteArray[10].x = pStartX + 300;
        spriteArray[11].x = pStartX + 250;
        spriteArray[12].x = pStartX - 250;
        spriteArray[13].x = pStartX + 150;
        spriteArray[14].x = pStartX - 150;
        spriteArray[0].y = pStartY + 100;
        spriteArray[1].y = pStartY + 0;
        spriteArray[2].y = pStartY - 25;
        spriteArray[3].y = pStartY + 0;
        spriteArray[4].y = pStartY + 0;
        spriteArray[5].y = pStartY + 100;
        spriteArray[6].y = pStartY + 100;
        spriteArray[7].y = pStartY - 100;
        spriteArray[8].y = pStartY - 100;
        spriteArray[9].y = pStartY - 100;
        spriteArray[10].y = pStartY - 100;
        spriteArray[11].y = pStartY - 400;
        spriteArray[12].y = pStartY - 400;
        spriteArray[13].y = pStartY - 200;
        spriteArray[14].y = pStartY - 200;
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
      socket.emit('moveSprite',0,pStartX,pStartY + 100);//qb
      socket.emit('moveSprite',1,pStartX - 300,pStartY);//wr
      socket.emit('moveSprite',2,pStartX - 150,pStartY + 25);//wr
      socket.emit('moveSprite',3,pStartX + 150,pStartY);//wr
      socket.emit('moveSprite',4,pStartX + 300,pStartY);//wr
      socket.emit('moveSprite',5,pStartX + 50,pStartY + 100);//rb
      socket.emit('moveSprite',6,pStartX,pStartY + 100);//ball
      socket.emit('moveSprite',7,pStartX - 300,pStartY - 100);//cb
      socket.emit('moveSprite',8,pStartX - 150,pStartY - 100);//cb
      socket.emit('moveSprite',9,pStartX + 150,pStartY - 100);//cb
      socket.emit('moveSprite',10,pStartX + 300,pStartY - 100);//cb
      socket.emit('moveSprite',11,pStartX + 250,pStartY - 500);//s1
      socket.emit('moveSprite',12,pStartX - 250,pStartY - 500);//s1
      socket.emit('moveSprite',13,pStartX + 150,pStartY - 200);//lb1
      socket.emit('moveSprite',14,pStartX - 150,pStartY - 200);//lb2
      spriteArray[0].x = pStartX;
      spriteArray[1].x = pStartX - 300;
      spriteArray[2].x = pStartX - 150;
      spriteArray[3].x = pStartX + 150;
      spriteArray[4].x = pStartX + 300;
      spriteArray[5].x = pStartX + 50;
      spriteArray[6].x = pStartX;
      spriteArray[7].x = pStartX - 300;
      spriteArray[8].x = pStartX - 150;
      spriteArray[9].x = pStartX + 150;
      spriteArray[10].x = pStartX + 300;
      spriteArray[11].x = pStartX + 250;
      spriteArray[12].x = pStartX - 250;
      spriteArray[13].x = pStartX + 150;
      spriteArray[14].x = pStartX - 150;
      spriteArray[0].y = pStartY + 100;
      spriteArray[1].y = pStartY + 0;
      spriteArray[2].y = pStartY - 25;
      spriteArray[3].y = pStartY + 0;
      spriteArray[4].y = pStartY + 0;
      spriteArray[5].y = pStartY + 100;
      spriteArray[6].y = pStartY + 100;
      spriteArray[7].y = pStartY - 100;
      spriteArray[8].y = pStartY - 100;
      spriteArray[9].y = pStartY - 100;
      spriteArray[10].y = pStartY - 100;
      spriteArray[11].y = pStartY - 500;
      spriteArray[12].y = pStartY - 500;
      spriteArray[12].y = pStartY - 200;
      spriteArray[12].y = pStartY - 200;
    }
  });
  socket.on('move',function(){
    loop();
  });
  socket.on('setKeys', function(keys,Pid){
    if(Pid = 1){
      keyArray1 = keys;
    }
    if(Pid = 1){
      keyArray2 = keys;
    }

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
