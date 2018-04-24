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
      hideIntroText();
      hideMap();
      hideMarey();
      hideSlider();
      allOpaque();

    },
    function step1() {

      console.log("step1");

      stickyTitle();
      menuCircles();
      hideIntroText();
      hideMap();
      showMarey();
      showSlider();
      opacityAnimation();

    }
  ]

  function stickyTitle() {
     d3.select("#sticky-title")
       .transition()
            .ease(d3.easeQuadInOut)
            .duration(500)
            .style("opacity",1)

      d3.select("#project-title")
        .transition()
          .ease(d3.easeQuadInOut)
          .duration(1500)
          .style("position","relative")
          .style("top","-105vh")
  }

  function bigTitle() {
     d3.select("#sticky-title")
       .transition()
            .ease(d3.easeQuadInOut)
            .duration(500)
            .style("opacity",0)

      d3.select("#project-title")
        .transition()
          .ease(d3.easeQuadInOut)
          .duration(1500)
          .style("position","relative")
          // .style("margin-top","0%")
          .style("top","0vh")
  }

  function animateCircles() {
    // resize circles and chain transitions to move them around the screen
    d3.selectAll(".circle")
      .transition()
      .ease(d3.easeQuadInOut)
        .duration(500)
        .attr("height",circleRadius*2)
        .on("end",function() {
          d3.selectAll(".circle")
            .transition()
            // .ease(d3.easeQuadInOut)
              .duration(5000)
              .delay(0)
              .on("start",function repeat() {
                d3.active(this)
                    .style("left",function(d) {return getRandomInt(width-(3*circleRadius),circleRadius) + "px"})
                    .style("top",function(d) {return getRandomInt(height-(3*circleRadius),circleRadius)+ "px"})
                  .transition()
                  .ease(d3.easeQuadInOut)
                    .on("start",repeat);
              });
            }
          );
  }

  function menuCircles() {
    // smaller circles on right hand side
    d3.selectAll(".circle")
      .transition()
        .ease(d3.easeQuadInOut)
          .duration(1500)
          .attr("height",menuRadius*2)
          .style("left",width-(menuRadius*2.5)+"px")
          .style("top",function(d,i) {return (i)*(2*menuRadius)+"px";})
          .style("cursor","pointer")
  }

  function showIntroText() {
    let intro = d3.select("#intro-text");
    intro.transition()
         .ease(d3.easeQuadInOut)
          .duration(1500)
          .style("top","6vh");
  }

  function hideIntroText() {
    let intro = d3.select("#intro-text");
    intro.transition()
         .ease(d3.easeQuadInOut)
          .duration(1500)
          .style("top","105vh");
  }

  function showMap() {
    let map = d3.select("#map");
    map.transition()
       .ease(d3.easeQuadInOut)
        .duration(1500)
        .style("top","6vh");
  }

  function hideMap() {
    let map = d3.select("#map");
    map.transition()
       .ease(d3.easeQuadInOut)
        .duration(1500)
        .style("top","105vh")
  }

  function showMarey() {
    let div = d3.select("#marey")
    div.transition()
         .ease(d3.easeQuadInOut)
            .duration(1500)
            .style("top","6vh");

  }

  function hideMarey() {
    let div = d3.select("#marey")
    div.transition()
         .ease(d3.easeQuadInOut)
            .duration(1500)
            .style("top","105vh");
  }

  function showSlider() {
    let slider = d3.select("#slidecontainer")
    slider.transition()
          .ease(d3.easeQuadInOut)
            .duration(1500)
            .style("top","84vh")
  }

  function hideSlider() {
    let slider = d3.select("#slidecontainer")
    // slider.style("opacity",0)
    slider.transition()
          .ease(d3.easeQuadInOut)
            .duration(1500)
            .style("top","105vh")
  }

  function allOpaque() {
    d3.select("#vanGoghd3-svg")
      .selectAll(".circle")
      .attr("class","circle");
  }

  function opacityAnimation() {
    d3.select("#vanGoghd3-svg")
      .selectAll(".circle")
      .attr("class",function(d) {
        if (d.objectNumber == paintingSelection) {
          return "circle is-highlighted"
        } else {
          return "circle is-not-highlighted"
        }
        // console.log(d.objectNumber)
      });
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
