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

let turn = 'X';
let color = 'red';
let idList = [];
let board = [
  ['a1','a2','a3'],
  ['b1','b2','b3'],
  ['c1','c2','c3'],
];
let playerTurn = 1;
let idInt = 1;
let win = false;
let canPlay = false;
function winCheck(s){
  max = 0;
  //row checking
  for(let i=0; i<board.length;i++){
    c = 0;
    for(let j =0; j<board.length; j++){
      if(board[i][j] == s){
        c++
        if(c>=3){
          return true;
        }
      }
    }
  }
  for(let i=0; i<board.length;i++){
    c = 0;
    for(let j =0; j<board.length; j++){
      if(board[j][i] == s){
        c++
        if(c>=3){
          return true;
        }
      }
    }
  }
  let dc = 0;
  for(let i = 0; i < 3; i++){
    if(board[i][i] == s){
      dc++
    }
    if(dc>=3){
      return true
    }
  }
  dc = 0;
  for(let i = 2; i > -1; i--){
    if(board[i][i] == s){
      dc++
    }
    if(dc>=3){
      return true
    }
  }
  return false;
}
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('giveID',idInt);
  idInt++;
  if(idInt>=3){
  io.sockets.emit('startHeader')
  console.log('Can Play');
  }
  socket.on('reset',function(){
    if(win){
      turn = 'X';
      color = 'red';
      idList = [];
      board = [
      ['a1','a2','a3'],
      ['b1','b2','b3'],
      ['c1','c2','c3'],
      ];
      playerTurn = 1;
      idInt = 1;
      win = false;
      canPlay = false;
      io.sockets.emit('refresh');
    }
  });
  socket.on('place', function(paramList){
    //place Logic
    id = paramList[0]
    player = paramList[1]
    console.log('Tried Place');
    if(!(idList.includes(id)) && !win && player == playerTurn){
      //el.innerHTML = "<h1 class='"+color+"'>"+turn+"</h1>"
      console.log('Can Place');
      io.sockets.emit('turn',[turn,color,id]);
      if (playerTurn ==1){
        playerTurn = 2;
      }
      else{
        playerTurn=1;
      }
      for(let i=0; i<board.length;i++){
        for(let j =0; j<board.length; j++){
          if(board[i][j]==id){
            board[i][j]=turn;
          }
        }
      }
      if(winCheck(turn)){
        io.sockets.emit('updateHeader',turn+' Won!');
        win = true;
      }
      if(turn == 'X'){
        turn = 'O';
        color = 'blue';
      }
      else{
        turn = 'X';
        color = 'red';
      }
      idList.push(id);
    }
  });
  socket.on('disconnect', () => {
    io.sockets.emit('updateHeader',"A user as disconnected:Game Over")
    win = true;
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
