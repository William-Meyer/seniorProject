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
  spriteArray.push(new Sprite(480,480,1,'bigRed.jpg',36));
  console.log('Sprites Made: '+spriteArray[0].src);
}

const hrtimeMs = function() {
    let time = process.hrtime()
    return time[0] * 1000 + time[1] / 1000000
}

const TICK_RATE = 20
let tick = 0
let previous = hrtimeMs()
let tickLengthMs = 1000 / TICK_RATE
let movex = 750;
let movey = 2280;
let idI = 1;
let gameLoop = false;
let startTeam = 'none'
let ready = 0;
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
      socket.emit('getKeys');
      //console.log(keyArray);
      if(keyArray[68] == true){
        movex+=3;
        socket.emit('moveSprite',0,movex,movey);
      }
      if(keyArray[65] == true){
        movex-=3;
        socket.emit('moveSprite',0,movex,movey);
      }
      if(keyArray[87] == true){
        movey-=3;
        socket.emit('moveSprite',0,movex,movey);
      }
      if(keyArray[83] == true){
        movey+=3;
        socket.emit('moveSprite',0,movex,movey);
      }
      //console.log('('+ movex + ', '+ movey + ')');
      //game logic end
      previous = now
      tick++
  }
  socket.emit('serverAlert','Hello World!');
  socket.on('ready',function(){
    ready++;
    if(idI == 3 && ready > 1){
      //start game
      console.log('gameStarting...');
      io.emit('startGame')
      if(Math.floor(Math.random() * 1) == 1){
        startTeam = 'blue';
      }
      else{
        startTeam = 'red';
      }
      spriteArray.forEach(element => {
        element.x = 500;
        element.y = 1500;
        socket.emit('moveSprite',0,element.x,element.y);
      });
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
