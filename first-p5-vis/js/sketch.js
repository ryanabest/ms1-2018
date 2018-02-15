var canvas;
var txt;
let margin = 0.075;
let cnvW  = window.innerWidth-10;
let cnvH = window.innerHeight-35;
let x1 = cnvW*margin;
let x2 = cnvW-(cnvW*margin);
let y1 = cnvH*margin;
let y2 = cnvH-(cnvH*margin);

let autoPlay = true;

function preload() {
  aY =   loadJSON('../assets/aggYear.json');
  aC =   loadJSON('../assets/aggCountry.json');
  aYC =  loadJSON('../assets/aggYearCountry.json');
  aYL =  loadJSON('../assets/aggYearClassification.json');
  aYCL = loadJSON('../assets/aggYearCountryClassification.json');
  robotoFont = loadFont('../typeface/RobotoCondensed-Bold.ttf')
}

function setup() {
  textFont(robotoFont);
  canvas = createCanvas(cnvW,cnvH);
  background(0);
  // countries
  countryNumber = Object.keys(aC['object_count_rank']).length;
  countries = Object.keys(aC['object_count'])
  // create variable that will control year //
  x = aY['acq_year'][0];
  // determine maximum year in data set //
  maxYearIndex = Object.keys(aY['acq_year']).length-1
  maxYear = aY['acq_year'][Object.keys(aY['acq_year'])[Object.keys(aY['acq_year']).length-1]-1]
  // determine maximum value for country + year //
  maxYearCountryCount = 0;
  for (yc in Object.keys(aYC['object_cum_count'])) {
    if (aYC['object_cum_count'][yc] > maxYearCountryCount && aYC['acq_year'][yc] !== 10000) {
      maxYearCountryCount = aYC['object_cum_count'][yc];
      maxYearCountryIndex = yc;
    }
  }

  // axes
  fill(255);
}

function draw() {
  drawYear();
  drawAxes();
  drawCountries();
  txt = cnvH/1.5;
  // drawYearDot();
  drawYearCountryDot();
}

function drawYear() {
  background(0);
  fill(255,10);
  textAlign(CENTER,CENTER);
  textSize(txt);
  text(floor(x),cnvW/2,cnvH/2);
  if (ceil(x) <= maxYear) {
    if (autoPlay) {
      x += 0.5;
    }
  }
}

function drawAxes() {
  stroke(255);
  strokeWeight(10);
  line(x1,y1,x1,y2);
  line(x1,y2,x2,y2);
  noStroke();
}

function drawCountries() {
  for (c in countries) {
    let country = countries[c]
    let countryRank = aC['object_count_rank'][country]
    let ctX = map(countryRank,1,countryNumber,(cnvW*margin)+50,(cnvW-(cnvW*margin))-20)
    fill(255);
    textSize(24);
    text(country,ctX,cnvH-(cnvH*margin)+50)
  }
}

function drawYearDot() {
  let maxCount = aY['object_cum_count'][maxYearIndex]
  for (y in aY['acq_year']) {
    let yr = aY['acq_year'][y];
    if (yr === floor(x)) {
      let yrCount = aY['object_cum_count'][y]
      let yrY = map(yrCount,maxCount,0,y1,y2);
      fill(255);
      ellipse(x1+200,yrY,50);
    }
  }
  // console.log(aY);
}

function drawYearCountryDot() {
  for (y in aYC['acq_year']) {
    let yr = aYC['acq_year'][y];
    if (yr === floor(x)) {
      let yrCountry = aYC['country'][y]
      let countryRank = aC['object_count_rank'][yrCountry]
      let ctX = map(countryRank,1,countryNumber,(cnvW*margin)+50,(cnvW-(cnvW*margin))-20)
      let yrCountryCount = aYC['object_cum_count'][y]
      let ctY = map(yrCountryCount,maxYearCountryCount,0,y1,y2);
      fill(255);
      ellipse(ctX,ctY,50);
      // console.log(yr);
      // console.log(yrCountryCount);
    }
  }
}

function mousePressed() {
  if (autoPlay) {
    autoPlay = false
  } else {
    autoPlay = true
  }
}

function keyPressed() {
  if (autoPlay === false && keyCode === LEFT_ARROW) {
    x = floor(x) - 1
  } else if (autoPlay === false && keyCode === RIGHT_ARROW) {
    x = floor(x) + 1
  }
}

window.onresize = function() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  canvas.size(w,h);
  background(0);
  width = w;
  height = h;
}
