var canvas;
let margin = 0.075;
// let marginTop = 0.15;
let marginTop = margin;
let cnvW  = window.innerWidth-10;
let cnvH = window.innerHeight-35;
let x1 = cnvW*margin;
let x2 = cnvW-(cnvW*margin);
let y1 = cnvH*marginTop;
let y2 = cnvH-(cnvH*margin);

let autoPlay = false;
let isHighlight = false;
let highlightRank = -1;
let countryClick = false;
let stackedRank = -1;

let xPace = 0.2;

let removeButton = false;
let removeList = [];

function preload() {
  // GitHub Pages
  aY =        loadJSON('/ms1-2018/quant/assets/aggYear.json');
  aC =        loadJSON('/ms1-2018/quant/assets/aggCountry.json');
  aYC =       loadJSON('/ms1-2018/quant/assets/aggYearCountry.json');
  aCL =       loadJSON('/ms1-2018/quant/assets/aggCountryClassification.json');
  aYL =       loadJSON('/ms1-2018/quant/assets/aggYearClassification.json');
  aYCL =      loadJSON('/ms1-2018/quant/assets/aggYearCountryClassification.json');
  cColors =   loadJSON('/ms1-2018/quant/assets/countryColors.json');
  montLight = loadFont('/ms1-2018/quant/typeface/Montserrat-Light.ttf')
  montBold =  loadFont('/ms1-2018/quant/typeface/Montserrat-Bold.ttf')
  montReg =   loadFont('/ms1-2018/quant/typeface/Montserrat-Regular.ttf')
  montItal =  loadFont('/ms1-2018/quant/typeface/Montserrat-LightItalic.ttf')
  // Local testing
  // aY =        loadJSON('../assets/aggYear.json');
  // aC =        loadJSON('../assets/aggCountry.json');
  // aYC =       loadJSON('../assets/aggYearCountry.json');
  // aCL =       loadJSON('../assets/aggCountryClassification.json');
  // aYL =       loadJSON('../assets/aggYearClassification.json');
  // aYCL =      loadJSON('../assets/aggYearCountryClassification.json');
  // cColors =   loadJSON('../assets/countryColors.json');
  // montLight = loadFont('../typeface/Montserrat-Light.ttf')
  // montBold =  loadFont('../typeface/Montserrat-Bold.ttf')
  // montReg =   loadFont('../typeface/Montserrat-Regular.ttf')
  // montItal =  loadFont('../typeface/Montserrat-LightItalic.ttf')
}

function setup() {
  canvas = createCanvas(cnvW,cnvH);
  countryNumber = Object.keys(aC['object_count_rank']).length;
  countries = Object.keys(aC['country'])
  // determine minimum and maximum year //
  maxYearIndex = Object.keys(aY['acq_year']).length-1
  minYear = aY['acq_year'][0]
  maxYear = aY['acq_year'][Object.keys(aY['acq_year'])[Object.keys(aY['acq_year']).length-1]-1]
  // create variable that will control year //
  x = minYear;
  // x = 1963;
  // determine maximum value for country + year //
  maxYearCountryCount = 0;
  for (yc in Object.keys(aYC['object_cum_count'])) {
    if (aYC['object_cum_count'][yc] > maxYearCountryCount && aYC['acq_year'][yc] !== 10000) {
      maxYearCountryCount = aYC['object_cum_count'][yc];
      maxYearCountryIndex = yc;
    }
  }
}

function draw() {
  amHighlight();
  // if (autoPlay) {
  //   drawEverything();
  // }
  drawEverything();
  if (floor(x)>=maxYear) {
    autoPlay = false;
  }
  if (autoPlay === false & floor(x) === minYear) {
    fill(215);
    textSize(75);
    textFont(montLight);
    text("Click to Start",cnvW/2,cnvH/2);
  }
}


function drawTitle() {
  textFont(montBold);
  fill(178);
  noStroke();
  textAlign(CENTER,CENTER);
  textSize(60);
  let titleText = "How has the Met's collection evolved over time?";
  text(titleText,cnvW/2,cnvH/16);
}

function drawYear() {
  textFont(montLight);
  fill(178);
  noStroke();
  textAlign(CENTER,CENTER);
  textSize(100);
  if (floor(x) <= maxYear) {
    if (autoPlay) {
      x += xPace;
    }
  }
  text(floor(x),cnvW/2,cnvH*marginTop);
}

function drawAxes() {
  stroke(150);
  strokeWeight(3);
  line(x1,y1,x1,y2);
  line(x1,y2,x2,y2);
  noStroke();
  textSize(18);
  // Object Count Axis Labels
  textFont(montLight);
  textAlign(CENTER,CENTER);
  translate(15,cnvH/2);
  rotate(-HALF_PI);
  text("Cumulative Objects Acquired",0,0);
  rotate(HALF_PI);
  translate(-15,-cnvH/2);
  for (let y=0;y<maxYearCountryCount;y+=20000) {
    let objY = map(y,maxYearCountryCount,0,y1,y2);
    let objX = x1 * 0.9;
    let printY = y.toLocaleString();
    textAlign(RIGHT,CENTER);
    text(printY,objX,objY);
    stroke(155);
    strokeWeight(3);
    line(x1*0.92,objY,x1,objY);
    noStroke();
  }

  // Year Axis Labels
  textAlign(CENTER,CENTER);
  text("Acqusition Year",cnvW/2,cnvH-15);
  for (let yl=minYear;yl<=floor(x);yl+=10) {
    let ylX = map(yl,minYear,maxYear,x1,x2);
    let ylY = y2 + 20;
    textAlign(CENTER,CENTER);
    text(yl,ylX,ylY);
    stroke(155);
    strokeWeight(3);
    line(ylX,y2,ylX,y2+10);
    noStroke();
  }
}

function drawEverything() {
  background(35);
  drawYear();
  // drawTitle();
  drawAxes();
  let cntCount= 0;
  let currentYear = floor(x);
  if (countryClick) {
    drawCountryStackedBars()
  }
  for (r in Object.keys(aC['country'])) {
    let country = aC['country'][r]
    for (let a in aYC['country']) {
      if (aYC['country'][a] === country && aYC['acq_year'][a] === currentYear) {
        let col;
        let txtcol;
        countryRank = aC['object_count_rank'][r];
        for (s in Object.keys(cColors['country_rank'])) {
          cntCount = cColors['country_rank'][s];
          if (cColors['country_rank'][s] === countryRank) {
            if (countryClick) {
              if (s === stackedRank) {
                col = color(cColors['r'][s],cColors['g'][s],cColors['b'][s]);
                txtcol = color(cColors['r'][s],cColors['g'][s],cColors['b'][s]);
                drawYearCountryTooltip(country,col,currentYear,aYC['object_cum_count'][a].toLocaleString());
              } else if (highlightRank === s) {
                col = color(cColors['r'][s],cColors['g'][s],cColors['b'][s],95);
                txtcol = color(cColors['r'][s],cColors['g'][s],cColors['b'][s]);
              } else {
                col = color(cColors['dark-r'][s],cColors['dark-g'][s],cColors['dark-b'][s],0);
                txtcol = color(cColors['dark-r'][s],cColors['dark-g'][s],cColors['dark-b'][s],99);
              }
            } else if (isHighlight) {
              if (s === highlightRank) {
                col = color(cColors['r'][s],cColors['g'][s],cColors['b'][s]);
                txtcol = color(cColors['r'][s],cColors['g'][s],cColors['b'][s]);
                drawYearCountryTooltip(country,col,currentYear,aYC['object_cum_count'][a].toLocaleString());
                textAlign(LEFT,TOP);
                textFont(montItal);
                textSize(16);
                text("Click to see classifications",mouseX+50,mouseY+15);
              } else {
                col = color(cColors['dark-r'][s],cColors['dark-g'][s],cColors['dark-b'][s],75);
                txtcol = color(cColors['dark-r'][s],cColors['dark-g'][s],cColors['dark-b'][s],99);
              }
            } else {
              col = color(cColors['r'][s],cColors['g'][s],cColors['b'][s]);
              txtcol = color(cColors['r'][s],cColors['g'][s],cColors['b'][s]);
            }
          }
        }
        drawCountryLegend(country,txtcol,countryRank);
        drawYearCountryDot(country,col,currentYear);
        drawYearCountryLine(country,col);
      }
    }
  }
  if (removeButton) {
    drawCountryLegend("Remove",color(150,150,150),cntCount + 1);
  }
}

function drawYearCountryDot(country,color,year) {
  let yr;
  let yrCountryCount;
  for (a in aYC['acq_year']) {
    if (aYC['acq_year'][a] === floor(x) && aYC['country'][a] === country) {
      yr = aYC['acq_year'][a]
      yrCountryCount = aYC['object_cum_count'][a]
    }
  }
  let rad = 20;
  let ctX = map(yr,minYear,maxYear,(cnvW*margin),(cnvW-(cnvW*margin)));
  let ctY = map(yrCountryCount,maxYearCountryCount,0,y1,y2);
  fill(color);
  noStroke();
  ellipse(ctX,ctY,rad);
}

function drawYearCountryLine(country,color) {
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

function drawYearCountryTooltip(country,color,year,n) {
  let ttX = cnvW/2 + 250;
  let ttY = cnvH*marginTop + 80;
  let ttTxt1 = country + ' - ' + n + ' objects';
  let ttTxt2 = n + ' objects';
  textFont(montReg);
  noStroke();
  textAlign(RIGHT,TOP);
  textSize(38);
  // fill(255);
  // text(ttTxt1,ttX+1,ttY+1);
  fill(color);
  text(ttTxt1,ttX,ttY);
}

function amHighlight() {
  isHighlight = false;
  highlightRank = -1;
  let legW = 150;
  let legH = 30;
  let legX = x1 + 60;
  let legY = y1;
  let hoverList = [];
  removeList = [];

  for (let s in Object.keys(cColors['country_rank'])) {
    hoverList.push({
      'rank':  s,
      'legx1': legX,
      'legy1': legY+(legH*s),
      'legx2': legX+legW,
      'legy2': legY+(legH*s)+legH
    })
  }
  // Remove button
  if (removeButton) {
    removeList.push ({
      'rank': Object.keys(cColors['country_rank']).length,
      'legx1': legX,
      'legy1': legY+(legH*Object.keys(cColors['country_rank']).length),
      'legx2': legX+legW,
      'legy2': legY+(legH*Object.keys(cColors['country_rank']).length)+legH
    })
  }

  for (let h in hoverList) {
    let pr;
    if (mouseX >= hoverList[h]['legx1'] && mouseY >= hoverList[h]['legy1'] && mouseX <= hoverList[h]['legx2'] && mouseY <= hoverList[h]['legy2']) {
      isHighlight = true
      highlightRank = hoverList[h]['rank']
      if (mouseIsPressed) {
        stackedRank = highlightRank;
      }
    }
  }
}

function drawCountryLegend(country,color,rank) {
  let txtX = x1+60+75;
  let txtY = y1 + (30*(rank-1));
  noStroke();
  textAlign(CENTER,TOP);
  textFont(montReg);
  textSize(20);
  fill(color);
  text(country,txtX,txtY);
}

function drawCountryStackedBars() {
  let prevYears = [];
  let col;
  let yr;
  for (let ycl in Object.keys(aYCL['acq_year'])) {
    yr = aYCL['acq_year'][ycl];
    if (parseInt(aYCL['country_total_object_count_rank'][ycl])-1 === parseInt(stackedRank) && yr <= floor(x)) {
      let classificationRank = aYCL['country_classification_object_count_rank'][ycl];
      for (let s in Object.keys(cColors['country_rank'])) {
        if (stackedRank === s) {
          if (classificationRank === 6) {
            col = color(cColors['r-1'][s],cColors['g-1'][s],cColors['b-1'][s]);
          } else if (classificationRank === 5) {
            col = color(cColors['r'][s],cColors['g'][s],cColors['b'][s])
          } else if (classificationRank === 4) {
            col = color(cColors['r+1'][s],cColors['g+1'][s],cColors['b+1'][s])
          } else if (classificationRank === 3) {
            col = color(cColors['r+2'][s],cColors['g+2'][s],cColors['b+2'][s])
          } else if (classificationRank === 2) {
            col = color(cColors['r+3'][s],cColors['g+3'][s],cColors['b+3'][s])
          } else if (classificationRank === 1) {
            col = color(cColors['r+4'][s],cColors['g+4'][s],cColors['b+4'][s])
          }
        }
      }
      prevYears.push({
        'year': yr,
        'classification': aYCL['classification'][ycl],
        'lRank': classificationRank,
        'lCount': aYCL['object_cum_count'][ycl],
        'color': col,
        'clCount': aYCL['country_year_object_cum_count'][ycl],
        'country': aYCL['country'][ycl]
      })
    }
  }

  let shapeList = [];
  let runningTotal = 0;
  for (let p in prevYears) {
    if (p==0) {
      runningTotal = prevYears[p]['clCount']
    } else if (prevYears[p-1]['year'] !== prevYears[p]['year']) {
      runningTotal = prevYears[p]['clCount']
    } else {
      runningTotal -= prevYears[p-1]['lCount']
    }
    shapeList.push({
      'year':           prevYears[p]['year'],
      'classification': prevYears[p]['classification'],
      'lRank':          prevYears[p]['lRank'],
      'lCount':         prevYears[p]['lCount'],
      'color':          prevYears[p]['color'],
      'clCount':        prevYears[p]['clCount'],
      'country':        prevYears[p]['country'],
      'runningTotal':   runningTotal
    })
    if (prevYears[p]['year'] === floor(x)) {
      let sbtX = cnvW/2+150;
      let sbtY = (cnvH*marginTop) + 135 + (25*Math.abs((6-prevYears[p]['lRank'])));
      let sbTxt = prevYears[p]['classification'] + ' - ' + prevYears[p]['lCount'].toLocaleString() + ' objects';
      // stroke(255);
      // strokeWeight(0.25);
      textFont(montReg);
      textSize(20);
      textAlign(RIGHT,TOP);
      // fill(255);
      // text(sbTxt,sbtX+0.5,sbtY+0.5);
      fill(178);
      text(sbTxt,sbtX,sbtY);
      fill(prevYears[p]['color']);
      rectMode(CENTER);
      // noStroke();
      rect(sbtX+25,sbtY+12,26,26);
      rectMode(CORNER);
    }
  }
  for (let cl in Object.keys(aCL['classification'])) {
    let shapeDrawList = [];
    let shapeDrawColor;
    let classification = aCL['classification'][cl];
    let country = aCL['country'][cl];
    for (let s=0;s<shapeList.length;s++) {
      if (shapeList[s]['country']===country && shapeList[s]['classification']===classification) {
        shapeDrawColor = shapeList[s]['color']
        shapeDrawList.push({
          'year': shapeList[s]['year'],
          'runningTotal': shapeList[s]['runningTotal'],
          'count' : shapeList[s]['lCount'],
          'x': map(shapeList[s]['year'],minYear,maxYear,(cnvW*margin),(cnvW-(cnvW*margin))),
          'y': map(shapeList[s]['runningTotal'],maxYearCountryCount,0,y1,y2)
        })
      }
    }
    if (shapeDrawList.length>0) {
      let shapeDrawY1 = map(shapeDrawList[0]['runningTotal']-shapeDrawList[0]['count'],maxYearCountryCount,0,y1,y2);
      let shapeDrawX1 = map(shapeDrawList[0]['year']-0.5,minYear,maxYear,(cnvW*margin),(cnvW-(cnvW*margin)));
      let shapeDrawY2 = map(0,maxYearCountryCount,0,y1,y2);
      let shapeDrawX2 = map(floor(x),minYear,maxYear,(cnvW*margin),(cnvW-(cnvW*margin)));

      noStroke();
      fill(shapeDrawColor);
      beginShape();
      for (let sd=0;sd<shapeDrawList.length;sd++) {
        vertex(shapeDrawList[sd]['x'],shapeDrawList[sd]['y']);
      }
      vertex(shapeDrawX2,shapeDrawY2);
      vertex(shapeDrawX1,shapeDrawY2);
      vertex(shapeDrawX1,shapeDrawY1);
      endShape();
    }
  }
  // console.log(shapeList);
  // noLoop();
  // console.log(shapeList);
  // noLoop();
  //   let rectH = map(prevYears[p]['lCount'],0,maxYearCountryCount,0,cnvH-(cnvH*marginTop)-(cnvH*margin));
  //   let rectW = 15;
  //   let rectX = map(prevYears[p]['year'],minYear,maxYear,(cnvW*margin),(cnvW-(cnvW*margin))) - (rectW/2);
  //   let rectY = map(runningTotal,maxYearCountryCount,0,y1,y2);
  //   noStroke();
  //   fill(prevYears[p]['color']);
  //   rect(rectX,rectY,rectW,rectH);
  //
  // }
}


function mousePressed() {
  if (isHighlight) {
    if (countryClick) {
      if (highlightRank === stackedRank) {
        countryClick = false
        removeButton = false
      }
    } else {
      countryClick = true
      removeButton = true
    }
  } else if (removeButton) {
    for (let r in removeList) {
      if (mouseX >= removeList[r]['legx1'] && mouseY >= removeList[r]['legy1'] && mouseX <= removeList[r]['legx2'] && mouseY <= removeList[r]['legy2']) {
        countryClick = false
        removeButton = false
      } else {
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
    }
  } else {
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
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    xPace += 0.05;
  } else if (keyCode === DOWN_ARROW) {
    xPace -= 0.05;
  }
  if (autoPlay === false && (keyCode === LEFT_ARROW || keyCode === 37)) {
    x = floor(x) - 1
    drawEverything();
  } else if (autoPlay === false && (keyCode === RIGHT_ARROW || keyCode === 39) && floor(x) < maxYear) {
    x = floor(x) + 1
    drawEverything();
  }
}

// window.onresize = function() {
//   let w = window.innerWidth;
//   let h = window.innerHeight;
//   canvas.size(w,h);
//   width = w;
//   height = h;
// }
