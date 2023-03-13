let turn = 'X';
let color = 'red';
let idList = [];
let board = [
  ['a1','a2','a3'],
  ['b1','b2','b3'],
  ['c1','c2','c3'],
]
var img = document.createElement("img");
img.src = "conf.gif";
let win = false;
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

function place(el){
  if(!(idList.includes(el.id)) && ! win){
    el.innerHTML = "<h1 class='"+color+"'>"+turn+"</h1>"
    for(let i=0; i<board.length;i++){
      for(let j =0; j<board.length; j++){
        if(board[i][j]==el.id){
          board[i][j]=turn;
        }
      }
    }
    if(winCheck(turn)){
      document.getElementById('anounce').append(turn+' Won!')
    }
    if(turn == 'X'){
      turn = 'O';
      color = 'blue';
    }
    else{
      turn = 'X';
      color = 'red';
    }
    idList.push(el.id);
  }
}
