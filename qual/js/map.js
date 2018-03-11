let pace = 750;



mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbmFiZXN0IiwiYSI6ImNqOTdzdWRpcjBhNnMzMmxzcHMyemxkMm0ifQ.ot3NoRC2w8zCbVOCkv2e_w';
// let map = L.map('map',{zoomControl:false,attributionControl:false}).fitBounds(L.latLngBounds(L.latLng(69,150),L.latLng(-9,-131)));
let map = L.map('map',{zoomControl:false,attributionControl:false}).setView([0,0],3); // Load the whole map first
L.tileLayer(
      'https://api.mapbox.com/styles/v1/ryanabest/cjeans7r303w02ro297dbye1j/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicnlhbmFiZXN0IiwiYSI6ImNqOTdzdWRpcjBhNnMzMmxzcHMyemxkMm0ifQ.ot3NoRC2w8zCbVOCkv2e_w', {
      attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
let svgLayer;
// L.control.scale().addTo(map);


 $(window).on("load", function() {
   $('.start-stop').click(function() {
     $('.container').empty()
     $('html,body').animate({
       scrollTop: $('#map').offset().top
     },1000);
     let painting = event.target.id;
     drawPath(painting);
   });
 });

function drawPath(painting) {
  if (typeof svgLayer != 'undefined') {
    svgLayer.remove();
  }; //remove svg layer if it already exists, allowing for replays
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.dragging.disable();
  svgLayer = L.svg();
  svgLayer.addTo(map);

  /* We simply pick up the SVG from the map object */
  let svg = d3.select("#map").select("svg")
       ,g = svg.append("g").attr("class", "leaflet-zoom-hide")
       ,defs = svg.append("svg:defs");

  svg.selectAll('.path').remove();

  // Add svg pattern to fill circle with painting and color the tail with the primary color in that painting
  $.getJSON('../assets/metObjectsVanGogh.json', function(data) {
    let circleRadius = 50;
    let imageThumbnail;
    for (let i=0;i<Object.keys(data['image']).length;i++) {
      let image = data['image'][i]
      if (image === painting) {
        imageThumbnail = 'assets/Thumbnails/'+image
      }
    }
    let img = document.createElement('img');
    img.src = imageThumbnail;
    vibrantColor = Vibrant.from(img).getPalette(function(err, palette) {
      let vibrantColor = "rgb("+Math.floor(palette['Vibrant']['r'])+","+Math.floor(palette['Vibrant']['g'])+","+Math.floor(palette['Vibrant']['b'])+")";
      let mutedColor = "rgb("+Math.floor(palette['Muted']['r'])+","+Math.floor(palette['Muted']['g'])+","+Math.floor(palette['Muted']['b'])+")";
      let pattern = defs.append("svg:pattern")
                        .attr("id","circleThumb")
                        .attr("x","0")
                        .attr("y","0")
                        .attr("width","1")
                        .attr("height","1")
                        .attr("patternUnits","objectBoundingBox")
                        .append("svg:image")
                        .attr("xlink:href",imageThumbnail)
                        .attr("width",circleRadius*2)
                        .attr("height",circleRadius*2)
                        // .attr("x",0)
                        // .attr("y",0)
      let paintingPath = painting.split('.')[0]
      let jsonData = 'assets/jsonLINE' + paintingPath + '.json'
      d3.json(jsonData, function(provenance) {
        console.log(paintingPath);
        /* Add a LatLng object to each item in the dataset */
        provenance.objects.forEach(function(d) {
           d.year = d.line.year
          ,d.latLng = d.line.coordinates
          ,d.cities = d.line.cities
          ,d.owner = d.line.owner
          ,d.changeFlag = d.line.changeFlag[0]
        })

        let allData = [];

        for (let a=0;a<provenance.objects.length;a++) {
          let data = [];
          for (let b=0;b<provenance.objects[a].latLng.length;b++) {
            let dataPoint = {
               "x": map.latLngToLayerPoint(L.latLng(provenance.objects[a].latLng[b])).x
              ,"y": map.latLngToLayerPoint(L.latLng(provenance.objects[a].latLng[b])).y
              ,"latLng": provenance.objects[a].latLng[b]
              ,"year": provenance.objects[a].year
              ,"city": provenance.objects[a].cities[b]
              ,"owner": provenance.objects[a].owner[b]
            }
            data.push(dataPoint)
          }
          allData.push({
            'index': a
            ,'data' : data
          })
          let lineFunction = d3.line()
                               .x(function(d) {return d.x})
                               .y(function(d) {return d.y})

          let paths = svg.append('path')
                        .attr('d',lineFunction(data))
                        .attr("class","path")
                        .attr("id","path"+String(a))
                        .attr("fill","none")
                        .attr("stroke",vibrantColor)
                        .attr("stroke-width","8")
                        .attr("opacity","0")
                        // .attr("stroke-dasharray","0,1000000000")
        }

        let marker = svg.append("circle")
                        .attr("r",circleRadius)
                        .attr("id","marker")
                        .attr("fill","url(#circleThumb)")
                        .attr("opacity","0")

        let firstPath = d3.select("#path0");
        let startPoint = pathStartPoint(firstPath);
        let markerLatLng = map.layerPointToLatLng(L.point(parseInt(startPoint.split(",")[0]),parseInt(startPoint.split(",")[1])));

        setTimeout(function() {
          map.setView(markerLatLng,5);
          iterate(painting);

          setTimeout(function() {
            let mmLatLngList = []
            for (let mm=0;mm<provenance.objects.length;mm++) {
              for (let ll=0;ll<provenance.objects[mm].latLng.length;ll++) {
                mmLatLngList.push(provenance.objects[mm].latLng[ll]);
              }
            }
            let finalBounds = new L.LatLngBounds(mmLatLngList);
            map.fitBounds(finalBounds);
            map.doubleClickZoom.enable();
            map.dragging.enable();
            // let zoom = L.control.zoom();
            // zoom.addTo(map);
          },pace*(allData.length+1))
        },1000);


        map.on("viewreset", reset);
        map.on("zoomend", reset);
        reset();

        function iterate(painting) {
          // for (let i=21;i<22;i++) {
          for (let i=0;i<provenance.objects.length;i++) {
            let path = d3.select('#path'+i).call(transition);

            function transition(path) {
              path.transition()
                  .delay(pace*i)
                  .duration(pace)
                  .attr("style","opacity:.5")
                  .attrTween('stroke-dasharray',tweenDash)

                  // Change year and print div to console with jQuery
                  .on("start",function() {
                    let currentYear = provenance.objects[i].year;
                    let maxYear = provenance.objects[provenance.objects.length-1].year;
                    let minYear = provenance.objects[0].year;
                    let currentYearDiff = maxYear - currentYear;
                    let totalYearDiff = maxYear - minYear;
                    $("#current-year").text(currentYear);
                    $("#current-year").css('opacity','1');

                    if (provenance.objects[i].changeFlag === 1) {
                      let divID = 'year-' + provenance.objects[i].year;
                      let divText = "";
                      divText += "<br><div class=flex-div id="+divID+">"
                      divText += "<h1>"+provenance.objects[i].year+"</h1>";
                      divText += "<ol>"
                      let olItems = '';
                      for (let x=0;x<provenance.objects[i].cities.length;x++) {
                        olItems += "<li>" + provenance.objects[i].owner[x] + " (" + provenance.objects[i].cities[x] + ")</li>"
                      }
                      divText += olItems
                      divText += "</ol></div>"
                      $('.container').append(divText)
                    }
                  })

                  function tweenDash(d) {
                    let l = path.node().getTotalLength();
                    let s = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr
                    return function (t) {
                      let marker = d3.select("#marker");
                      let p = path.node().getPointAtLength(t * l);
                      markerLatLng = map.layerPointToLatLng(L.point(p));
                      marker.attr("opacity","1");
                      marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
                      map.panTo(markerLatLng,duration=pace/1000);
                      return s(t);
                      }
                    }
            }
          }
        }

        function pathStartPoint(path) {
          let d = path.attr("d"),
              dsplitted = d.split("L");
          return(dsplitted[0].replace("M","").replace("Z",""));
        }

        function reset() {
          for (let pr=0;pr<allData.length;pr++) { // for each path (one for every year)
            for (let prd=0;prd<allData[pr]['data'].length;prd++) {
              allData[pr]['data'][prd].x = map.latLngToLayerPoint(allData[pr]['data'][prd]['latLng']).x; // reset x and y coordinates in the data based on current map composition
              allData[pr]['data'][prd].y = map.latLngToLayerPoint(allData[pr]['data'][prd]['latLng']).y;
            }

            let lineFunction = d3.line() // create new line formula to turn these new x and y coordinates into the format needed for path svg type
                                 .x(function(d) {return d.x})
                                 .y(function(d) {return d.y})

            let pathReset = d3.select('#path'+pr); // select individual path for this # in loop
            pathReset.attr('d',lineFunction(allData[pr]['data'])) // reset path location
            let l = pathReset.node().getTotalLength();
            pathReset.attr('stroke-dasharray',l)

          }
          // put the marker in the right spot when the map moves
          let markerPoint = map.latLngToLayerPoint(L.latLng(markerLatLng));
          d3.select("#marker")
            .attr("transform","translate(" + markerPoint.x + "," + markerPoint.y + ")") //move marker
          }
      })
    });
  })
}
