// let sliderYear = 0;
// mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbmFiZXN0IiwiYSI6ImNqOTdzdWRpcjBhNnMzMmxzcHMyemxkMm0ifQ.ot3NoRC2w8zCbVOCkv2e_w';
// let map = L.map('map',{zoomControl:false,attributionControl:false}).fitBounds(L.latLngBounds(L.latLng(69,150),L.latLng(-9,-131)));
let map = L.map('map',{
                       zoomControl:false
                      ,attributionControl:false
                    }).setView([30,0],2); // Load the whole map first
var CartoDB_PositronNoLabels = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);

// Add svg layer to my map
svgLayer = L.svg();
svgLayer.addTo(map);

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

let paths = $.getJSON(filePath + 'metObjectsVanGogh.json', function(paths) {
// let paths = d3.json(filePath + "metObjectsVanGogh.json").then(function(paths) {
  let files = [];
  let promises = [];

  // Load JSON file paths into list to create promises
  for (let p=0;p<Object.keys(paths.image).length;p++) {
    let JSONPath = filePath + "jsonLine2" + paths.image[p].split(".")[0] + ".json";
    files.push(JSONPath);
  }
  files.forEach(function(url){
    promises.push(d3.json(url));
  })

  // Then load all JSON files, THEN draw pahts once they're loaded:
  Promise.all(promises).then(function(proms) {
    let minYear = new Date().getFullYear();
    let maxYear = 0;
    proms.forEach(function(p) {
      if (p.objects[0].line.year < minYear) {
        minYear = p.objects[0].line.year;
      }
      if (p.objects[p.objects.length-1].line.year > maxYear) {
        maxYear = p.objects[p.objects.length-1].line.year
      }
    })
    let yearSliderValue = minYear;
    let yearSlider = document.getElementById("year-slider");
    yearSlider.setAttribute("min",minYear);
    yearSlider.setAttribute("max",maxYear);
    yearSlider.setAttribute("value",minYear);

    drawPaths(yearSliderValue,proms);
    // drawMarkers();

    // update opacity when slider changes
    yearSlider.oninput = function() {
      yearSliderValue = this.value;
      console.log(yearSliderValue);
      // opacityYear(yearSliderValue);
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
        let img = document.createElement('img');
        imageThumbnail = filePath + "Thumbnails/" + m.imageName
        img.src = imageThumbnail;
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
            // if (m.objects[a].dataType) {
            if (m.objects[a].dataType === 'provenance' /*&& m.objectNumber == 436533*/) {
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

          // console.log(promData[promData.length-1]);
          markerData.push(promData[promData.length-1]);

        // Marker
        // console.log(m.objectNumber)
        // console.log(promData);
        if (promData.length > 0) {
          let circleRadius = 10;
          let markerPoint = map.latLngToLayerPoint(L.latLng(promData[promData.length-1].latLng))
          // console.log(markerPoint);
          d3.select("#map").select("svg").append('circle')
                                         .attr("class","marker")
                                         .attr("id","marker-"+promData[promData.length-1].objectNumber)
                                         .attr("cx",markerPoint.x)
                                         .attr("cy",markerPoint.y)
                                         .attr("fill",vibrantDarkColor)
                                         .attr("r",circleRadius)
                                         // .style("opacity",1)
        }
        }) // closes vibrantColor
      }) // closes painting loop
      // console.log(Object.keys(markerData));
    }

    function drawMarkers() {
      let circleRadius = 10;
      d3.select("#map").select("svg").selectAll(".marker").remove();
      console.log(Object.keys(markerData).length);
      for (let md=0;md<markerData.length;md++) {
        console.log(markerData[md]);
      }
    }

  }) // closes promise THEN
}) // closes first d3.JSON call

// map.on("viewreset", reset);
// map.on("zoomend", reset);
