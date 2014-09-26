var frameID = 0;
var frameNumber = 0;
var timeData = new Array(256);
var previousTime = 0.0;

for(var i=0;i<timeData.length;++i){
  timeData[i] = {
    timeDelta: 0,
    frameNumber: 0
  };
}
function printStatistic() {
  var outOfRangeNum = 0;
  for(var i=0;i<timeData.length;++i){
    if (timeData[i].timeDelta > 18.6 || timeData[i].timeDelta < 14.6) {
      ++outOfRangeNum;
    }
  }

  var total = 0;
  for(var i=0;i<timeData.length;++i){
    total += timeData[i].timeDelta;
  }
  var avg = total/timeData.length;

  var variance = 0;
  for(var i=0;i<timeData.length;++i){
    var delta = timeData[i].timeDelta - avg;
    variance += delta*delta;
  }
  var std = Math.sqrt(variance/timeData.length);

  var timeMax = 0;
  var timeMaxFrame = 0;
  var timeMin = 100000;
  var timeMinFrame = 0;
  for(var i=0;i<timeData.length;++i){
    if(timeMax<timeData[i].timeDelta){
      timeMax=timeData[i].timeDelta;
      timeMaxFrame=timeData[i].frameNumber;
    }
    if(timeMin>timeData[i].timeDelta){
      timeMin=timeData[i].timeDelta;
      timeMinFrame=timeData[i].frameNumber;
    }
  }

  dump('avg:'+avg+' '+
       'std:'+std+' '+
       'outOfRangeNum(data > 18 or data < 14):' + outOfRangeNum + ' ' +
       'max:('+timeMaxFrame+','+timeMax+')'+' '+
       'min:('+timeMinFrame+','+timeMin+')');
}

var startPosX = 70;
var startPosY = 70;
var endPosX = 200;
var endPosY = 400;
var currentX = 100;
var currentY = 70;
var valueX = 1;
var valueY = 1;
function update(timeStamp) {
  var delta = timeStamp - previousTime;
  previousTime = timeStamp;

  ///*
  timeData[frameNumber].timeDelta = delta;
  timeData[frameNumber].frameNumber = frameID;
  frameID++;
  frameNumber++;
  if(frameNumber==256){
    printStatistic();
    frameNumber = 0;
  }
  //*/

  ///*
  if(currentX>endPosX || currentX < startPosX){
    valueX*=-1;
  }
  if(currentY>endPosY || currentY < startPosY){
    valueY*=-1;
  }
  //currentX+=valueX;
  currentY+=valueY;
  var box = document.getElementById('box');
  box.style.top = currentY + 'px';
  box.style.left = currentX + 'px';
  if (delta>18.6 || delta<14.6) {
    box.style.backgroundColor = 'green';
  } else {
        box.style.backgroundColor = 'red';
  }

  //*/
  //dump(currentX+','+currentY);


  requestAnimationFrame(update);
}

var requestID = window.requestAnimationFrame(update);
