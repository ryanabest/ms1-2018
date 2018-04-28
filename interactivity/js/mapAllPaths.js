// let sliderYear = 0;
// mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbmFiZXN0IiwiYSI6ImNqOTdzdWRpcjBhNnMzMmxzcHMyemxkMm0ifQ.ot3NoRC2w8zCbVOCkv2e_w';
// let map = L.map('map',{zoomControl:false,attributionControl:false}).fitBounds(L.latLngBounds(L.latLng(69,150),L.latLng(-9,-131)));

let map = L.map('map',{
                       // scrollWheelZoom: false
                       // ,zoomControl: false
                    }).setView([20,0],2); // Load the whole map first
var CartoDB_PositronNoLabels = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

// Add svg layer to my map
svgLayer = L.svg();
svgLayer.addTo(map);

// let width = window.innerWidth*0.9;
// let height = window.innerHeight*0.8;
//
// // console.log(width);
// d3.select("#map").style("width",width+"px").style("height",height+"px")

/*
d3.csv(filePath + "SubwayLocations.csv").then(function(locs) {
  locs.forEach(function(l) {
    l.Coords = (l.Coords.replace("[","").replace("]","").split(", "))
    l.Coords[0] = parseFloat(l.Coords[0]);
    l.Coords[1] = parseFloat(l.Coords[1]);
    // L.marker(l.Coords).addTo(map);
    L.marker(l.Coords).addTo(map)
     .bindPopup(l.City + ' - ' + l.Objects)
  })
})
*/


let svg = d3.select("#map").select("svg")
     ,g = svg.append("g").attr("class", "leaflet-zoom-hide")
     // ,defs = svg.append("svg:defs");

// let paths = $.getJSON(filePath + 'metObjectsVanGogh.json', function(paths) {
let paths = d3.json(filePath + "metObjectsVanGogh.json").then(function(paths) {
  let files = [];
  let promises = [];
  let objectTitles = [];

  // Load JSON file paths into list to create promises
  for (let p=0;p<Object.keys(paths.image).length;p++) {
    objectTitles.push({
      "objectNumber" : paths.object_number[p],
      "title"        : paths.title[p]
    })
    let JSONPath = filePath + "jsonLINE2" + paths.image[p].split(".")[0] + ".json";
    files.push(JSONPath);
  }
  files.forEach(function(url){
    promises.push(d3.json(url));
  })

  // Then load all JSON files, THEN draw pahts once they're loaded:
  Promise.all(promises).then(function(proms) {
    minYear = new Date().getFullYear();
    maxYear = 0;
    proms.forEach(function(p) {
      // console.log(p)
      if (p.objects[0].line.year < minYear) {
        minYear = p.objects[0].line.year;
      }
      if (p.objects[p.objects.length-1].line.year > maxYear) {
        maxYear = p.objects[p.objects.length-1].line.year
      }
    })
    let yearSliderValue = maxYear;
    let yearSlider = document.getElementById("year-slider");
    yearSlider.setAttribute("min",minYear);
    yearSlider.setAttribute("max",maxYear);
    yearSlider.setAttribute("value",yearSliderValue);
    drawPaths(yearSliderValue,proms);
    highlightSelection();

    function highlightSelection() {
      let svg = d3.select("#map").select("svg")
      svg.selectAll(".marker").style("opacity","0");
      svg.selectAll(".path").style("opacity","0");
      for (let p=0;p<proms.length;p++) {
        objectNumber = proms[p].objectNumber
        if (objectNumber==paintingSelection) {
          svg.select("#marker-"+objectNumber)
             .style("opacity","1");
          svg.select("#path-"+objectNumber)
             .style("opacity","0.5");
        }
      }
    }
    // drawMarkers();

    // update when slider changes
    yearSlider.oninput = function() {
      let y = d3.scaleLinear().domain([minYear,maxYear]).range([2,88])
      yearSliderValue = this.value;

      d3.select("#slideyear")
        .text(yearSliderValue)
        .style("left",y(yearSliderValue)+'%');

      drawPaths(yearSliderValue,proms)
    }

    map.on("viewreset", reset);
    map.on("zoomend", reset);


     //  ~~ FUNCTIONS ~~ //
    function reset() {
      drawPaths(yearSliderValue,proms);
    }

    function drawPaths(year,promises) {
      d3.select("#map").select("svg").selectAll(".path").remove();
      d3.select("#map").select("svg").selectAll(".marker").remove();
      let markerData = [];

      promises.forEach(function(m){ // I am now working on each painting path
        // Load thumbnail images from assets folder for vibrant color tail
        // console.log(m.)
        let mapRadius = 10;
        let img = document.createElement('img');
        imageThumbnail = filePath + "Thumbnails/" + m.imageName
        img.src = imageThumbnail;
        let pattern = svg.append("svg:pattern")
                          .attr("id","map-pattern-"+m.objectNumber)
                          .attr("x","0")
                          .attr("y","0")
                          .attr("width","1")
                          .attr("height","1")
                          .attr("patternUnits","objectBoundingBox")
                          .append("svg:image")
                          .attr("xlink:href",imageThumbnail)
                          .attr("width",mapRadius*2)
                          .attr("height",mapRadius*2)
        vibrantColor = Vibrant.from(img).getPalette(function(err,palette) {
          let vibrantColor      = "rgb("+Math.floor(palette['Vibrant']['r'])+","+Math.floor(palette['Vibrant']['g'])+","+Math.floor(palette['Vibrant']['b'])+")";
          let vibrantDarkColor  = "rgb("+Math.floor(palette['DarkVibrant']['r'])+","+Math.floor(palette['DarkVibrant']['g'])+","+Math.floor(palette['DarkVibrant']['b'])+")";
          // if (typeOf)
          // let vibrantLightColor = "rgb("+Math.floor(palette['LightVibrant']['r'])+","+Math.floor(palette['LightVibrant']['g'])+","+Math.floor(palette['LightVibrant']['b'])+")";

          // console.log(m.objectNumber);
          // console.log(palette);

          let promData = [];
          m.objects.forEach(function(d) {
            d.year = d.line.year
           ,d.latLng = d.line.coordinates
           ,d.cities = d.line.cities
           ,d.owner = d.line.owner
           // ,d.changeFlag = d.line.changeFlag[0]
           ,d.dataType = d.line.dataType
           ,d.objectNumber = d.objectNumber
          })

          for (let a=0;a<m.objects.length;a++) {
            let data = [];
            if (m.objects[a].dataType) {
              // console.log(m)
            // if (m.objects[a].dataType === 'provenance' /*&& m.objectNumber == 436533*/) {
              let dataPoint = {
                 "x":            map.latLngToLayerPoint(L.latLng(m.objects[a].latLng[1])).x
                ,"y":            map.latLngToLayerPoint(L.latLng(m.objects[a].latLng[1])).y
                ,"latLng":       m.objects[a].latLng[1]
                ,"year":         m.objects[a].year
                ,"city":         m.objects[a].cities[1]
                ,"owner":        m.objects[a].owner[1]
                ,"legs":         m.objects[a].latLng[1].length
                ,"objectNumber": m.objectNumber
                ,"color":        vibrantDarkColor
                ,"colorLight":   vibrantColor
              }
              data.push(dataPoint);
              if (m.objects[a].year <= parseInt(year)) {
                promData.push(dataPoint)
              }
            }


          }

          let lineFunction = d3.line()
                               .x(function(d) {return d.x})
                               .y(function(d) {return d.y})
                               .curve(d3.curveCatmullRom);


                         // .attr("stroke-dasharray","0,1000000000")

          let paths = d3.select("#map").select("svg")
                        .append('path')
                        .data(promData)
                        .attr('d',lineFunction(promData))
                        .attr("class","path")
                        .attr("id","path-"+m.objectNumber)
                        .attr("stroke",vibrantDarkColor)
                        .style("opacity",function(d) {
                          if (d.objectNumber == paintingSelection) {
                            return "0.5";
                          } else {
                            return "0";
                          }
                        })

          // console.log(promData[promData.length-1]);
          markerData.push(promData[promData.length-1]);

        // Marker
        if (promData.length > 0) {
          // let mapRadius = 10;
          let markerDatum;
          let markerPoint = map.latLngToLayerPoint(L.latLng(promData[promData.length-1].latLng));
          for (let ot=0;ot<objectTitles.length;ot++){
            if (objectTitles[ot].objectNumber==promData[promData.length-1].objectNumber) {
              markerDatum = objectTitles[ot]
            }
          }
          d3.select("#map").select("svg").append('circle')
                                         .datum(markerDatum)
                                         .attr("class","marker")
                                         .attr("id","marker-"+promData[promData.length-1].objectNumber)
                                         .attr("cx",markerPoint.x)
                                         .attr("cy",markerPoint.y)
                                         .attr("fill",function(d) {return "url(#map-pattern-"+promData[promData.length-1].objectNumber+")"})
                                         .attr("r",mapRadius)
                                         .style("opacity",function(d) {
                                           if (promData[promData.length-1].objectNumber == paintingSelection) {
                                             return "1";
                                           } else {
                                             return "0";
                                           }
                                         })
                                         // .style("opacity",1)
        }
        }) // closes vibrantColor
      }) // closes painting loop

    }


  }) // closes promise THEN
}) // closes first d3.JSON call

// map.on("viewreset", reset);
// map.on("zoomend", reset);
