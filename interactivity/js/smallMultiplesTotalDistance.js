// source: https://www.geodatasource.com/developers/javascript
// calculates distance between two points as the crow flies

function distance(lat1, lon1, lat2, lon2, unit) {
	let radlat1 = Math.PI * lat1/180
	let radlat2 = Math.PI * lat2/180
	let theta = lon1-lon2
	let radtheta = Math.PI * theta/180
	let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}


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

    // get list of all years and distances across all paintings to use for populating scales
    // is there a way to do this in tandem with my exact same loop below?
    let years = []
    let distances = []
    let distanceOrder = []
    graphData.forEach(function(gd) {
      gd.objects.forEach(function(d) {
        years.push(d.line.year);
      });

      let thisFinalDistance = 0;
      for (let y=d3.min(years);y<new Date().getFullYear();y++) {
        let totalDistance = 0;
        gd.objects.forEach(function(d) {
          if (d.line.year <= y) {
            totalDistance += distance(d.line.coordinates[0][0],d.line.coordinates[0][1],d.line.coordinates[1][0],d.line.coordinates[1][1]) || 0
          }
        });
        distances.push(totalDistance);
        thisFinalDistance = totalDistance;
      }
      distanceOrder.push({
        'objectNumber': gd.objectNumber
        ,'finalDistance': thisFinalDistance
      })
    })

    distanceOrder = _.orderBy(distanceOrder,["finalDistance"],["desc"]);

    // chart variables
    let width  = window.innerWidth/8;
    let height = window.innerWidth/8;
    let marginScale = 0.05;
    let margin = {top: height*marginScale, right: width*marginScale, bottom: height*marginScale, left: width*marginScale};

    // set up x scale
    let x = d3.scaleLinear()
              .domain([d3.min(years),new Date().getFullYear()])
              .range([margin.left,width-margin.right]);

    // set up y scale
    let y = d3.scaleLinear()
              .domain([0,d3.max(distances)])
              .range([height-margin.bottom,margin.top]);

    graphData.forEach(function(gd) {
      let graphDataAllYears = [];
      for (let y=d3.min(years);y<new Date().getFullYear();y++) {
        let totalDistance = 0;
        let cities;
        // let
        gd.objects.forEach(function(d) {
          if (d.line.year <= y) {
            totalDistance += distance(d.line.coordinates[0][0],d.line.coordinates[0][1],d.line.coordinates[1][0],d.line.coordinates[1][1]) || 0
          }
          if (d.line.year === y) {
            cities = d.line.cities;
          }
        })
        graphDataAllYears.push({
          "year": y
         ,"distance": totalDistance
         ,"cities": cities
       });
      }

      // determine sort order
      let order = 0;
      for (let dO=0;dO<distanceOrder.length;dO++) {
        if (distanceOrder[dO].objectNumber === gd.objectNumber) {
          order = dO+1;
        }
      }

      // create svg element
      let div = d3.select("#distSmallMults")
                  .append("div")
                  .attr("class","distSmallMult_container")
                  .attr("id","distSmallMult_container"+gd.objectNumber)
                  .style("order",order)

      let svg = div.append("svg")
                   .attr("width", width)
                   .attr("height", height)
                   .attr("class", "distSmallMult")
                   .attr("id", gd.objectNumber + "_distSmallMult")

      // create axes
      let xAxis = svg.append("g")
                     .call(d3.axisBottom(x).ticks(0))
                     .attr("transform",`translate(0,${height-margin.bottom})`)
                     // .attr("fill","white")
                     .select('.domain')
                      .attr('stroke','rgba(0,0,0,0.2)');
      let yAxis = svg.append("g")
                     .call(d3.axisLeft(y).ticks(0))
                     .attr("transform",`translate(${margin.left},0)`)
                     // .attr("fill","white")
                     .select('.domain')
                      .attr('stroke','rgba(0,0,0,0.2)');

      // line function for path
      let line = d3.line()
                   .x(function(d) {return x(d.year); })
                   .y(function(d) {return y(d.distance); })
                   .curve(d3.curveCatmullRom);

     // Create line
     svg.append("path")
        .datum(graphDataAllYears)
        .attr("class","smallmult-line")
        // .attr("id",gd.objectNumber + '_path')
        .attr("d",line)
    })

    // ANY MANIPULATION OF THESE SMALL MULTIPLES I WANT TO DO, I HAVE TO DO HERE
    // THIS CODE EXECUTES AFTER ALL PROMISES (THAT LOAD DATA FROM EACH PAINTING'S JSON FILE) FINISH


  }); // Closes then after painting promises
}); // Closes then after van gogh objects promise
