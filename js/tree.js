class Tree {
	constructor(_config, _data) {
		this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 1000,
			containerHeight: _config.containerHeight || 1000,
			margin: {top: 10, bottom: 10, right: 10, left: 10}
		}

		this.data = _data;

		this.initVis();
	}

	initVis() {
		let vis = this;

		vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
   
		vis.dx = 14;

		vis.colorScaleType = d3.scaleOrdinal()
			.domain([0, 1, 2, 3])
			.range(['black', 'blue', 'red', 'yellow']);


		vis.svg = d3.select(vis.config.parentElement)
			.attr("width", vis.config.containerWidth)
		    .attr("height", vis.dx)
		    .attr("viewBox", [-vis.config.margin.left, -vis.config.margin.top, vis.config.containerWidth, vis.dx])
		    .attr("style", "max-width: 100%; height: auto; font: 14px sans-serif; user-select: none;");

		vis.gLink = vis.svg.append("g")
		    .attr("fill", "none")
		    .attr("stroke", "#555")
		    .attr("stroke-opacity", 0.4)
		    .attr("stroke-width", 1.5);

		vis.gNode = vis.svg.append("g")
		    .attr("cursor", "pointer")
		    .attr("pointer-events", "all");

		vis.getData(0)

	}

	getData(index) {
		let vis = this;

		vis.node = vis.gNode.selectAll("g").remove();

		vis.root = d3.hierarchy(vis.data[index]);
		vis.dy = vis.width / (1 + vis.root.height);

		vis.tree = d3.tree().nodeSize([vis.dx, vis.dy]);
		vis.diagonal = d3.linkHorizontal()
			.x(d => d.y)
			.y(d => d.x);

		vis.root.x0 = vis.dy / 2;
  		vis.root.y0 = 0;
  		vis.root.descendants().forEach((d, i) => {
			d.id = i;
		    d._children = d.children;
		    d.children = null;
		});

		vis.updateVis(null, vis.root);
	}

	updateVis(event, source) {
		let vis = this;

		vis.duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
    	vis.nodes = vis.root.descendants().reverse();
    	vis.links = vis.root.links();

    	// Compute the new tree layout.
    	vis.tree(vis.root);

    	vis.root.y = 100;

    	let left = vis.root;
    	let right = vis.root;
    	vis.root.eachBefore(node => {
      		if (node.x < left.x) left = node;
      		if (node.x > right.x) right = node;
    	});

    	vis.height = right.x - left.x + vis.config.margin.top + vis.config.margin.bottom;

    	vis.transition = vis.svg.transition()
        	.duration(vis.duration)
        	.attr("height", vis.height)
        	.attr("viewBox", [-vis.config.margin.left, left.x - vis.config.margin.top, vis.config.containerWidth, vis.height])
        	.tween("resize", window.ResizeObserver ? null : () => () => vis.svg.dispatch("toggle"));

        // Update the nodes…
    	vis.node = vis.gNode.selectAll("g")
      		.data(vis.nodes, d => d.id);

      	// Enter any new nodes at the parent's previous position.
	    vis.nodeEnter = vis.node.enter().append("g")
	        .attr("transform", d => `translate(${source.y0},${source.x0})`)
	        .attr("fill-opacity", 0)
	        .attr("stroke-opacity", 0)
	      
	    vis.nodeEnter.append("circle")
	        .attr("r", 5)
	        .attr("fill", d => vis.colorScaleType(d.data.ROOT))
	        .attr("fill-opacity", d => d._children ? 1 : 0.5)
	        .attr("stroke", "black")
	        .attr("stroke-width", 1)
	        .attr("class", function(d,i) {return ("tree_").concat(d.data.name);})
	        .on("mouseover", (event, d) => {
	        	//console.log(event);
	        	//console.log(d.data.name);
	        	//highlightRoot(d.data.name);
	        	d3.select(".tree_".concat(d.data.name)).attr('r', 7);
	        	d3.selectAll(".map_".concat(d.data.name)).attr('r', 12);

	        	console.log(d.data.ROOT);

	        	if (d.data.ROOT > 0) {

		        	//create a tool tip
	                d3.select('#tooltip')
	                    .style('display', 'block')
	                    .style('z-index', 1000000)
	                    // Format number with million and thousand separator
	                     .html(`<div class="tooltip-label"><l>Type: ${d.Description}</l><br>
	                                		<l> ID: ${d.UFOKN_ID}</l><br></div>`);
	                
	                console.log(d3.select(".map_".concat(d.data.name)));
	                console.log(d3.select(".map_".concat(d.data.name)));

	                d3.select('#tooltip')
	                    //.style('left', (event.pageX + 10) + 'px')   
	                    //.style('top', (event.pageY + 10) + 'px');
	                    .style('left', (Number(d3.select(".map_".concat(d.data.name)).attr("cx")) + 10) + 'px')   
	                    .style('top', (Number(d3.select(".map_".concat(d.data.name)).attr("cy")) + 10) + 'px');
	             }
	        })
	        .on("mouseleave", (event, d) => {
	        	d3.select(".tree_".concat(d.data.name)).attr('r', 5);
	        	d3.selectAll(".map_".concat(d.data.name)).attr('r', 10);
	        	d3.select('#tooltip').style('display', 'none');//turn off the tooltip
	        })
	        .on("click", (event, d) => {
	          if (d.children) {
	          	vis.closeNode(d.data.name);
	          }
	          else {
	          	vis.openNode(d.data.name);
	      	  }
	        });

	    vis.nodeEnter.append("text")
	        .attr("dy", "0.31em")
	        .attr("x", d => d._children ? -6 : 6)
	        .attr("text-anchor", d => d._children ? "end" : "start")
	        .text(function(d) {
	        	switch(d.data.ROOT) {
	        		case 0: return(d.data.name);
	        			break;
	        		case 1: return("Water Utility");
	        			break;
	        		case 2: return("Hospital");
	        			break;
	        		case 3: return("Power Station")
	        			break;
	        		default: return("Help");
	        	}})
	        .attr("stroke-linejoin", "round")
	        .attr("stroke-width", 3)
	        .attr("text-color", d => vis.colorScaleType(d.data.ROOT))
	        .attr("stroke", "white")
	        .attr("paint-order", "stroke");

	    // Transition nodes to their new position.
   		vis.nodeUpdate = vis.node.merge(vis.nodeEnter).transition(vis.transition)
        	.attr("transform", d => `translate(${d.y},${d.x})`)
        	.attr("fill-opacity", 1)
        	.attr("stroke-opacity", 1);

        // Transition exiting nodes to the parent's new position.
	    vis.nodeExit = vis.node.exit().transition(vis.transition).remove()
	        .attr("transform", d => `translate(${source.y},${source.x})`)
	        .attr("fill-opacity", 0)
	        .attr("stroke-opacity", 0);

	    // Update the links…
    	vis.link = vis.gLink.selectAll("path")
      		.data(vis.links, d => d.target.id);

      	// Enter any new links at the parent's previous position.
	    vis.linkEnter = vis.link.enter().append("path")
	        .attr("d", d => {
	          const o = {x: source.x0, y: source.y0};
	          return vis.diagonal({source: o, target: o});
	        });

	    // Transition links to their new position.
    	vis.link.merge(vis.linkEnter).transition(vis.transition)
        	.attr("d", vis.diagonal);

       	// Transition exiting nodes to the parent's new position.
	    vis.link.exit().transition(vis.transition).remove()
	        .attr("d", d => {
	          const o = {x: source.x, y: source.y};
	          return vis.diagonal({source: o, target: o});
	        });

	    // Stash the old positions for transition.
	    vis.root.eachBefore(d => {
	      d.x0 = d.x;
	      d.y0 = d.y;
	    });

	    console.log(vis.root);

	}

	openNode(id) {
		let vis = this;
		//console.log(id);

		let currNode = vis.root.find(d => d.data.name == id);
		//console.log(currNode);

      	currNode.children = currNode._children.slice(0);
      	vis.updateVis(null, currNode);
      	let i = openAssets.findIndex(item => item.UFOKN_ID == currNode.data.name);
      	if (i >= 0 ) {
      		openAssets[i].open = true;
      	}
      	addPolygonAssets(currNode.data);
	  	
	}

	closeNode(id) {
		let vis = this;
		//console.log(id);

		let currNode = vis.root.find(d => d.data.name == id);
		//console.log(currNode.descendants());

		if (currNode.children) {
	      	currNode.descendants().forEach(d => {
	      		d.children = null;
	      		let i = openAssets.findIndex(item => item.UFOKN_ID == d.data.name);
	      		//console.log(i);
	      		if (i >= 0) {
	      			openAssets[i].open = false;
	      		}
	      	});
	      	vis.updateVis(null, currNode);
	      	removePolygonAssets(currNode);
	    }
	}

}
