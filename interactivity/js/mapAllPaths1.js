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

let svg = d3.select("#map").select("svg")
     ,g = svg.append("g").attr("class", "leaflet-zoom-hide")
     // ,defs = svg.append("svg:defs");

let paths = d3.json(filePath + "metObjectsVanGogh.json").then(function(paths) {
  let files = [];
  let promises = [];

  // Load JSON file paths into list to create promises
  for (let p=0;p<Object.keys(paths.image).length;p++) {
    let JSONPath = filePath + "jsonLINE" + paths.image[p].split(".")[0] + ".json";
    files.push(JSONPath);
  }
  files.forEach(function(url){
    promises.push(d3.json(url));
  })

  // Then load all JSON files, THEN draw pahts once they're loaded:
  Promise.all(promises).then(function(proms) {
    let minYear = proms[0].objects[0].line.year;
    let maxYear = proms[0].objects[proms[0].objects.length-1].line.year;
    let yearSliderValue = minYear;

    let yearSlider = document.getElementById("year-slider");
    yearSlider.setAttribute("min",minYear);
    yearSlider.setAttribute("max",maxYear);
    yearSlider.setAttribute("value",minYear);

    let allData = [];
    proms.forEach(function(m){ // I am now working on each painting path
      // Load thumbnail images from assets folder for vibrant color tail
      let promData = [];
      let img = document.createElement('img');
      imageThumbnail = filePath + "Thumbnails/" + m.imageName
      // let circleRadius = 7.5;
      // let pattern = defs.append("svg:pattern")
      //                   .attr("id","circleThumb-"+m.objectNumber)
      //                   .attr("x","0")
      //                   .attr("y","0")
      //                   .attr("width","1")
      //                   .attr("height","1")
      //                   .attr("patternUnits","objectBoundingBox")
      //                   .append("svg:image")
      //                   .attr("xlink:href",imageThumbnail)
      //                   .attr("width",circleRadius*2)
      //                   .attr("height",circleRadius*2)
      img.src = imageThumbnail;
      vibrantColor = Vibrant.from(img).getPalette(function(err,palette) {
        let vibrantColor     = "rgb("+Math.floor(palette['Vibrant']['r'])+","+Math.floor(palette['Vibrant']['g'])+","+Math.floor(palette['Vibrant']['b'])+")";
        let vibrantDarkColor = "rgb("+Math.floor(palette['DarkVibrant']['r'])+","+Math.floor(palette['DarkVibrant']['g'])+","+Math.floor(palette['DarkVibrant']['b'])+")";


        m.objects.forEach(function(d) {
          d.year = d.line.year
         ,d.latLng = d.line.coordinates
         ,d.cities = d.line.cities
         ,d.owner = d.line.owner
         ,d.changeFlag = d.line.changeFlag[0]
         ,d.dataType = d.line.dataType
         ,d.objectNumber = d.objectNumber
        })

        // let marker = svg.append('circle')
        //                  // .data(data)
        //                  .attr("class","marker")
        //                  .attr("id","marker-"+m.objectNumber)
        //                  .attr("cx",0)
        //                  .attr("cy",0)
        //                  .attr("r",circleRadius)
        //                  // .attr("fill","url(#circleThumb-"+m.objectNumber+")")
        //                  .attr("fill",vibrantColor)

        for (let a=0;a<m.objects.length;a++) {
          let data = [];
          for (let b=0;b<m.objects[a].dataType.length;b++) {
            // if (m.objects[a].dataType[b]) {
            if (m.objects[a].dataType[b] === 'provenance') {
              if (typeof m.objects[a].latLng[b] !== 'undefined') {
                let dataPoint = {
                   "x":      map.latLngToLayerPoint(L.latLng(m.objects[a].latLng[b])).x
                  ,"y":      map.latLngToLayerPoint(L.latLng(m.objects[a].latLng[b])).y
                  ,"latLng": m.objects[a].latLng[b]
                  ,"year":   m.objects[a].year
                  ,"city":   m.objects[a].cities[b]
                  ,"owner":  m.objects[a].owner[b]
                  ,"legs":   m.objects[a].latLng[b].length
                }
                data.push(dataPoint)
              }
            }
          }

          allData.push({
             'objectNumber': m.objectNumber
            ,'year'        : m.objects[a].year
            ,'index'       : a
            ,'data'        : data
            ,'vibColor'    : vibrantColor
            ,'darkColor'   : vibrantDarkColor
          })
          let lineFunction = d3.line()
                               .x(function(d) {return d.x})
                               .y(function(d) {return d.y})
                               .curve(d3.curveCatmullRom);


                         // .attr("stroke-dasharray","0,1000000000")

          if (data.length>0) {

            let paths = svg.append('path')
                           .data(data)
                           .attr('d',lineFunction(data))
                           .attr("class","path")
                           .attr("id","path-"+m.objectNumber+"-"+m.objects[a].year)
                           .attr("stroke",vibrantDarkColor)

          }
        }
      }) // closes vibrantColor
    }) // closes for each painting loop
    map.on("viewreset", reset);
    map.on("zoomend", reset);

    function reset() {
      // console.log(allData);
      for (let pr=0;pr<allData.length;pr++) { // for each path (one for every year)
        if (allData[pr].data.length > 0) { // avoid those paths where the painting does not yet exist

          for (let prd=0;prd<allData[pr]['data'].length;prd++) {
            allData[pr]['data'][prd].x = map.latLngToLayerPoint(allData[pr]['data'][prd]['latLng']).x; // reset x and y coordinates in the data based on current map composition
            allData[pr]['data'][prd].y = map.latLngToLayerPoint(allData[pr]['data'][prd]['latLng']).y;

            if (allData[pr].data[prd].year <= parseInt(yearSliderValue)) {
              let markerPoint = map.latLngToLayerPoint(L.latLng(allData[pr].data[prd].latLng))
              let markerReset = d3.select('#marker-'+allData[pr].objectNumber); // select individual marker for this # in loop
              markerReset.attr("cx",markerPoint.x).attr("cy",markerPoint.y);
            }
          }

          let lineFunction = d3.line() // create new line formula to turn these new x and y coordinates into the format needed for path svg type
                               .x(function(d) {return d.x})
                               .y(function(d) {return d.y})
                               .curve(d3.curveCatmullRom);

          let pathReset = d3.select('#path-'+allData[pr].objectNumber+"-"+allData[pr].data[0].year); // select individual path for this # in loop
          pathReset.attr('d',lineFunction(allData[pr]['data'])) // reset path location

        }
      }
    }

    function opacityYear(year) {
      let circleRadius = 10;
      d3.select("#map").select("svg").selectAll(".marker").remove();
      for (let pr=0;pr<allData.length;pr++) {
        if (allData[pr].data.length > 0) { // avoid those paths where the painting does not yet exist
          if (allData[pr].data[0].year <= parseInt(year)) {
            d3.select('#path-'+allData[pr].objectNumber+"-"+allData[pr].data[0].year).style("opacity",0.5);
          } else {
            d3.select('#path-'+allData[pr].objectNumber+"-"+allData[pr].data[0].year).style("opacity","0");
          }
        }

        if (allData[pr].year === parseInt(year)) {
          if (allData[pr].data.length > 0) {
            let markerPoint = map.latLngToLayerPoint(L.latLng(allData[pr].data[allData[pr].data.length-1].latLng))
            d3.select("#map").select("svg").append('circle')
                                           .attr("class","marker")
                                           .attr("id","marker-"+allData[pr].objectNumber)
                                           .attr("cx",markerPoint.x)
                                           .attr("cy",markerPoint.y)
                                           .attr("fill",allData[pr].darkColor)
                                           .attr("r",circleRadius)
                                           .style("opacity",1)
            // d3.select('#marker-'+allData[pr].objectNumber).style("opacity","0.5");
            // d3.select('#marker-'+allData[pr].objectNumber).attr("cx",markerPoint.x).attr("cy",markerPoint.y);
          }
        }
      }
    }

    // update opacity when slider changes
    yearSlider.oninput = function() {
      yearSliderValue = this.value;
      opacityYear(yearSliderValue);
    }
  }) // closes promise THEN
}) // closes first d3.JSON call

// map.on("viewreset", reset);
// map.on("zoomend", reset);
