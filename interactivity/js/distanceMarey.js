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
        "coordiantes":data.coordinates[l]
        ,"location":data.location[l]
        ,"distance":mareyDistance(firstCoords[0],firstCoords[1],data.coordinates[l][0],data.coordinates[l][1])
      });
      distances.push(mareyDistance(firstCoords[0],firstCoords[1],data.coordinates[l][0],data.coordinates[l][1]));
    }
    // chart variables
    let width = window.innerWidth;
    let height = window.innerHeight;
    let margin = {top: height*0.1, right: width*0.1, bottom: height*0.1, left: width*0.1};


    let objects = d3.json(filePath + "metObjectsVanGogh.json").then(function(objects) {
      let files = [];
      let promises = [];
      for (let o=0;o<Object.keys(objects.image).length;o++) {
        let JSONPath = filePath + "jsonLine2" + objects.image[o].split(".")[0] + ".json";
        files.push(JSONPath);
      }

      // d3 loads json's as promises, so I need to execute all promises at once, THEN load small multiples for each file
      files.forEach(function(url) {
        promises.push(d3.json(url))
      });
      Promise.all(promises).then(function(values) {
        let allGraphData = []
        allGraphData.push(values);
        let graphData = allGraphData[0];
        let testCoords = (graphData[0].objects[0].line.coordinates);
        let testDist = mareyDistance(firstCoords[0],firstCoords[1],testCoords[testCoords.length-1][0],testCoords[testCoords.length-1][1]);

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
                  .domain([d3.min(years),new Date().getFullYear()])
                  .range([margin.left,width-margin.right]);

        // set up y scale
        let y = d3.scaleLinear()
                  .domain([0,d3.max(distances)])
                  .range([margin.top,height-margin.bottom]); // reverse scale, so we go east to west



        graphData.forEach(function(gd) {

          // append svg
          let svg =  d3.select("body")
                       .append("svg")
                       .attr("width", width)
                       .attr("height", height)
                       .attr("class", "marey")
                       .attr("id", gd.objectNumber + "_marey")

          // draw line for each city
          locations.forEach(function(d) {
            // console.log(d);
            svg.append("line")
               .attr("y1",y(d.distance))
               .attr("x1",margin.left)
               .attr("y2",y(d.distance))
               .attr("x2",width-margin.right)
               .attr("class","marey-axis")
               .attr("id","marey-axis-"+d.location)
          })

          let firstYear = gd.objects[0].line.year;
          let firstCoordinates = gd.objects[0].line.coordinates[0];

          // for each year, find the point that was furthest from the starting point
          let years = [];
          gd.objects.forEach(function(d) {
            if($.inArray(d.line.year, years) === -1 && d.line.dataType === 'provenance') { // add data type if statement here
              years.push(d.line.year);
            }
          });

          let maxYearDistances = [];
          years.forEach(function(y) {
            let yearDistance = 0;
            let yearCity = '';
            gd.objects.forEach(function(d) {
              if (d.line.year === y && d.line.dataType === 'provenance') { // add data type if statement here
                // console.log(d.line.coordinates.length);
                for (let coord=1;coord<d.line.coordinates.length;coord++) { // skip first coordinate, which is ending coord for previous year
                  let c = d.line.coordinates[coord];
                  if (distance(firstCoordinates[0],firstCoordinates[1],c[0],c[1]) || 0 >= yearDistance) {
                    yearDistance = mareyDistance(firstCoords[0],firstCoords[1],c[0],c[1])
                  }
                }
              }
            })
            maxYearDistances.push({
              "year":y
              ,"distance":yearDistance
            })
          })

          // console.log(gd.objects[0].line.year);
          let graphDataAllYears = [];
          for (let y=firstYear;y<new Date().getFullYear();y++) {
            let graphDataAllYearsPreProcess = []
            // console.log(y);
            maxYearDistances.forEach(function(myd) {
              if (myd.year <= y) {
                graphDataAllYearsPreProcess.push(myd);
              }
            })

            graphDataThisYear = graphDataAllYearsPreProcess[graphDataAllYearsPreProcess.length-1];
            // console.log(graphDataThisYear);
            graphDataAllYears.push({
               "year":y
              ,"distance":graphDataThisYear.distance
            })
          }

          // curves - http://bl.ocks.org/d3indepth/b6d4845973089bc1012dec1674d3aff8
          let line = d3.line()
                       .x(function(d) {return x(d.year); })
                       .y(function(d) {return y(d.distance); })
                       .curve(d3.curveCatmullRom);

           // Create line
           svg.append("path")
              .datum(graphDataAllYears)
              .attr("class","marey-line")
              .attr("id",gd.objectNumber + '_path')
              .attr("d",line)
        });

      });
    });


  }
)
