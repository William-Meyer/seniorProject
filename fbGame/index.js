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
  }
}
function masterUpdate(){

}
io.on('connection', (socket) => {
  console.log('connection');
  socket.emit('serverAlert','Hello World!');
  socket.on('disconnect', () => {
    io.sockets.emit('updateHeader',"A user as disconnected:Game Over")
    win = true;
    console.log('user disconnected');
  });
});
server.listen(3000, () => {
  console.log('listening on *:3000');
});
