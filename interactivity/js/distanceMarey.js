// SHOULD I FLIP AXIS SO YEARS GO TOP TO BOTTOM AND CITIES LEFT TO RIGHT, TO REPLICATE EAST TO WEST??

function mareyDistance(lat1,lon1,lat2,lon2) {
  // return(distance(lat1,lon1,lat2,lon2));
  return(Math.abs(lon1-lon2));
}

let data = d3.json(filePath + "locationsGeo.json").then(
  function(data) {
    let firstCoords = data.coordinates[0];
    let locations = [];
    let distances = [];
    for (let l=0;l<Object.keys(data.coordinates).length;l++) {
      locations.push({
        "coordinates":data.coordinates[l]
        ,"location":data.location[l]
        ,"distance":mareyDistance(firstCoords[0],firstCoords[1],data.coordinates[l][0],data.coordinates[l][1])
      });
      distances.push(mareyDistance(firstCoords[0],firstCoords[1],data.coordinates[l][0],data.coordinates[l][1]));
    }
    // chart variables
    let width = window.innerWidth*0.5;
    let height = window.innerHeight*0.8;
    let margin = {top: height*0.05, right: width*0.06, bottom: height*0.05, left: width*0.06};


    let objects = d3.json(filePath + "metObjectsVanGogh.json").then(function(objects) {
      let files = [];
      let promises = [];
      for (let o=0;o<Object.keys(objects.image).length;o++) {
        let JSONPath = filePath + "jsonLINE2" + objects.image[o].split(".")[0] + ".json";
        files.push(JSONPath);
      }

      // d3 loads json's as promises, so I need to execute all promises at once, THEN load small multiples for each file
      files.forEach(function(url) {
        promises.push(d3.json(url))
      });
      Promise.all(promises).then(function(values) {

        let minYear = new Date().getFullYear();
        let maxYear = 0;
        values.forEach(function(p) {
          if (p.objects[0].line.year < minYear) {
            minYear = p.objects[0].line.year;
          }
          if (p.objects[p.objects.length-1].line.year > maxYear) {
            maxYear = p.objects[p.objects.length-1].line.year
          }
        })

        let allGraphData = []
        allGraphData.push(values);
        let graphData = allGraphData[0];


        let years = []
        graphData.forEach(function(gd) {
          gd.objects.forEach(function(d) {
            if($.inArray(d.line.year, years) === -1) {
              years.push(d.line.year);
            }
          });
        });


        // Let's add our Marey axes for every location and year in our data

        // set up x scale
        let x = d3.scaleLinear()
                  .domain([d3.min(years),maxYear])
                  .range([margin.left,width-margin.right]);

        // set up y scale
        let y = d3.scaleLinear()
                  .domain([0,d3.max(distances)])
                  .range([margin.top,height-margin.bottom]); // reverse scale, so we go east to west


        // append svg
        let svg =  d3.select("#marey-chart")
                     .append("svg")
                     .attr("width", width)
                     .attr("height", height)
                     .attr("class", "marey")
                     .attr("id", "marey-svg")



        svg.append("rect")
           .attr("width",width)
           .attr("height",height)
           .attr("x",0)
           .attr("y",0)
           .attr("class","marey-background")
           .attr("style","fill:#F0F0F0")

        drawCityAxes(svg);

        // let xAxis1 = svg.append("g")
        //                 .call(d3.axisBottom(x))
        //                 .attr("transform",`translate(0,${height-margin.bottom})`)
        //                 .attr("fill","white")
        //                 .select('.domain').remove()

        let mareyYear = 1985;
        drawAllMareys(mareyYear);

        let yearSlider = d3.select("#year-slider").on("input",function() {
          mareyYear = this.value;
          removeAllMareys();
          drawAllMareys(mareyYear);
        });

        let playYears = d3.select("#play").on("click",function() {
          let yearSlider = d3.select("#year-slider");
          yearSlider.transition()
                    .attr("value",2000)

          // console.log()
          for (let year=yearSlider.property("value");year<=yearSlider.property("max");year++) {
            console.log(year);
          }
          // console.log(yearSlider.property("max"));
        })

        function drawCityAxes(svg) {

          // AXIS LINES
          svg.selectAll(".marey-axis")
             .data(locations)
             .enter()
             .append("line")
                .attr("y1",function(d) {return y(d.distance);})
                .attr("x1",margin.left*0.6)
                .attr("y2",function(d) {return y(d.distance);})
                .attr("x2",width-(margin.right*0.3))
                .attr("id",function(d) {return "marey-axis-"+d.location;})
                .attr("class","marey-axis")

          // CONTINENT LABELS
          svg.append("text")
             .attr("x",margin.left*0.5)
             .attr("y",140)
             .attr("class","continent-label")
             // .attr("writing-mode","tb-lr")
             .attr("transform","rotate(270,"+margin.left*0.5+",140)")
             .text("North America")

          svg.append("text")
             .attr("x",margin.left*0.5)
             .attr("y",400)
             .attr("class","continent-label")
             // .attr("writing-mode","tb-lr")
             .attr("transform","rotate(270,"+margin.left*0.5+",400)")
             .text("Europe")

          svg.append("text")
             .attr("x",margin.left*0.5)
             .attr("y",730)
             .attr("class","continent-label")
             // .attr("writing-mode","tb-lr")
             .attr("transform","rotate(270,"+margin.left*0.5+",730)")
             .text("Asia & Oceania")

          // // LOCATION LABELS THAT WILL BE ANIMATED
          // svg.selectAll(".marey-axis-label")
          //    .data(locations)
          //    .enter()
          //    .append("text")
          //       .attr("x",margin.left)
          //       .attr("y",function(d) {return y(d.distance)})
          //       .attr("id",function(d) {return "marey-axis-label-"+d.location;})
          //       .attr("class","marey-axis-label")
          //       .attr("fill","rgb(175,175,175)")
          //       .text(function(d) {return d.location})
          //
          // // POINTS ON MAP THAT WILL BE ANIMATED
          // d3.select("#map").select("svg")
          //                  .selectAll(".marey-axis-map")
          //                  .data(locations)
          //                  .enter()
          //                  .append("circle")
          //                    .attr("cx",function(d) {
          //                      let markerPoint = map.latLngToLayerPoint(L.latLng(d.coordinates));
          //                      return markerPoint.x;
          //                    })
          //                    .attr("cy",function(d) {
          //                      let markerPoint = map.latLngToLayerPoint(L.latLng(d.coordinates));
          //                      return markerPoint.y;
          //                    })
          //                    .attr("fill","rgb(150,150,150)")
          //                    .attr("r",10)
          //                    .attr("class","marey-axis-map")
          //                    .attr("id",function(d) {return "marey-axis-map-"+d.location})
        }

        function removeAllMareys() {
          svg.selectAll(".marey-line").remove();
          svg.selectAll(".provenance-path").remove();
          svg.selectAll(".exhibition-circle").remove();
        }

        function drawAllMareys(mareyYear) {
          graphData.forEach(function(gd) {

            let img = document.createElement('img');
            imageThumbnail = filePath + "Thumbnails/" + gd.imageName
            img.src = imageThumbnail;
            vibrantColor = Vibrant.from(img).getPalette(function(err,palette) {
              let vibrantColor      = "rgb("+Math.floor(palette['Vibrant']['r'])+","+Math.floor(palette['Vibrant']['g'])+","+Math.floor(palette['Vibrant']['b'])+")";
              let vibrantDarkColor  = "rgb("+Math.floor(palette['DarkVibrant']['r'])+","+Math.floor(palette['DarkVibrant']['g'])+","+Math.floor(palette['DarkVibrant']['b'])+")";

              let firstYear = gd.objects[0].line.year;
              let firstCoordinates = gd.objects[0].line.coordinates[0];

              let maxYearDistances = [];
              let exhibitionDistances = [];

              init();

              function init() {
                findYearDistances();
                let provenanceDistances = findProvenanceDistances();
                graphMarey(maxYearDistances,provenanceDistances);
                graphExhibitions(exhibitionDistances);
              }

              function findYearDistances() {
                // for each year, find the point that was furthest from the starting point
                let years = [];
                gd.objects.forEach(function(d) {
                  // if($.inArray(d.line.year, years) === -1 && d.line.dataType === 'provenance') { // add data type if statement here
                  if($.inArray(d.line.year, years) === -1 && d.line.year <= mareyYear) { // add data type if statement here
                    years.push(d.line.year);
                  }
                });


                years.forEach(function(y) {
                  let yearDistance = 0;
                  let yearCity = '';
                  gd.objects.forEach(function(d) {
                    // if (d.line.year === y && d.line.dataType === 'provenance') { // add data type if statement here
                    if (d.line.year === y) { // add data type if statement here
                      // add exhibition dots to list
                      if (d.line.dataType === 'exhibition') {
                        let c=d.line.coordinates[1];
                        exhibitionDistances.push({
                           "year":y
                          ,"distance":mareyDistance(firstCoords[0],firstCoords[1],c[0],c[1])
                          ,"location":d.line.cities[1]
                          ,"exhibiton":d.line.owner[1]
                          ,"objectNumber":gd.objectNumber
                        })
                      }
                      // all locations, exhibs and prov
                      maxYearDistances.push({
                         "year":y
                        ,"distance":mareyDistance(firstCoords[0],firstCoords[1],d.line.coordinates[1][0],d.line.coordinates[1][1])
                        ,"location":d.line.cities[1]
                        ,"owner":d.line.owner[1]
                        ,"objectNumber":gd.objectNumber
                      })
                    }
                  })
                })
              }

              function findProvenanceDistances() {
                // pull list of each unique owner and range of dates
                let provenanceDates = [];
                gd.objects.forEach(function(d) {
                  if (d.line.dataType === 'provenance' && d.line.year <= mareyYear) {
                    provenanceDates.push({
                       "year" : d.line.year
                      ,"owner" : d.line.owner[1]
                      ,"coordinates" : d.line.coordinates[1]
                    })
                  }
                });

                for (let pd=0;pd<provenanceDates.length;pd++) {
                  if (pd < provenanceDates.length-1) {
                    provenanceDates[pd].endYear = provenanceDates[pd+1].year;
                  } else {
                    provenanceDates[pd].endYear = maxYear;
                  }
                }

                return provenanceDates;
                // find all provenance and exhibition events between these years
                // provenanceDates.forEach(function(pd) {
                //   ownerDistances = [];
                //   gd.objects.forEach(function(d) {
                //     if (d.line.year < pd.endYear && d.line.year >= pd.year) {
                //       // console.log(d.line);
                //       ownerDistances.push({
                //         "year": d.line.year
                //         ,"coordinates": d.line.coordinates[1]
                //         ,"distance": mareyDistance(firstCoords[0],firstCoords[1],d.line.coordinates[1][0],d.line.coordinates[1][1])
                //       })
                //     }
                //   });
                //   provenanceDistances.push({
                //     "owner":pd.owner
                //     ,"path":ownerDistances
                //   })
                // });
              }

              function graphMarey(maxYearDistances,provenanceDistances) {
                let graphDataAllYears = [];
                for (let y=firstYear;y<=mareyYear;y++) {

                  let graphDataPrevYears = [];
                  let graphDataThisYear = [];

                  maxYearDistances.forEach(function(myd) {
                    if (myd.year === y && myd.year <= mareyYear) {
                      graphDataThisYear.push(myd);
                    } else if (myd.year < y && myd.year <= mareyYear) {
                      graphDataPrevYears.push(myd);
                    }
                  })

                  if (graphDataThisYear.length>0) {
                    for (let ty=0;ty<graphDataThisYear.length;ty++) {
                      graphDataAllYears.push({
                         "year"     : y
                        ,"distance" : graphDataThisYear[ty].distance
                        ,"location" : graphDataThisYear[ty].location
                        ,"owner"    : graphDataThisYear[ty].owner
                      })
                    }
                  } else {
                    graphDataAllYears.push({
                      "year"     : y
                     ,"distance" : graphDataPrevYears[graphDataPrevYears.length-1].distance
                     ,"location" : graphDataPrevYears[graphDataPrevYears.length-1].location
                     ,"owner"    : graphDataPrevYears[graphDataPrevYears.length-1].owner
                    })
                  }
                }

                // curves - http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
                let line = d3.line()
                             .x(function(d) {return x(d.year); })
                             .y(function(d) {return y(d.distance); })
                             .curve(d3.curveMonotoneX);
                             // .curve(d3.curveLinear);

                 // Create line
                 svg.append("path")
                    .datum(graphDataAllYears)
                    .attr("d",line)
                    .attr("stroke",vibrantDarkColor)
                    .attr("class","marey-line")
                    .attr("id",'marey_line_' + gd.objectNumber)
                    .style("opacity",function(d) {
                      if (gd.objectNumber == paintingSelection) {
                        return "1"
                      } else {
                        return "0"
                      }
                    })

                graphProvenance();

                function graphProvenance() {
                  provenanceDistances.forEach(function(pd) {
                    let provGraphDataAllYears = [];
                    // console.log(pd);
                    for (let gday=0;gday<graphDataAllYears.length;gday++) {
                      if (graphDataAllYears[gday].year >= pd.year && graphDataAllYears[gday].year <= pd.endYear) {
                        provGraphDataAllYears.push(graphDataAllYears[gday]);
                      }
                    }
                    provGraphDataAllYear = provGraphDataAllYears.splice(-1,1);
                    svg.append("path")
                       .datum(provGraphDataAllYears)
                       .attr("d",line)
                       .attr("stroke",vibrantDarkColor)
                       .attr("class","provenance-path provenance_path_"+gd.objectNumber)
                       .style("opacity",function(d) {
                         if (gd.objectNumber == paintingSelection) {
                           return "1"
                         } else {
                           return "0"
                         }
                       })
                  });
                }
              }

              function graphExhibitions(exhibitionDistances) {

                svg.selectAll(".exhibition_circle")
                   .data(exhibitionDistances)
                   .enter()
                   .append("circle")
                      .attr("cx",function(d) {return x(d.year);})
                      .attr("cy",function(d) {return y(d.distance);})
                      .attr("r",6)
                      .attr("stroke",vibrantColor)
                      .attr("stroke-width",2)
                      .attr("class",function(d) {return "exhibition-circle exhibition_circle_" + d.objectNumber})
                      .style("opacity",function(d) {
                        if (d.objectNumber == paintingSelection) {
                          return "1"
                        } else {
                          return "0"
                        }
                      })
              }
            });
          });
        }
      });
    });


  }
)
