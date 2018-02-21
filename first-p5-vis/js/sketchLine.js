var canvas;
let margin = 0.075;
let marginTop = 0.15;
let cnvW  = window.innerWidth-10;
let cnvH = window.innerHeight-35;
let x1 = cnvW*margin;
let x2 = cnvW-(cnvW*margin);
let y1 = cnvH*marginTop;
let y2 = cnvH-(cnvH*margin);

let autoPlay = true;

function preload() {
  // GitHub Pages
  aY =        loadJSON('/ms1-2018/first-p5-vis/assets/aggYear.json');
  aC =        loadJSON('/ms1-2018/first-p5-vis/assets/aggCountry.json');
  aYC =       loadJSON('/ms1-2018/first-p5-vis/assets/aggYearCountry.json');
  aYL =       loadJSON('/ms1-2018/first-p5-vis/assets/aggYearClassification.json');
  aYCL =      loadJSON('/ms1-2018/first-p5-vis/assets/aggYearCountryClassification.json');
  cColors =   loadJSON('/ms1-2018/first-p5-vis/assets/countryColors.json');
  font =      loadFont('/ms1-2018/first-p5-vis/typeface/RobotoCondensed-Bold.ttf')
  montLight = loadFont('/ms1-2018/first-p5-vis/typeface/Montserrat-Light.ttf')
  montBold =  loadFont('/ms1-2018/first-p5-vis/typeface/Montserrat-Bold.ttf')
  montReg =   loadFont('/ms1-2018/first-p5-vis/typeface/Montserrat-Regular.ttf')
  // Local testing
  // aY =        loadJSON('../assets/aggYear.json');
  // aC =        loadJSON('../assets/aggCountry.json');
  // aYC =       loadJSON('../assets/aggYearCountry.json');
  // aYL =       loadJSON('../assets/aggYearClassification.json');
  // aYCL =      loadJSON('../assets/aggYearCountryClassification.json');
  // cColors =   loadJSON('../assets/countryColors.json');
  // font =      loadFont('../typeface/RobotoCondensed-Bold.ttf')
  // montLight = loadFont('../typeface/Montserrat-Light.ttf')
  // montBold =  loadFont('../typeface/Montserrat-Bold.ttf')
  // montReg =   loadFont('../typeface/Montserrat-Regular.ttf')
}

function setup() {
  canvas = createCanvas(cnvW,cnvH);
  background(35);
  // countries
  countryNumber = Object.keys(aC['object_count_rank']).length;
  countries = Object.keys(aC['country'])
  // determine minimum and maximum year //
  maxYearIndex = Object.keys(aY['acq_year']).length-1
  minYear = aY['acq_year'][0]
  maxYear = aY['acq_year'][Object.keys(aY['acq_year'])[Object.keys(aY['acq_year']).length-1]-1]
  // create variable that will control year //
  x = minYear;
  // determine maximum value for country + year //
  maxYearCountryCount = 0;
  for (yc in Object.keys(aYC['object_cum_count'])) {
    if (aYC['object_cum_count'][yc] > maxYearCountryCount && aYC['acq_year'][yc] !== 10000) {
      maxYearCountryCount = aYC['object_cum_count'][yc];
      maxYearCountryIndex = yc;
    }
  }
  // stopLoop();
  // axes
  fill(255);
}

function draw() {
  if (floor(x)>maxYear) {
    autoPlay = false;
  }
  if (autoPlay) {
    background(35);
    drawYear();
    drawTitle();
    drawAxes();
    drawCountryLegends()
    drawYearCountryDot();
    // drawYearCountryLine();
  }
}

function stopLoop() {
  if (maxYear===floor(x)) {
    noLoop();
  } else {
    loop();
  }
}

function drawTitle() {
  textFont(montLight);
  fill(178);
  noStroke();
  textAlign(CENTER,CENTER);
  textSize(60);
  let titleText = 'A History of Collecting at The Met';
  text(titleText,cnvW/2,cnvH/16);
}

function drawYear() {
  textFont(montBold);
  fill(178);
  noStroke();
  textAlign(CENTER,CENTER);
  textSize(60);
  text(floor(x),cnvW/2,cnvH/16 + 50);
  if (ceil(x) <= maxYear) {
    if (autoPlay) {
      x += 0.35;
    }
  }
}

function drawAxes() {
  stroke(255,50);
  strokeWeight(3);
  line(x1,y1,x1,y2);
  line(x1,y2,x2,y2);
  for (let y=0;y<maxYearCountryCount;y+=20000) {
    let objY = map(y,maxYearCountryCount,0,y1,y2);
    let objX = x1 * 0.9;
    textSize(18);
    textAlign(RIGHT,CENTER);
    text(y,objX,objY);
    stroke(255,50);
    strokeWeight(3);
    line(x1*0.92,objY,x1,objY);
    noStroke();
  }
}

function drawYearCountryDot() {
  for (y in aYC['acq_year']) {
    let yr = aYC['acq_year'][y];
    if (yr === floor(x)) {
      let yrCountry = aYC['country'][y];
      let cRank;
      for (r in Object.keys(aC['country'])) {
        if (aC['country'][r] === yrCountry) {
          cRank = aC['object_count_rank'][r]
        }
      }
      let col;
      for (s in Object.keys(cColors['country_rank'])) {
        if (cColors['country_rank'][s] === cRank) {
          // console.log(cColors['r'][s]);
          col = color(cColors['r'][s],cColors['g'][s],cColors['b'][s])
        }
      }
      let countryRank = aC['object_count_rank'][yrCountry]
      let ctX = map(yr,minYear,maxYear,(cnvW*margin),(cnvW-(cnvW*margin)))
      let yrCountryCount = aYC['object_cum_count'][y]
      let ctY = map(yrCountryCount,maxYearCountryCount,0,y1,y2);
      fill(col);
      noStroke();
      ellipse(ctX,ctY,20);
      drawYearCountryLine(yrCountry,col);
    }
  }
}

function drawYearCountryLine(c,color) {
  let country = c;
  let prevYears = []
  for (y in aYC['acq_year']) {
    let yr = aYC['acq_year'][y];
    if (yr <= floor(x) && aYC['country'][y] === country) {
      prevYears.push({
        year: yr,
        object_cum_count: aYC['object_cum_count'][y]
      })
    }
  }
  if (prevYears.length>1) {
    for (i=1;i<prevYears.length;i++) {
      // console.log(prevYears[i-1]['object_cum_count'])
      let linex1 = map(prevYears[i-1]['year'],minYear,maxYear,(cnvW*margin),(cnvW-(cnvW*margin)));
      let linex2 = map(prevYears[i]['year'],minYear,maxYear,(cnvW*margin),(cnvW-(cnvW*margin)));
      let liney1 = map(prevYears[i-1]['object_cum_count'],maxYearCountryCount,0,y1,y2);
      let liney2 = map(prevYears[i]['object_cum_count'],maxYearCountryCount,0,y1,y2);
      stroke(color);
      strokeWeight(2);
      line(linex1,liney1,linex2,liney2);
    }
  }
}

// function drawAllYearCountryLines() {
//   for (c in countries) {
//     let country = aC['country'][c]
//     // determine line color
//     let col;
//     let cRank;
//     for (r in Object.keys(aC['country'])) {
//       if (aC['country'][r] === country) {
//         cRank = aC['object_count_rank'][r]
//       }
//     }
//     for (s in Object.keys(cColors['country_rank'])) {
//       if (cColors['country_rank'][s] === cRank) {
//         // console.log(cColors['r'][s]);
//         col = color(cColors['r'][s],cColors['g'][s],cColors['b'][s])
//       }
//     }
//
//     prevYears = []
//     for (y in aYC['acq_year']) {
//       let yr = aYC['acq_year'][y];
//       if (yr <= floor(x) && aYC['country'][y] === country) {
//         prevYears.push({
//           year: yr,
//           object_cum_count: aYC['object_cum_count'][y]
//         })
//       }
//     }
//     if (prevYears.length>1) {
//       for (i=1;i<prevYears.length;i++) {
//         // console.log(prevYears[i-1]['object_cum_count'])
//         let linex1 = map(prevYears[i-1]['year'],minYear,maxYear,(cnvW*margin)+20,(cnvW-(cnvW*margin))-20);
//         let linex2 = map(prevYears[i]['year'],minYear,maxYear,(cnvW*margin)+20,(cnvW-(cnvW*margin))-20);
//         let liney1 = map(prevYears[i-1]['object_cum_count'],maxYearCountryCount,0,y1+10,y2-10);
//         let liney2 = map(prevYears[i]['object_cum_count'],maxYearCountryCount,0,y1+10,y2-10);
//         stroke(col);
//         strokeWeight(2);
//         line(linex1,liney1,linex2,liney2);
//       }
//     }
//   }
// }

function drawCountryLegends() {
  let legW = 250;
  let legH = 40;
  let legX = x1 + 60;
  let legY = y1;
  let legR = 10;
  let col;
  let cTxt;
  // rect(legX,legY,legW,legH,legR);
  for (s in Object.keys(cColors['country_rank'])) {
    col = color(cColors['r'][s],cColors['g'][s],cColors['b'][s]);
    fill(col);
    rect(legX,legY+(legH*s)+(5*s),legW,legH,legR);
    for (r in Object.keys(aC['country'])) {
      if (aC['object_count_rank'][r] === cColors['country_rank'][s]) {
        cTxt = aC['country'][r];
      }
    }
    textAlign(CENTER,CENTER);
    let txtX = legX + (legW/2);
    let txtY = legY+(legH*s)+(5*s)+(legH * 0.375);

    fill(0,200);
    textFont(montReg);
    textSize(28);
    text(cTxt,txtX,txtY);
  }
}

function mousePressed() {
  if (x>maxYear) {
    x = aY['acq_year'][0];
    autoPlay = true;
  } else {
    if (autoPlay) {
      autoPlay = false
    } else {
      autoPlay = true
    }
  }
}

function keyPressed() {
  if (autoPlay === false && keyCode === LEFT_ARROW) {
    x = floor(x) - 1
  } else if (autoPlay === false && keyCode === RIGHT_ARROW && floor(x) < maxYear) {
    x = floor(x) + 1
  }
}

window.onresize = function() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  canvas.size(w,h);
  width = w;
  height = h;
}
