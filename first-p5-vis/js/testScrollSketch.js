var cnv;

let wdth = (window.innerWidth * 0.9);
let hght = (window.innerHeight * 0.9);
let x = wdth/2;
let y = hght/2;
let r = 75;

function setup() {
  cnv = createCanvas(wdth,hght);
  background(0);
  fill(255);
  noStroke();
  ellipse(x,y,r);

  cnv.mouseClicked(clearBackground);
  cnv.mouseWheel(moveCircle);
}

function moveCircle(event) {
  fill(random(0,255),random(0,255),random(0,255));
  ellipse(x,y,r);
  if (x > wdth) {
    x = 0;
  } else if (x < 0) {
    x = wdth;
  } else {
    x += event.deltaX;
  }
  if (y > hght) {
    y = 0;
  } else if (y < 0) {
    y = hght;
  } else {
    y += event.deltaY;
  }
  // background(0);
  fill(255);
  ellipse(x,y,r);
  // console.log(event.deltaY);
}

function clearBackground() {
  background(0);
  ellipse(x,y,r);
}
