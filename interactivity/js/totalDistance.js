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


let objects = d3.json("assets/metObjectsVanGogh.json").then(function(objects) {
  let files = [];
  let promises = [];
  for (let o=0;o<Object.keys(objects.image).length;o++) {
    let JSONPath = "assets/jsonLINE2" + objects.image[o].split(".")[0] + ".json";
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
    let years = []
    let distances = []
    graphData.forEach(function(gd) {
      // console.log(gd.objects.length);
      gd.objects.forEach(function(d) {
        years.push(d.line.year);
      });

      for (let y=d3.min(years);y<new Date().getFullYear();y++) {
        let totalDistance = 0;
        gd.objects.forEach(function(d) {
          // console.log(d);
          if (d.line.year <= y) {
            totalDistance += distance(d.line.coordinates[0][0],d.line.coordinates[0][1],d.line.coordinates[1][0],d.line.coordinates[1][1]) || 0
          }
        });
        distances.push(totalDistance);
      }
    })

    // chart variables
    let width = window.innerWidth*0.9;
    let height = window.innerHeight*0.9;
    let margin = {top: height*0.1, right: width*0.1, bottom: height*0.1, left: width*0.1};

    // set up x scale
    let x = d3.scaleLinear()
              .domain([d3.min(years),new Date().getFullYear()])
              .range([margin.left,width-margin.right])

    // set up y scale
    let y = d3.scaleLinear()
              .domain([0,d3.max(distances)])
              .range([height-margin.bottom,margin.top])

		// create svg element
    let svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "distSmallMult")

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

    graphData.forEach(function(gd) {
      let graphDataAllYears = [];
      // console.log(gd.objects.length);
      for (let y=d3.min(years);y<new Date().getFullYear();y++) {
        let totalDistance = 0;
        let cities;
        // let
        gd.objects.forEach(function(d) {
          // console.log(d);
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

      // line function for path
      let line = d3.line()
                   .x(function(d) {return x(d.year); })
                   .y(function(d) {return y(d.distance); });


     // Create line
     svg.append("path")
        .datum(graphDataAllYears)
        .attr("class","line")
        .attr("id",gd.objectNumber + '_path')
        .attr("d",line)
        .style("fill","none")
        .style("stroke","#000")
        .style("stroke-width",".2vh")
    })

    // ANY MANIPULATION OF THESE SMALL MULTIPLES I WANT TO DO, I HAVE TO DO HERE
    // THIS CODE EXECUTES AFTER ALL PROMISES (THAT LOAD DATA FROM EACH PAINTING'S JSON FILE) FINISH


  }); // Closes then after painting promises
}); // Closes then after van gogh objects promise
