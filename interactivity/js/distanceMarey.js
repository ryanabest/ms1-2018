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



        // show year axis on #slider-year-axis svg
        let yearSvg = d3.select("#slider-year-axis")
        // let yearWidth = width;
        let yearX = d3.scaleLinear()
                  .domain([d3.min(years),maxYear])
                  .range([width*0.06,width*0.94])
                  // .nice();

        let xAxis1 = yearSvg.append("g")
                        .call(
                          d3.axisBottom(yearX)
                            .tickFormat(d3.format("d"))
                            .tickValues([d3.min(years),1900,1920,1940,1960,1980,2000,d3.max(years)])
                          )
                        .attr("transform",`translate(0,0)`)
                        .select('.domain').remove()

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

        let mareyYear = 2017;
        drawAllMareys(mareyYear);
        drawYearHovers(mareyYear);


        let yearSlider = d3.select("#year-slider").on("input",function() {
          mareyYear = this.value;
          removeAllMareys();
          drawAllMareys(mareyYear);
        });

        function drawYearHovers(mareyYear) {
          let hoverYears = []
          for (let y=1885;y<=mareyYear;y++) {
            hoverYears.push(y);
          }

          let strokeWidth = x(2017)-x(2016);

          let g = svg.append("g")
          g.attr("id","hover-year-g")

          g.selectAll(".hover-year")
           .data(hoverYears)
           .enter()
           .append("line")
           .attr("y1",0)
           .attr("x1",function(d) {return x(d)})
           .attr("y2",height)
           .attr("x2",function(d) {return x(d)})
           .attr("id",function(d) {return "hover-year-"+d})
           .attr("class","hover-year")
           .style("stroke-width",strokeWidth)
           .on("mouseenter",function(d) {

             let owners = [];
             let ownerYears = [];
             let ownerLocations = [];
             let provPath = d3.selectAll(".provenance-path-active");
             let title = d3.select("#map").select("svg").select("#marker-"+provPath.node().id.split("_")[2]).data()[0].title;

             for (let pp=0;pp<provPath.data().length;pp++) {
               let thisProvPath = provPath.data()[pp]
               if (thisProvPath.length>0) {
                 if (d >= thisProvPath[0].year && (d) <= thisProvPath[thisProvPath.length-1].year) {
                   for (let tpp=0;tpp<thisProvPath.length;tpp++) {
                     if (thisProvPath[tpp].owner.indexOf("Exhibition - ") === -1 && $.inArray(thisProvPath[tpp].owner, owners) === -1) {
                       owners.push(thisProvPath[tpp].owner)
                       if (thisProvPath[tpp].owner !== "Metropolitan Museum of Art") { // The Met has it's own location, so no need to add twice
                         ownerLocations.push(thisProvPath[tpp].location)
                       } else {
                         ownerLocations.push('')
                       }
                     }
                   }
                 }
               }
             }

             let exhibitions = [];
             let exhibitionLocations = [];
             let exhibCircle = d3.selectAll(".exhibition-circle-active")
             for (let ec=0;ec<exhibCircle.data().length;ec++) {
               let thisExhibCircle = exhibCircle.data()[ec]
               if (thisExhibCircle.year === d) {
                 // console.log(thisExhibCircle)
                 exhibitionLocations.push(thisExhibCircle.location)
                 if (thisExhibCircle.exhibition.replace("Exhibition -  ","") === "The Metropolitan Museum of Art" && thisExhibCircle.location === "Metropolitan Museum of Art") { // The Met has it's own location, so no need to add twice
                   exhibitions.push('')
                 } else (
                   exhibitions.push(thisExhibCircle.exhibition.replace("Exhibition -  ",""))
                 )
               };
             }

             let yearHoverHtml = ''
             yearHoverHtml += '<h2>'+d+'</h2>'
             for (let o=0;o<owners.length;o++) {
               yearHoverHtml += "<h1>"+owners[o]+"&nbsp;<span id='owner-location'>"+ownerLocations[o]+"</span></h1>"
             }
             for (let e=0;e<exhibitions.length;e++) {
               yearHoverHtml += "<p>"+exhibitionLocations[e]+"&nbsp;<span id='exhibition-name'>"+exhibitions[e]+"</span></p>"
             }


             // d3.select("#year-hover-text")
             //   .text(yearHoverHtml);

             $("div#year-hover-text").html(yearHoverHtml);
             d3.select("#year-hover-text")
               .style("opacity",1)
               .style("width","auto")
               .style("max-width","30vw")
               .style("left",function() {
                 let left = ''
                 if (event.clientX/window.innerWidth >= 0.5) {
                   left = ((event.clientX/window.innerWidth)*100)-15 + "vw"

                 } else {
                   left = (event.clientX/window.innerWidth)*100 + "vw"
                 }
                 return left})
               .style("top",event.clientY+ 10 + "px")
               // .style("transform","translate("+event.clientX+","+event.clientY+")")
           })
           .on("mouseout",function(d) {
             d3.select("#year-hover-text")
               .style("opacity",0)
               .style("width","0vw")
           })

        }

        function drawCityAxes(svg) {
          let g = svg.append("g")
          g.attr("id","marey-axis-g")

          // AXIS LINES
          g.selectAll(".marey-axis")
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
          g.append("text")
             .attr("class","continent-label")
             .attr("text-anchor","start")
             .attr("transform","translate("+margin.left*0.55+","+y(locations[47].distance)+")rotate(270)")
             .text("North America")

          g.append("text")
             .attr("class","continent-label")
             .attr("text-anchor","start")
             .attr("transform","translate("+margin.left*0.55+","+y(locations[100].distance)+")rotate(270)")
             .text("Europe")

          g.append("text")
             .attr("class","continent-label")
             .attr("text-anchor","start")
             .attr("transform","translate("+margin.left*0.55+","+y(locations[107].distance)+")rotate(270)")
             .text("Asia & Oceania")

        }

        function removeAllMareys() {
          svg.selectAll(".marey-line").remove();
          svg.selectAll(".provenance-path").remove();
          svg.selectAll(".exhibition-circle").remove();

          svg.selectAll(".marey-line-active").remove();
          svg.selectAll(".provenance-path-active").remove();
          svg.selectAll(".exhibition-circle-active").remove();
        }

        function drawAllMareys(mareyYear) {
          let pathG  = svg.append("g").attr("id","marey-line-g")
          let provG  = svg.append("g").attr("id","provenance-path-g")
          let exhibG = svg.append("g").attr("id","exhibition-circle-g")
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
                let years = findYearDistances();
                let provenanceDistances = findProvenanceDistances();
                let graphDataAllYears = findGraphDataAllYears();
                // console.log(graphDataAllYears);
                graphMarey(graphDataAllYears,provenanceDistances);
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
                          ,"exhibition":d.line.owner[1]
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
                return maxYearDistances;
              }

              function findProvenanceDistances() {
                // pull list of each unique owner and range of dates
                let provenanceDates = [];
                gd.objects.forEach(function(d) {
                  if ((d.line.dataType === 'provenance' || d.line.dataType === 'returnProvenance') && d.line.year <= mareyYear) {
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

              function findGraphDataAllYears() {
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
                return graphDataAllYears;
              }

              function graphMarey(graphDataAllYears,provenanceDistances) {
                // let graphDataAllYears = [];
                // for (let y=firstYear;y<=mareyYear;y++) {
                //
                //   let graphDataPrevYears = [];
                //   let graphDataThisYear = [];
                //
                //   maxYearDistances.forEach(function(myd) {
                //     if (myd.year === y && myd.year <= mareyYear) {
                //       graphDataThisYear.push(myd);
                //     } else if (myd.year < y && myd.year <= mareyYear) {
                //       graphDataPrevYears.push(myd);
                //     }
                //   })
                //
                //   if (graphDataThisYear.length>0) {
                //     for (let ty=0;ty<graphDataThisYear.length;ty++) {
                //       graphDataAllYears.push({
                //          "year"     : y
                //         ,"distance" : graphDataThisYear[ty].distance
                //         ,"location" : graphDataThisYear[ty].location
                //         ,"owner"    : graphDataThisYear[ty].owner
                //       })
                //     }
                //   } else {
                //     graphDataAllYears.push({
                //       "year"     : y
                //      ,"distance" : graphDataPrevYears[graphDataPrevYears.length-1].distance
                //      ,"location" : graphDataPrevYears[graphDataPrevYears.length-1].location
                //      ,"owner"    : graphDataPrevYears[graphDataPrevYears.length-1].owner
                //     })
                //   }
                // }

                // curves - http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
                let line = d3.line()
                             .x(function(d) {return x(d.year); })
                             .y(function(d) {return y(d.distance); })
                             .curve(d3.curveMonotoneX);
                             // .curve(d3.curveLinear);

                 // Create line
                 pathG.append("path")
                      .datum(graphDataAllYears)
                      .attr("d",line)
                      .attr("stroke",vibrantDarkColor)
                      .attr("class",function(d) {
                        if (gd.objectNumber == paintingSelection) {
                          return "marey-line-active"
                        } else {
                          return "marey-line"
                        }
                      })
                      .attr("id",'marey_line_' + gd.objectNumber)

                graphProvenance();

                function graphProvenance() {
                  provenanceDistances.forEach(function(pd) {
                    let provGraphDataAllYears = [];
                    for (let gday=0;gday<graphDataAllYears.length;gday++) {
                      if ((graphDataAllYears[gday].year >= pd.year && graphDataAllYears[gday].year < pd.endYear && graphDataAllYears[gday].owner.indexOf("Exhibition") !== -1) || (graphDataAllYears[gday].year >= pd.year && graphDataAllYears[gday].year <= pd.endYear && graphDataAllYears[gday].owner === pd.owner)) {
                        provGraphDataAllYears.push(graphDataAllYears[gday]);
                      }
                    }
                    // provGraphDataAllYear = provGraphDataAllYears.splice(-1,2);
                    provG.append("path")
                         .datum(provGraphDataAllYears)
                         .attr("d",line)
                         .attr("stroke",vibrantDarkColor)
                         .attr("id","provenance_path_"+gd.objectNumber)
                         .attr("class",function(d) {
                           if (gd.objectNumber == paintingSelection) {
                             return "provenance-path-active"
                           } else {
                             return "provenance-path"
                           }
                         })
                  });
                }
              }

              function graphExhibitions(exhibitionDistances) {

                exhibG.selectAll(".exhibition_circle")
                      .data(exhibitionDistances)
                      .enter()
                      .append("circle")
                        .attr("cx",function(d) {return x(d.year);})
                        .attr("cy",function(d) {return y(d.distance);})
                        .attr("r",6)
                        .attr("stroke",vibrantColor)
                        .attr("stroke-width",2)
                        .attr("id",function(d) {return "exhibition_circle_" + d.objectNumber})
                        .attr("class",function(d) {
                          if (d.objectNumber == paintingSelection) {
                            return "exhibition-circle-active"
                          } else {
                            return "exhibition-circle"
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
