class BarChart {

	constructor(_config, _data, _colorid) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 500,
      margin: { top: 50, bottom: 15, right: 70, left: 120 }
    }

    this.data = _data;
    this.colorid = _colorid;

    // Call a class function
    this.initVis();
  }

  initVis() {
  	let vis = this;
  	vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
  	vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

  	vis.svg = d3.select(vis.config.parentElement)
  		.attr('width', vis.config.containerWidth)
  		.attr('height', vis.config.containerHeight);

  	vis.chart = vis.svg.append('g')
  		.attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.xScale = d3.scaleLinear()
      //.domain([0, 200000])
      .range([0, vis.width]);

    vis.xAxisG = d3.axisTop(vis.xScale);

    vis.chart.append('g')
      .attr("transform", `translate(0,0)`)
      .attr("class", "xAxis")

    vis.yScale = d3.scaleBand()
      .domain(["", "1", "2", "3", "12", "13", "23", "123"])
      .range([0, vis.height])
      .padding(0.1);

    vis.yAxisG = d3.axisLeft(vis.yScale)
      .tickFormat("");

    vis.chart.append('g')
      .attr("class", "yAxis");

    vis.chart.selectAll(".yAxis").call(vis.yAxisG);



  	// vis.xScale = d3.scaleBand()
  	// 	.range([0, vis.width])
  	// 	.padding(0.1);

  	// vis.xAxisG = d3.axisBottom(vis.xScale);
    //   //.tickValues(vis.xScale.domain().filter(function(d,i){ return !(i%5)}));

  	// vis.chart.append('g')
  	// 	.attr("transform", `translate(0, ${vis.height})`)
  	// 	.attr("class", "xAxis")


   	// vis.yScale = d3.scaleLinear()
   	// 	.range([vis.height,0]);
   	// 	//.domain([0, ]);

   	// vis.yAxisG = d3.axisLeft(vis.yScale);

   	// vis.chart.append('g')
   	// 	.attr("class", "yAxis");




    vis.svg.append("text")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .style("font-size", "16px")
      .attr("x", vis.width/2 + vis.config.margin.left)
      .attr("y", 20)
      .text("Number of Assets Impacted");

    vis.svg.append("circle")
      .attr('cx', 42)
      .attr('cy', vis.config.margin.top + 29)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

    vis.svg.append("circle")
      .attr('cx', 42 + 30)
      .attr('cy', vis.config.margin.top + 29)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

      vis.svg.append("circle")
      .attr('cx', 42 + 30 + 30)
      .attr('cy', vis.config.margin.top + 29)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

    vis.svg.append("circle")
      .attr('cx', 42)
      .attr('cy', vis.config.margin.top + 83)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'blue');

    vis.svg.append("circle")
      .attr('cx', 42 + 30)
      .attr('cy', vis.config.margin.top + 83)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

      vis.svg.append("circle")
      .attr('cx', 42 + 30 + 30)
      .attr('cy', vis.config.margin.top + 83)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

    vis.svg.append("circle")
      .attr('cx', 42)
      .attr('cy', vis.config.margin.top + 137)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

    vis.svg.append("circle")
      .attr('cx', 42 + 30)
      .attr('cy', vis.config.margin.top + 137)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'red');

      vis.svg.append("circle")
      .attr('cx', 42 + 30 + 30)
      .attr('cy', vis.config.margin.top + 137)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

     vis.svg.append("circle")
      .attr('cx', 42)
      .attr('cy', vis.config.margin.top + 191)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

    vis.svg.append("circle")
      .attr('cx', 42 + 30)
      .attr('cy', vis.config.margin.top + 191)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

      vis.svg.append("circle")
      .attr('cx', 42 + 30 + 30)
      .attr('cy', vis.config.margin.top + 191)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'yellow');

    vis.svg.append("circle")
      .attr('cx', 42)
      .attr('cy', vis.config.margin.top + 245)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'blue');

    vis.svg.append("circle")
      .attr('cx', 42 + 30)
      .attr('cy', vis.config.margin.top + 245)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'red');

      vis.svg.append("circle")
      .attr('cx', 42 + 30 + 30)
      .attr('cy', vis.config.margin.top + 245)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

    vis.svg.append("circle")
      .attr('cx', 42)
      .attr('cy', vis.config.margin.top + 299)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'blue');

    vis.svg.append("circle")
      .attr('cx', 42 + 30)
      .attr('cy', vis.config.margin.top + 299)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

    vis.svg.append("circle")
      .attr('cx', 42 + 30 + 30)
      .attr('cy', vis.config.margin.top + 299)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'yellow');

    vis.svg.append("circle")
      .attr('cx', 42)
      .attr('cy', vis.config.margin.top + 353)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'none');

    vis.svg.append("circle")
      .attr('cx', 42 + 30)
      .attr('cy', vis.config.margin.top + 353)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'red');

      vis.svg.append("circle")
      .attr('cx', 42 + 30 + 30)
      .attr('cy', vis.config.margin.top + 353)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'yellow');

    vis.svg.append("circle")
      .attr('cx', 42)
      .attr('cy', vis.config.margin.top + 407)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'blue');

    vis.svg.append("circle")
      .attr('cx', 42 + 30)
      .attr('cy', vis.config.margin.top + 407)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'red');

      vis.svg.append("circle")
      .attr('cx', 42 + 30 + 30)
      .attr('cy', vis.config.margin.top + 407)
      .attr('r', 10)
      .attr('stroke', 'black')
      .attr('fill', 'yellow');


    console.log(vis.yAxisG.ticks());

    vis.yTicks = vis.svg.selectAll(".tick")

    console.log(vis.yTicks);

    vis.svg.append("text")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("transform", "rotate(-90)")
      .style("font-size", "16px")
      .attr("y", 20)
      .attr("x", -vis.height/2 - vis.config.margin.top)
      .text("Services Lost");


    vis.svg.append("text")
      .attr("text-anchor", "end")
      .attr("font-weight", "bold")
      .attr("transform", "rotate(45)")
      .style("font-size", "12px")
      .attr("y", 5)
      .attr("x", 60)
      .text("Water");

    vis.svg.append("text")
      .attr("text-anchor", "end")
      .attr("font-weight", "bold")
      .attr("transform", "rotate(45)")
      .style("font-size", "12px")
      .attr("y", -15)
      .attr("x", 85)
      .text("Hospital");

    vis.svg.append("text")
      .attr("text-anchor", "end")
      .attr("font-weight", "bold")
      .attr("transform", "rotate(45)")
      .style("font-size", "12px")
      .attr("y", -35)
      .attr("x", 105)
      .text("Electric");    
   	
   	vis.updateVis();
  }

  updateVis() {
  	let vis = this;

    vis.groupedData = d3.rollup(vis.data, (D) => D.length, (d) => d.ServicesLost);
    
    vis.xScale.domain([0, 10000 * Math.ceil(d3.max(vis.groupedData.values()) / 10000)])
  	//vis.xScale.domain(vis.data.map(d=>d.year));

    console.log(10000 * Math.ceil(d3.max(vis.groupedData.values()) / 10000));
    if (d3.max(vis.groupedData.values()) > 20000) {
      vis.xAxisG.tickValues([0, 20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000]);
    }
    else {
      vis.xAxisG.tickValues([2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000, 20000]);
    }

  	

    console.log(vis.groupedData);

    vis.chart.selectAll(".xAxis").transition().duration(1000).call(vis.xAxisG);


    //console.log(d3.max(vis.data.map(o => o.count)));

    //vis.yScale.domain([0, d3.max(vis.data.map(o => o.count))]);

  	vis.rects = vis.chart.selectAll(".bar")
  		.data(vis.groupedData.keys())
  		.join("rect")
  			.attr("class", "bar")
  			.attr("x", vis.xScale(0))
  			.attr("y", d=>vis.yScale(d))
  			.attr("width", d=> vis.xScale(vis.groupedData.get(d)))
  			.attr("height", vis.yScale.bandwidth())
  			.attr("fill", "#80b1d3")
    
    vis.labels = vis.chart.selectAll(".text")
      .data(vis.groupedData.keys())
      .join("text")
        .attr("class", "text")
        .text(function(d) {
          return("\u00A0" + vis.groupedData.get(d).toString() + " assets");
        })
        .attr("y", function(d) {
          return(vis.yScale(d) + vis.yScale.bandwidth() / 2);
        })
        .attr("x", function(d) {
          return(vis.xScale(vis.groupedData.get(d)));
        })
        .style("text-anchor", "start")
        .style("font-size", 12);

  		// .on('mouseover', (event,d) => {
      //   console.log(d);
  		// 	d3.select('#tooltip')
      //       .style('display', 'block')
      //       .style('left', (event.pageX + 10) + 'px')   
      //       .style('top', (event.pageY + 10) + 'px')
      //       .html(`<div class="tooltip"><strong>${d.year}</strong> - ${d.count} samples</div>`);
      //   })
      //   .on('mouseleave', () => {
      //     d3.select('#tooltip').style('display', 'none');
      //   });	


  }

  changeData() {
    let vis = this;

 

    var checkBox = document.getElementById("barchartAll");
      //var text = document.getElementById("text");

      if (checkBox.checked == true){
        vis.data = allAssets;
        vis.updateVis();
      } else {
        affectedAssets = affectedAssets.filter(d => !floodRootID.includes(d));
        vis.data = allAssets.filter(d => affectedAssets.includes(d.Index));
        vis.updateVis();
      }
  }
  

}