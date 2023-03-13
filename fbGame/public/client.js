var keys = [];
document.getElementById("#out").innerHTML = "Keys currently pressed: ";
window.addEventListener("keydown",
    function(e){
        keys[e.keyCode] = e.keyCode;
        var keysArray = getNumberArray(keys);
        document.getElementById("#out").innerHTML = "Keys currently pressed:" + keysArray;
        if(keysArray.toString() == "17,65"){
            document.getElementById("#out").innerHTML += " Select all!"
        }
    },
false);

window.addEventListener('keyup',
    function(e){
        keys[e.keyCode] = false;
        document.getElementById("#out").innerHTML = "Keys currently pressed: " + getNumberArray(keys);
    },
false);

function getNumberArray(arr){
    var newArr = new Array();
    for(var i = 0; i < arr.length; i++){
        if(typeof arr[i] == "number"){
            newArr[newArr.length] = arr[i];
        }
    }
    return newArr;
}
