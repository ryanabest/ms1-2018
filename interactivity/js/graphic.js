window.createGraphic = function(graphicSelector) {
  let graphicEl = d3.select(".graphic");
  let graphicVisEl = graphicEl.select(".scroll__graphic");
  let graphicProseEl = graphicEl.select(".scroll__text");

  let width = window.innerWidth;
  let height = window.innerHeight;
  let circleRadius = 80;
  let menuRadius = height/36;

  let steps = [
    function step0() {


      console.log("step0");
      bigTitle();
      animateCircles();
      hideMap();
      hideMarey();
      hideSlider();

    },
    function step1() {

      console.log("step1");
      stickyTitle();
      menuCircles();
      hideMap();
      hideMarey();
      hideSlider();

    },
    function step2() {

      console.log("step2");
      stickyTitle();
      menuCircles();
      showMap();
      hideMarey();
      showSlider();

    },

    function step3() {

      console.log("step3");
      stickyTitle();
      menuCircles();
      showMap();
      hideMarey();
      showSlider();

    },

    function step4() {
      console.log("step4");
      stickyTitle();
      menuCircles();
      showMarey();
    }
  ]

  function stickyTitle() {
    d3.select(".scroll__graphic")
      .select("svg")
      .selectAll(".title-text")
      .transition()
           .ease(d3.easeQuadInOut)
           .duration(500)
           .style("opacity",0)

     d3.select("#sticky-title")
       .transition()
            .ease(d3.easeQuadInOut)
            .duration(500)
            .style("opacity",1)

  }

  function bigTitle() {
    d3.select(".scroll__graphic")
      .select("svg")
      .selectAll(".title-text")
      .transition()
           .ease(d3.easeQuadInOut)
           .duration(500)
           .style("opacity",1)


     d3.select("#sticky-title")
       .transition()
            .ease(d3.easeQuadInOut)
            .duration(500)
            .style("opacity",0)
  }

  function animateCircles() {
    // resize svg to full screen
    d3.select("#svg-chart")
      .transition()
      .ease(d3.easeQuadInOut)
        .duration(2500)
        .attr("width",width)
        .style("left","0%")

    d3.selectAll(".title-text")
      .transition()
        .ease(d3.easeQuadInOut)
        .duration(3500)
        .style("opacity",1)


    // resize circles and chain transitions to move them around the screen
    d3.selectAll(".circle")
      .transition()
      .ease(d3.easeQuadInOut)
        .duration(2000)
        .attr("r",circleRadius)
        .attr("fill",function(d) {return "url(#pattern-"+d+")"})
        .attr("cx",circleRadius)
        .on("end",function() {
          d3.selectAll(".circle")
            .transition()
            .ease(d3.easeQuadInOut)
              .duration(5000)
              // .delay(function(d,i) {return 100+i})
              .on("start",function repeat() {
                d3.active(this)
                    .attr("cx",function(d) {return getRandomInt(width-(2*circleRadius),circleRadius)})
                    .attr("cy",function(d) {return getRandomInt(height-(2*circleRadius),circleRadius)})
                  .transition()
                  .ease(d3.easeQuadInOut)
                    .on("start",repeat);
            });}
          );
  }

  function menuCircles() {
    // resize svg to be on the right hand side only
    d3.select("#svg-chart")
      .transition()
      .ease(d3.easeQuadInOut)
        .duration(2500)
        .attr("width",width*0.05)
        .style("display","relative")
        .style("left","95%")

    // make circles smaller then re-do pattern
    d3.selectAll(".circle")
      .transition()
        .ease(d3.easeQuadInOut)
          .duration(2500)
          .attr("r",menuRadius)
          .attr("cx",menuRadius)
          .attr("cy",function(d,i) {return (i+0.5)*(2*menuRadius);})
        .style("cursor","pointer")
     .transition()
       .duration(2500)
       .ease(d3.easeQuadInOut)
       .attr("fill",function(d) {return "url(#menu-pattern-"+d+")"})

    // make text transparent
    d3.selectAll(".title-text")
      .transition()
        .ease(d3.easeQuadInOut)
        .duration(1500)
        .style("opacity",0)
  }

  function showMap() {
    let map = d3.select("#map");
    map.transition()
       .ease(d3.easeQuadInOut)
        .duration(1000)
        .style("top","4vh");
  }

  function hideMap() {
    let map = d3.select("#map");
    map.transition()
       .ease(d3.easeQuadInOut)
        .duration(1000)
        .style("top","105vh")
  }

  function showMarey() {
    let div = d3.select("#marey")
    div.transition()
         .ease(d3.easeQuadInOut)
            .duration(1000)
            .style("top","4vh");

  }

  function hideMarey() {
    let div = d3.select("#marey")
    div.transition()
         .ease(d3.easeQuadInOut)
            .duration(1000)
            .style("top","105vh");
  }

  function showSlider() {
    let slider = d3.select("#slidecontainer")
    slider.transition()
          .ease(d3.easeQuadInOut)
            .duration(1000)
            .style("top","84vh")
  }

  function hideSlider() {
    let slider = d3.select("#slidecontainer")
    // slider.style("opacity",0)
    slider.transition()
          .ease(d3.easeQuadInOut)
            .duration(1000)
            .style("top","105vh")
  }

  function bigMarey() {

  }

  // update chart by passing in variable that calls a specific function position
  function update(step) {
    steps[step].call()
  }

  function setupChart() {
    vanGoghd3();
  }

  function init() {
    setupChart();
  }

  init();

  return {
		update: update,
	}
}
