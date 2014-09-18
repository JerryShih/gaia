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
       'max:('+timeMaxFrame+','+timeMax+')'+' '+
       'min:('+timeMinFrame+','+timeMin+')');
}

function update(timeStamp) {
  var delta = timeStamp - previousTime;
  previousTime = timeStamp;
  var box = document.getElementById('box');
  box.style.top = frameID+'px';
  box.style.left = frameID + 'px';
  dump('bignose'+frameID);
  timeData[frameNumber].timeDelta = delta;
  timeData[frameNumber].frameNumber = frameID;
  frameID++;
  frameNumber++;

  if(frameNumber==256){
    printStatistic();
    frameNumber = 0;
  }

  requestAnimationFrame(update);
}

var requestID = window.requestAnimationFrame(update);
