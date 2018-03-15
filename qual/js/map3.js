let pace = 400;
// let filePath = '../assets/' // Local Testing
let filePath = '/ms1-2018/qual/assets/' // GitHub Pages

let panZoomLevel = 5;
let timelineWidth = 88;


mapboxgl.accessToken = 'pk.eyJ1IjoicnlhbmFiZXN0IiwiYSI6ImNqOTdzdWRpcjBhNnMzMmxzcHMyemxkMm0ifQ.ot3NoRC2w8zCbVOCkv2e_w';
// let map = L.map('map',{zoomControl:false,attributionControl:false}).fitBounds(L.latLngBounds(L.latLng(69,150),L.latLng(-9,-131)));
let map = L.map('map',{
                       zoomControl:false
                      ,attributionControl:false
                      ,easeLinearity:1
                      ,zoomSnap:0
                    }).setView([0,0],3); // Load the whole map first
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
  // map.doubleClickZoom.disable();
  // map.scrollWheelZoom.disable();
  // map.dragging.disable();
  svgLayer = L.svg();
  svgLayer.addTo(map);

  /* We simply pick up the SVG from the map object */
  let svg = d3.select("#map").select("svg")
       ,g = svg.append("g").attr("class", "leaflet-zoom-hide")
       ,defs = svg.append("svg:defs");

  /* Remove all previous paths from the map */
  svg.selectAll('.path').remove();
  svg.selectAll('#marker').remove();

  // Add svg pattern to fill circle with painting and color the tail with the primary color in that painting
  $.getJSON(filePath + 'metObjectsVanGogh.json', function(data) {
    let circleRadius = 50;
    let imageThumbnail;
    for (let i=0;i<Object.keys(data['image']).length;i++) {
      let image = data['image'][i]
      if (image === painting) {
        imageThumbnail = filePath+'Thumbnails/'+image
      }
    }
    let img = document.createElement('img');
    img.src = imageThumbnail;
    vibrantColor = Vibrant.from(img).getPalette(function(err, palette) {
      let vibrantColor = "rgb("+Math.floor(palette['Vibrant']['r'])+","+Math.floor(palette['Vibrant']['g'])+","+Math.floor(palette['Vibrant']['b'])+")";
      let mutedColor = "rgb("+Math.floor(palette['DarkMuted']['r'])+","+Math.floor(palette['DarkMuted']['g'])+","+Math.floor(palette['DarkMuted']['b'])+")";
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

      let jsonData = filePath + 'jsonLINE2' + paintingPath + '.json'
      d3.json(jsonData, function(provenance) {
        console.log(paintingPath);

        // for ()

        /* First let's reset our timeline svg */
        d3.selectAll('.timeline-circle').remove()

        /* Add a LatLng object to each item in the dataset */
        provenance.objects.forEach(function(d) {
           d.year = d.line.year
          ,d.latLng = d.line.coordinates
          ,d.cities = d.line.cities
          ,d.owner = d.line.owner
          ,d.changeFlag = d.line.changeFlag[0]
        })



        // let maxYear = provenance.objects[provenance.objects.length-1].year
        let maxYear = new Date().getFullYear();
        let minYear = provenance.objects[0].year;

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
              ,"legs": provenance.objects[a].latLng[b].length
            }
            data.push(dataPoint)
          }
          allData.push({
            'index': a
            ,'data' : data
          })

          // draw all paths in data onto the svg layer, with opacity 0
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

        // draw my painting circle, which I'll also fill in later
        let marker = svg.append("circle")
                        .attr("r",circleRadius)
                        .attr("id","marker")
                        .attr("fill","url(#circleThumb)")
                        .attr("opacity","0")

        let cityText = svg.append("text")
                          .attr("id","city-text")
                          .attr("x",0)
                          .attr("y",0)
                          .attr("fill",mutedColor)
                          .attr("font-size","30")
                          .attr("font-family","Georgia")
                          .attr("style","font-weight: 600;")
                          .attr("text-anchor","middle")
                          .attr("opacity","0")
                          .text("replaced")

        let ownerText = svg.append("text")
                          .attr("id","owner-text")
                          .attr("x",0)
                          .attr("y",0)
                          .attr("fill",mutedColor)
                          .attr("font-size","18")
                          .attr("font-family","Georgia")
                          .attr("style","font-weight: 200; font-style: italic;")
                          .attr("text-anchor","middle")
                          .attr("opacity","0")
                          .text("test")

        let firstPath = d3.select("#path0");
        let startPoint = pathStartPoint(firstPath);
        let markerLatLng = map.layerPointToLatLng(L.point(parseInt(startPoint.split(",")[0]),parseInt(startPoint.split(",")[1])));

        map.on("viewreset", reset);
        map.on("zoomend", reset);
        reset();

        setTimeout(function() {
          map.setView(markerLatLng,panZoomLevel);
          map.panTo(markerLatLng);
          iterate(painting);
          // drawAllPaths();
          d3.select("#marker").attr("opacity","1");
          drawTimeline();

          // setTimeout(function() {
          //   // let adPath = d3.select("path22")
          //   drawOne(22,'');
          // },2000)

          function iterate(painting) {
            let delayTimes = []
            let adDelay = 0;
            for (let ad=0;ad<allData.length;ad++) {
              let distanceTraveled = 0;
              for (let td=1;td<=allData[ad].data.length-1;td++) {
                distanceTraveled += L.latLng(allData[ad].data[td-1].latLng).distanceTo(L.latLng(allData[ad].data[td].latLng))
              }
              let distanceMultiplier = distanceTraveled/10000000
              let avgDistance = distanceTraveled/allData[ad].data.length
              let adDuration = (pace*allData[ad].data.length*(Math.floor(avgDistance/1000000)+1))
              delayTimes.push({
                 'index':    ad
                ,'delay':    adDelay
                ,'duration': adDuration
                ,'distance': distanceTraveled
                ,'mult'    : Math.floor(avgDistance/1000000)+1
              })
              adDelay += adDuration + (2*pace)
            }

            let totalDelay = delayTimes[delayTimes.length-1]['delay'] + delayTimes[delayTimes.length-1]['duration']

            for (let i=0;i<allData.length;i++) {
              let delayTime;
              let durationTime;
              for (let d=0;d<delayTimes.length;d++) {
                if (d === i) {
                  delayTime = delayTimes[d].delay
                  durationTime = delayTimes[d].duration
                }
              }
              drawOne(i,'',delayTime,durationTime);
            }

            setTimeout(function() {
              // Reset view to show the whole path
              let mmLatLngList = []
              for (let mm=0;mm<provenance.objects.length;mm++) {
                for (let ll=0;ll<provenance.objects[mm].latLng.length;ll++) {
                  mmLatLngList.push(provenance.objects[mm].latLng[ll]);
                }
              }
              let finalBounds = new L.LatLngBounds(mmLatLngList);
              map.fitBounds(finalBounds,{maxZoom:8,padding:[250,250]});

              let timelineSVG = d3.select("#timeline-svg")
              let totalYearDiff = maxYear - minYear;
              let yearChangePercent = ((((totalYearDiff)/totalYearDiff)*timelineWidth)+6)+'%';
              let yearChangeTextPercent = ((((totalYearDiff)/totalYearDiff)*timelineWidth)+6.5)+'%';

              d3.select('#city-text').text(" ")
              d3.select('#owner-text').text(" ")

              d3.select('#currentYear-line').transition()
                                            // .delay(delay)
                                            .duration(pace)
                                            .attr("x1",yearChangePercent)
                                            .attr("x2",yearChangePercent)
                                            .attr("opacity",1)

              d3.select('#currentYear-text').transition()
                                            // .delay(delay)
                                            .duration(pace)
                                            .text(maxYear)
                                            .attr("x",yearChangeTextPercent)

              // Enable hover for circles
              d3.selectAll(".timeline-circle")
                         .on("mouseover",function(d) {
                           d3.selectAll('#marker').attr("opacity",1);
                           d3.selectAll('#city-text').attr("opacity",0);
                           d3.selectAll('#owner-text').attr("opacity",0);
                           let divData = d3.select(this).datum();
                           let thisPath = parseInt(d3.select(this).attr('id').split("-").slice(-1)[0]);
                           d3.select(this).attr("r",10)
                                          .attr("fill","red")
                           // $('#map-and-text').append(divData)
                           drawOneHover(thisPath,divData);
                         })
                         .on("mouseout",function(d) {
                           d3.select(this).attr("r","0.5%")
                                          .attr("fill","white")
                           // drawAllPaths();
                         })
            },totalDelay)
          }



          function drawTimeline() {
            d3.selectAll('.timeline-legend').remove()
            for (let j=minYear;j<maxYear;j++) {
              let currentYear = j;
              // let maxYear = provenance.objects[provenance.objects.length-1].year;
              // let minYear = provenance.objects[0].year;
              let currentYearDiff = maxYear - currentYear;
              let totalYearDiff = maxYear - minYear;
              let yearChangePercent = ((((totalYearDiff-currentYearDiff)/totalYearDiff)*timelineWidth)+6)+'%';
              let yearChangeTextPercent = ((((totalYearDiff-currentYearDiff)/totalYearDiff)*timelineWidth)+6.5)+'%';
              if (currentYear%10 === 0) {
                d3.select('#timeline-svg').append("text")
                                          .attr("class","timeline-legend")
                                          .attr("x",yearChangeTextPercent)
                                          .attr("y","90%")
                                          .attr("fill","#FFF")
                                          .attr("font-size","15")
                                          .attr("font-family","HelveticaNeue-Light")
                                          .attr("style","font-style: italic; font-weight: 100;")
                                          .attr("text-anchor","start")
                                          .text(currentYear)
                d3.select('#timeline-svg').append("line")
                                          .attr("class","timeline-legend")
                                          .attr("x1",yearChangePercent)
                                          .attr("y1","75%")
                                          .attr("x2",yearChangePercent)
                                          .attr("y2","90%")
                                          .attr("style","stroke:#FFF ; stroke-width:0.5 ; stroke-dasharray:1")
              };
            }
          }
        },1000);

        function drawOneHover(thisPath,divData) {
          $('.flex-div').remove()
          d3.selectAll('.path').attr("style","opacity:0");
          // d3.selectAll('#marker').attr("style","opacity:0");
          for (let i=0;i<provenance.objects.length;i++) {
            if (i === thisPath) {
              let drawOneLatLngList = provenance.objects[i].latLng
              let drawOneBounds = new L.LatLngBounds(drawOneLatLngList);
              map.fitBounds(drawOneBounds,{maxZoom:8,padding:[250,250]});

              map.on("zoomend",function(d) {
                // d3.selectAll('#marker').attr("style","opacity:1");
              })

              let startingLatLng = drawOneLatLngList[0]
              let markerStartPoint = map.latLngToLayerPoint(startingLatLng)
              // d3.select('#marker').attr("transform", "translate(" + markerStartPoint.x + "," + markerStartPoint.y + ")")

              function transition(path) {
                path.attr("style","opacity:0.3")
                    // .delay(1000)

                path.transition()
                    .delay(1000)
                    .duration(500*provenance.objects[i].latLng.length)
                    // .attr("style","opacity:.5")
                    .attrTween('stroke-dasharray',tweenDash)
                    .on("start", function() {
                      let city = provenance.objects[i].cities[1]
                      d3.select("#city-text").attr("opacity",0).text(city)
                      d3.select('#city-text').transition()
                                             .duration(500*provenance.objects[i].latLng.length)
                                             .attr("opacity",1)


                      let owner = provenance.objects[i].owner[1]
                      d3.select("#owner-text").attr("opacity",0).text(owner)
                      d3.select('#owner-text').transition()
                                             .duration(500*provenance.objects[i].latLng.length)
                                             .attr("opacity",1)
                    })

                    function tweenDash(d) {
                      // d3.selectAll('#marker').attr("style","opacity:1");
                      let l = path.node().getTotalLength();
                      let s = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr
                      return function (t) {
                        let marker = d3.select("#marker");
                        let p = path.node().getPointAtLength(t * l);
                        markerLatLng = map.layerPointToLatLng(L.point(p));
                        marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
                        d3.select('#city-text').attr("transform","translate(" + (p.x) + "," + (p.y+1.5*circleRadius) + ")");
                        d3.select('#owner-text').attr("transform","translate(" + (p.x) + "," + (p.y+2*circleRadius) + ")");
                        marker.attr("opacity","1");
                        // return s(t);
                        }
                    }
                }

              let path = d3.select("#path"+i).call(transition)

              let currentYear = provenance.objects[i].year;
              let currentYearDiff = maxYear - currentYear;
              let totalYearDiff = maxYear - minYear;
              let yearChangePercent = ((((totalYearDiff-currentYearDiff)/totalYearDiff)*timelineWidth)+6)+'%';
              let yearChangeTextPercent = ((((totalYearDiff-currentYearDiff)/totalYearDiff)*timelineWidth)+6.5)+'%';

              d3.select('#currentYear-line').attr("x1",yearChangePercent)
                                            .attr("x2",yearChangePercent)
                                            .attr("opacity",1)

              d3.select('#currentYear-text').text(currentYear)
                                            .attr("x",yearChangeTextPercent)

              $('#map-and-text').append(divData)

            // let path = d3.select('#path'+i) //.call(transition);
            // console.log(path.node().getTotalLength())
          }
        }
      }


        function drawOne(thisPath,divData,delay,duration) {
          $('.flex-div').remove()
          d3.selectAll('.path').attr("style","opacity:0");
          // d3.selectAll('#marker').attr("style","opacity:0");

          for (let i=0;i<provenance.objects.length;i++) {
            if (i === thisPath) {
              let drawOneLatLngList = provenance.objects[i].latLng
              let drawOneBounds = new L.LatLngBounds(drawOneLatLngList);
              let marketLatLng = L.latLng(drawOneLatLngList[0]);
              let markerPoint = map.latLngToLayerPoint(L.latLng(markerLatLng));
              d3.select("#marker")
                .attr("transform","translate(" + markerPoint.x + "," + markerPoint.y + ")") //move marker
              // map.fitBounds(drawOneBounds,{maxZoom:8,padding:[250,250]});

              map.on("zoomend",function(d) {
                // d3.selectAll('#marker').attr("style","opacity:1");
              })

              function transition(path) {
                // path.attr("style","opacity:0.3")
                    // .delay(1000)

                let currentYear = provenance.objects[i].year;
                // let maxYear = provenance.objects[provenance.objects.length-1].year;
                // let minYear = provenance.objects[0].year;
                let currentYearDiff = maxYear - currentYear;
                let totalYearDiff = maxYear - minYear;
                let yearChangePercent = ((((totalYearDiff-currentYearDiff)/totalYearDiff)*timelineWidth)+6)+'%';
                let yearChangeTextPercent = ((((totalYearDiff-currentYearDiff)/totalYearDiff)*timelineWidth)+6.5)+'%';

                d3.select('#currentYear-line').transition()
                                              .delay(delay)
                                              .duration(pace)
                                              .attr("x1",yearChangePercent)
                                              .attr("x2",yearChangePercent)
                                              .attr("opacity",1)

                d3.select('#currentYear-text').transition()
                                              .delay(delay)
                                              .duration(pace)
                                              .text(currentYear)
                                              .attr("x",yearChangeTextPercent)


                path.transition()
                    .delay(delay)
                    .duration(duration)
                    .attr("style","opacity:.3")
                    .attrTween('stroke-dasharray',tweenDash)
                    .on("start",function() {
                      let city = provenance.objects[i].cities[1]
                      d3.select("#city-text").attr("opacity",0).text(city)
                      d3.select('#city-text').transition()
                                             .duration(duration)
                                             .attr("opacity",1)

                      let owner = provenance.objects[i].owner[1]
                      d3.select("#owner-text").attr("opacity",0).text(owner)
                      d3.select('#owner-text').transition()
                                             .duration(duration)
                                             .attr("opacity",1)

                      let currentYear = provenance.objects[i].year;
                      // let maxYear = provenance.objects[provenance.objects.length-1].year;
                      // let minYear = provenance.objects[0].year;
                      let currentYearDiff = maxYear - currentYear;
                      let totalYearDiff = maxYear - minYear;
                      let yearChangePercent = ((((totalYearDiff-currentYearDiff)/totalYearDiff)*timelineWidth)+6)+'%';
                      let yearChangeTextPercent = ((((totalYearDiff-currentYearDiff)/totalYearDiff)*timelineWidth)+6.5)+'%';

                      let divID = 'year-' + provenance.objects[i].year;
                      let divText = "";
                      divText += "<div class=flex-div id="+divID+">"
                      divText += "<h1>"+provenance.objects[i].year+"</h1>";
                      divText += "<ol>"
                      let olItems = '';
                      for (let x=0;x<provenance.objects[i].cities.length;x++) {
                        olItems += "<li>" + provenance.objects[i].cities[x] + "<br><span class=li-small>" + provenance.objects[i].owner[x] + "</span><br></li>"
                      }
                      divText += olItems
                      divText += "</ol></div>"

                      let timelineSVG = d3.select("#timeline-svg")
                      let yStack = [];
                      let yOffset = 0;
                      for (let j=0;j<provenance.objects.length;j++) {
                        if(provenance.objects[j].year === currentYear) {
                          yStack.push(j)
                        }
                      }
                      for (let y=0;y<yStack.length;y++) {
                        if (yStack[y]===i) {
                          yOffset = y
                        }
                      }
                      let timelineR = 0.5
                      let timelineD = timelineR * 2
                      timelineSVG.append("circle")
                                 .attr("cx",yearChangePercent)
                                 .attr("cy",String(75-(6*yOffset))+'%') // 75 is the % of the axis, and the 6 is just a number that makes this work on my laptop
                                 .attr("r",String(timelineR)+'%')
                                 // .attr("r",'5')
                                 .attr("fill","white")
                                 .attr("id","circle-"+currentYear+'-'+i)
                                 .attr("class","timeline-circle")
                                 .datum(divText)
                                 .on("click",function(){
                                   drawAllPaths();
                                 })
                    })

                    function tweenDash(d) {
                      // d3.selectAll('#marker').attr("style","opacity:1");
                      let l = path.node().getTotalLength();
                      let s = d3.interpolateString("0," + l, l + "," + l); // interpolation of stroke-dasharray style attr
                      return function (t) {
                        let marker = d3.select("#marker");
                        let p = path.node().getPointAtLength(t * l);
                        markerLatLng = map.layerPointToLatLng(L.point(p));
                        map.setView(markerLatLng,panZoomLevel);
                        marker.attr("transform", "translate(" + p.x + "," + p.y + ")"); //move marker
                        marker.attr("opacity","1");
                        d3.select('#city-text').attr("transform","translate(" + (p.x) + "," + (p.y+1.5*circleRadius) + ")");
                        d3.select('#owner-text').attr("transform","translate(" + (p.x) + "," + (p.y+2*circleRadius) + ")");
                        return s(t);
                        }
                    }
                }

              let path = d3.select("#path"+i).call(transition)
              $('#map-and-text').append(divData)
          }
        }
      }

      function drawAllPaths() {
        d3.select('#city-text').text(" ");
        d3.select('#owner-text').text(" ");
        d3.select('#currentYear-line').attr("x1",String(timelineWidth+6)+'%')
                                      .attr("x2",String(timelineWidth+6)+'%')
                                      .attr("opacity",1)
        d3.select('#currentYear-text').text(maxYear)
                                      .attr("x",String(timelineWidth+6.5)+'%')
        $('.flex-div').remove()
        let drawAllLatLngList = []
        for (let i=0;i<provenance.objects.length;i++) {
          for (let ll=0;ll<provenance.objects[i].latLng.length;ll++) {
            drawAllLatLngList.push(provenance.objects[i].latLng[ll])
          }
        }
        let drawAllBounds = new L.LatLngBounds(drawAllLatLngList);
        map.flyToBounds(drawAllBounds,{maxZoom:8,padding:[250,250]});


        for (let i=0;i<allData.length;i++) {
          let path = d3.select("#path"+i)
          let l =path.node().getTotalLength()
          path.attr("style","opacity:.5")
              .attr("stroke-dasharray",l)
        }
        map.on('moveend',function(d) {
          let endingLatLng = drawAllLatLngList.slice(-1)[0]
          let markerEndPoint = map.latLngToLayerPoint(endingLatLng)
          d3.select('#marker').attr("transform", "translate(" + markerEndPoint.x + "," + markerEndPoint.y + ")")
        })
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
