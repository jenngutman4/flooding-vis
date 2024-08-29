class LeafletMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _census) {
    this.config = {
      parentElement: _config.parentElement,
	  legendElement: _config.legendElement,
    }
    this.data = _data;
    this.census = _census
	this.currentColorScale = null;
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;
	
    //ESRI
    vis.esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    vis.esriAttr = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

    //TOPO
    vis.topoUrl ='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    vis.topoAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'

    //Thunderforest Outdoors- requires key... so meh... 
    vis.thOutUrl = 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}';
    vis.thOutAttr = '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //Stamen Terrain
    vis.stUrl = 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}';
    vis.stAttr = 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

    //this is the base map layer, where we are showing the map background
    vis.base_layer = L.tileLayer(vis.esriUrl, {
      id: 'esri-image',
      attribution: vis.esriAttr,
      ext: 'png'
    });
	var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
		attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
	});
	var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	});
	var Stamen_Terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		subdomains: 'abcd',
		ext: 'png'
	});
	
	vis.basemaps = {
		  "ESRI": vis.base_layer,
		  "Topography": OpenTopoMap,
		  "Street Map": OpenStreetMap_Mapnik,
		  "Stamen Terrain": Stamen_Terrain
	};

    vis.theMap = L.map('my-map', {
      //center: [38.5, -90.5], //STL
      center: [39.2, -84.5],
      zoom: 11,
      layers: [vis.base_layer],
	  selectArea: true
    });

    vis.theMap.doubleClickZoom.disable();
	
	vis.theMap.on('areaselected', (e) => {
		console.log(e.bounds);
		console.log(e.bounds.toBBoxString()); // lon, lat, lon, lat
		vis.filterData(e.bounds.toBBoxString());
	});

	vis.dynamicPolygonLayer = L.geoJSON().addTo(vis.theMap);
	vis.polygons = [];

	medicalPolygons.features.forEach(d => d['properties'] = {color: "#FF0000"});
	waterPolygons.features.forEach(d => d['properties'] = {color: "#0000FF"});
	electricPolygons.features.forEach(d => d['properties'] = {color: "#FFFF00"});

	console.log(electricPolygons);
		
	L.control.layers(vis.basemaps).addTo(vis.theMap);

	
	// vis.dynamicPolygonLayer.addData(waterPolygons.features[2]);
	// vis.dynamicPolygonLayer.addData(medicalPolygons.features[2]);
	// vis.dynamicPolygonLayer.addData(medicalPolygons.features[2]);

	vis.floodPolygon = new L.geoJSON(floodPolygon.geometries, {style: {color: "#00FFFF", "fillOpacity": 0.25}});
	vis.electricPolygons = new L.geoJSON(electricPolygons.features, {style: {color: "#FFFF00", "fill": null}});
	vis.medicalPolygons = new L.geoJSON(medicalPolygons.features, {style: {color: "#FF0000", "fill": null}});
	vis.waterPolygons = new L.geoJSON(waterPolygons.features, {style: {color: "#0000FF", "fill": null}});
	vis.flood100Polygons = new L.geoJSON(flood_100_polygons.geometries, {style: {color: "#00FF00", "fillOpacity": 0.25}});

	vis.layerGroup = new L.LayerGroup();
	vis.layerGroup.addTo(vis.theMap);
	
	vis.colorType = 'year'; //this is used to determine how to color the map using the different color scales
	
	vis.colorScaleYear = d3.scaleSequential()
		.interpolator(d3.interpolateViridis)
		.domain(d3.extent(vis.data, d => d.Z));

	vis.colorScaleType = d3.scaleOrdinal()
		.domain(['ust', 'building', 'power'])
		.range(['blue', 'white', 'yellow']);


	vis.colorScalePoly = d3.scaleOrdinal()
		.domain([-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
		.range(['#ffffff', '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#000000'])

	vis.colorScaleRoot = d3.scaleOrdinal()
		.domain([0, 1, 2, 3])
		.range(['white', 'blue', 'red', 'yellow']);

	//vis.currentColorScale = vis.colorScaleType;
	//vis.currentColorScale = vis.colorScalePoly;
	vis.currentColorScale = vis.colorScaleRoot;


    //initialize svg for d3 to add to map
    L.svg({clickable:true}).addTo(vis.theMap)// we have to make the svg layer clickable
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane)
    vis.svg = vis.overlay.select('svg').attr("pointer-events", "auto")


    vis.Dots = vis.svg.selectAll('circle')
                    .data(vis.data) 
                    .join('circle')
                        .attr("fill", function(d){
							switch(vis.colorType)
							{
								case 'year':
									//return vis.colorScaleType(d.Type);
									//return vis.colorScalePoly(d.WATER_POLY);
									//return vis.colorScalePoly(d.MED_POLY);
									//return vis.colorScalePoly(d.POWER_POLY % 20);
									return vis.colorScaleRoot(d.ROOT);
									break;
								default:
									console.log('the fuck you doing');
							}
							})
                        .attr("stroke", "black")
                        //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
                        //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
                        //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
                        .attr("cx", d => vis.theMap.latLngToLayerPoint([d.Y,d.X]).x)
                        .attr("cy", d => vis.theMap.latLngToLayerPoint([d.Y,d.X]).y) 
                        .attr("class", function(d,i) {return ("map_").concat(d.UFOKN_ID);})
                        .attr("r", d => (d.ROOT > 0) ? 10 : 5)
                        .on('mouseover', function(event,d) { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                            //   .duration('150') //how long we are transitioning between the two states (works like keyframes)
                            //   .attr("fill", "red") //change the fill
                            	.attr('r', d => (d.ROOT > 0) ? 12 : 7); //change radius
                            d3.select(".tree_".concat(d.UFOKN_ID)).attr('r', 10);


                            if (d.ROOT > 0) {
                            	vis.updatePolygon(d, false);
                            }


                            //create a tool tip
                            d3.select('#tooltip')
                                .style('display', 'block')
                                .style('z-index', 1000000)
                                  // Format number with million and thousand separator
                                .html(`<div class="tooltip-label"><l>Type: ${d.AssetInfo}</l><br>
                                		<l> ID: ${d.UFOKN_ID}</l><br>
                                		<l> Address: ${d.Address}</l></div>`);

                          })                        
                        .on('mousemove', (event) => {
                            //position the tooltip
                            d3.select('#tooltip')
                             .style('left', (event.pageX + 10) + 'px')   
                              .style('top', (event.pageY + 10) + 'px');
                         })              
                        .on('mouseleave', function(event, d) { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", function(d){
									switch(vis.colorType)
									{
										case 'year':
											//return vis.colorScaleType(d.Type);
											//return vis.colorScalePoly(d.WATER_POLY);
											//return vis.colorScalePoly(d.MED_POLY);
											//return vis.colorScalePoly(d.POWER_POLY % 20);
											return vis.colorScaleRoot(d.ROOT);
											break;
										default:
											console.log('the fuck you doing');
									}
									})
                              .attr('r', d => (d.ROOT > 0) ? 10 : 5) //change radius

                            if (d.ROOT > 0 ) {
                            	vis.polygons.pop();
                        		vis.updatePolygon(null, false);
                        	}

                            d3.select('#tooltip').style('display', 'none');//turn off the tooltip
                            d3.select(".tree_".concat(d.UFOKN_ID)).attr('r', 8);

                          })
                        .on('dblclick', (event, d) => {
                        	if (d.ROOT > 0) {
                        		//showPolygonAssets(d);
                        		closeTreeNode(d.UFOKN_ID);
                        	}
                        	else {
                        		showRootforBuilding(d);
                        	}
                        })
                        .on('click', (event, d) => {
                        	if (d.ROOT > 0) {
                        		console.log(d);
                        		//vis.polygons.push(d);
                        		openTreeNode(d.UFOKN_ID);
                        		vis.updatePolygon(d, false);
                        		//addPolygonAssets(d);
                        	}
                        })
                        // .on('click', (event, d) => { 
                        // 		window.open(d.references);
                        // //experimental feature I was trying- click on point and then fly to it
                        //    // vis.newZoom = vis.theMap.getZoom()+2;
                        //    // if( vis.newZoom > 18)
                        //    //  vis.newZoom = 18; 
                        //    // vis.theMap.flyTo([d.latitude, d.longitude], vis.newZoom);
                        //   });
    
	//legend stuff
	// vis.svg2.append("g")
	// 	.attr('class', 'legend')
	// 	.attr('transform', 'translate(10,20)');
	
	// vis.legendClass = d3.legendColor()
	// 	.title('Legend: year')
	// 	.shape("path", d3.symbol().type(d3.symbolCircle).size(150))
	// 	.shapePadding(10)
	// 	.scale(vis.currentColorScale)
	// 	.cellFilter(function(d){ return d.label !== '' });
		
	// vis.svg2.select('.legend')
	// 	.call(vis.legendClass);

    //handler here for updating the map, as you zoom in and out           
    vis.theMap.on("zoomend", function(){
      vis.updateVis();
    });
	
	vis.dragOffset = {x: 0, y:0 };
	vis.theMap.on('dragend', function(event, d) {
    	console.log("hello");
    	vis.dragOffset.x = event.sourceTarget._newPos.x;
    	vis.dragOffset.y = event.sourceTarget._newPos.y;
    	console.log(event.sourceTarget._newPos);
    	console.log(d);
    	vis.updateVis();
    });
	//brush stuff
	
	/*document.addEventListener('mousedown', (e) => {
		if (e.button == 2) {vis.theMap.dragging.disable();}
		}
	);

	document.addEventListener('mouseup', (e) => {
		if (e.button == 2)	{ vis.theMap.dragging.enable(); }
		}
	);
	
	vis.brush = d3.brush()
		.filter(function filter(event) {
			return !event.ctrlKey;
		})
		.on("end", vis.brushed);
	vis.svg.append('g')
		.attr('class', 'brush')
		.call(vis.brush);*/
	

  }

  updateVis(newColorScale = null) {
    let vis = this;

	if (newColorScale != null) {
		console.log(`Not equal to null! ${newColorScale}`);
		if (newColorScale == 'year')
		{
			//vis.currentColorScale = vis.colorScaleType;
			//vis.currentColorScale = vis.colorScalePoly;
			vis.currentColorScale = vis.colorScaleRoot;
		}
		// else if (newColorScale == 'day of year')
		// {
		// 	vis.currentColorScale = vis.colorScaleStartDay;
		// }
		// else if (newColorScale == 'phylum')
		// {
		// 	vis.currentColorScale = vis.colorScaleClass;
		// }
		vis.svg2.select('.legend').remove();
		vis.svg2.append("g")
			.attr('class', 'legend')
			.attr('transform', 'translate(10,20)');
		vis.legendClass = d3.legendColor()
			.title(`Legend: ${newColorScale}`)
			.shape("path", d3.symbol().type(d3.symbolCircle).size(150))
			.shapePadding(10)
			.scale(vis.currentColorScale)
			.cellFilter(function(d){ return d.label !== '' });
		vis.svg2.select('.legend')
			.call(vis.legendClass);
	}

    //want to see how zoomed in you are? 
    console.log(vis.theMap.getZoom()); //how zoomed am I
    
    

    if (vis.theMap.getZoom() < 13) {
    	vis.dataShown = vis.data.filter(d => d.ROOT > 0);
    }
    else {
    	vis.dataShown = vis.data.slice();
    }
    
    //want to control the size of the radius to be a certain number of meters? 
    //vis.radiusSize = 3; 
    // if( vis.theMap.getZoom > 15 ){
    //   metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
    //   desiredMetersForPoint = 100; //or the uncertainty measure... =) 
    //   radiusSize = desiredMetersForPoint / metresPerPixel;
    // }
   
   //redraw based on new zoom- need to recalculate on-screen position
	vis.Dots = vis.svg.selectAll('circle')
                    .data(vis.dataShown) 
                    .join('circle')
                        .attr("fill", function(d){
							switch(vis.colorType)
							{
								case 'year':
									//return vis.colorScaleType(d.Type);
									//return vis.colorScalePoly(d.WATER_POLY);
									//return vis.colorScalePoly(d.MED_POLY);
									//return vis.colorScalePoly(d.POWER_POLY % 20);
									return vis.colorScaleRoot(d.ROOT);
									break;
								default:
									console.log('the fuck you doing');
							}
							})
                        .attr("stroke", "black")
                        //.style("opacity", d => (d.ROOT > 0) ? 1 : 0.5) 

                        //Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
                        //leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
                        //Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
                        .attr("cx", d => vis.theMap.latLngToLayerPoint([d.Y,d.X]).x)
                        .attr("cy", d => vis.theMap.latLngToLayerPoint([d.Y,d.X]).y) 
                        .attr("class", function(d,i) {return ("map_").concat(d.UFOKN_ID);})
                        .attr("r", d => (d.ROOT > 0) ? 10 : 5)
                        .on('mouseover', function(event,d) { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              //.attr("fill", "red") //change the fill
                              .attr('r', d => (d.ROOT > 0) ? 12 : 7); //change radius
                            d3.select(".tree_".concat(d.UFOKN_ID)).attr('r', 10);

                            console.log(this);
                            

                            if (d.ROOT > 0) {
                            	vis.updatePolygon(d, false);
                            }

                            //create a tool tip
                            d3.select('#tooltip')
                                .style('display', 'block')
                                .style('z-index', 1000000)
                                  // Format number with million and thousand separator
                                .html(`<div class="tooltip-label"><l>Type: ${d.AssetInfo}</l><br>
                                		<l> ID: ${d.UFOKN_ID}</l><br>
                                		<l> Address: ${d.Address}</l></div>`);

                          })
                        .on('mousemove', (event) => {
                            //position the tooltip
                            d3.select('#tooltip')
                             .style('left', (event.pageX + 10) + 'px')   
                              .style('top', (event.pageY + 10) + 'px');
                         })              
                        .on('mouseleave', function(event, d) { //function to add mouseover event
                            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                              .duration('150') //how long we are transitioning between the two states (works like keyframes)
                              .attr("fill", function(d){
									switch(vis.colorType)
									{
										case 'year':
											//return vis.colorScaleType(d.Type);
											//return vis.colorScalePoly(d.WATER_POLY);
											//return vis.colorScalePoly(d.MED_POLY);
											//return vis.colorScalePoly(d.POWER_POLY % 20);
											return vis.colorScaleRoot(d.ROOT);
											break;
										default:
											console.log('nope');
									}
									})
                              .attr('r', d => (d.ROOT > 0) ? 10 : 5) //change radius
                            if (d.ROOT > 0 ) {
                            	vis.polygons.pop();
                        		vis.updatePolygon(null, false);
                        	}

                            d3.select('#tooltip').style('display', 'none');//turn off the tooltip
                            d3.select(".tree_".concat(d.UFOKN_ID)).attr('r', 8);

                          })
                        .on('dblclick', (event, d) => {
                        	if (d.ROOT > 0) {
                        		//showPolygonAssets(d);
                        		closeTreeNode(d.UFOKN_ID);
                        	}
                        	else {
                        		showRootforBuilding(d);
                        	}
                        })
                        .on('click', (event, d) => {
                        	if (d.ROOT > 0) {
                        		//vis.polygons.push(d);
                        		console.log(d);
                        		
                        		openTreeNode(d.UFOKN_ID);
                        		vis.updatePolygon(d, false);
                        		//document.getElementById('rootSelect').value = d.UFOKN_ID;
                        		//console.log(document.getElementById('rootSelect').value);
                        		//addPolygonAssets(d);
                        	}
                        })
                        // .on('click', (event, d) => { 
                        // 		window.open(d.references);
                        // //experimental feature I was trying- click on point and then fly to it
                        //    // vis.newZoom = vis.theMap.getZoom()+2;
                        //    // if( vis.newZoom > 18)
                        //    //  vis.newZoom = 18; 
                        //    // vis.theMap.flyTo([d.latitude, d.longitude], vis.newZoom);
                        //   });
			

	}

  renderVis() {
    let vis = this;

    //not using right now... 
 
  }

  showPolygons(i) {
  	let vis = this;

  	if (i == 0) {

		var checkBox = document.getElementById("floodPolygon");
	    //var text = document.getElementById("text");

	    if (checkBox.checked == true){
	    	vis.layerGroup.addLayer(vis.floodPolygon);
	  	} else {
	    	vis.layerGroup.removeLayer(vis.floodPolygon);
	  	}
	}
	else if (i == 1) {
		var checkBox = document.getElementById("electricPolygons");
	    //var text = document.getElementById("text");

	    if (checkBox.checked == true){
	    	vis.layerGroup.addLayer(vis.electricPolygons);
	  	} else {
	    	vis.layerGroup.removeLayer(vis.electricPolygons);
	  	}
	}
	else if (i == 2) {
		var checkBox = document.getElementById("medicalPolygons");
	    //var text = document.getElementById("text");

	    if (checkBox.checked == true){
	    	vis.layerGroup.addLayer(vis.medicalPolygons);
	  	} else {
	    	vis.layerGroup.removeLayer(vis.medicalPolygons);
	  	}
	}
	else if (i == 3) {
		var checkBox = document.getElementById("waterPolygons");
	    //var text = document.getElementById("text");

	    if (checkBox.checked == true){
	    	vis.layerGroup.addLayer(vis.waterPolygons);
	  	} else {
	    	vis.layerGroup.removeLayer(vis.waterPolygons);
	  	}
	}
	else if (i == 4) {
		var checkBox = document.getElementById("flood100Polygons");
	    //var text = document.getElementById("text");

	    if (checkBox.checked == true){
	    	vis.layerGroup.addLayer(vis.flood100Polygons);
	  	} else {
	    	vis.layerGroup.removeLayer(vis.flood100Polygons);
	  	}
	}
  	

  }

  updatePolygon(asset, reset) {
  	let vis = this;

  	//console.log(asset);


  	vis.dynamicPolygonLayer.clearLayers();

  	if (asset) {
  	
	  	if (asset.ROOT == 1) {
	  		vis.polygons.push(waterPolygons.features[asset.WATER_POLY]);
	  	}
	  	if (asset.ROOT == 2) {
	  		vis.polygons.push(medicalPolygons.features[asset.MED_POLY]);
	  	}
	  	if (asset.ROOT == 3) {
	  		vis.polygons.push(electricPolygons.features[asset.POWER_POLY]);
	  	}
	  	//console.log(vis.polygons);

	 }
	 else if (reset == true) {
	 	vis.polygons.splice(0, vis.polygons.length);
	 }

	 vis.dynamicPolygonLayer.addData(vis.polygons);

	 vis.dynamicPolygonLayer.setStyle(function(feature) {
  		//console.log(feature);
	    switch(feature.properties.color) {
	        case '#0000FF': return {color: '#0000FF', fill: null};
	        case '#FFFF00': return {color: '#FFFF00', fill: null};
	        case '#FF0000': return {color: '#FF0000', fill: null};
	   	} 
	 });

  }
  
  // filterData(bLatLon)
  // {
// 	  let vis = this;
// 	  let newData = [];
	  
// 	  let latlon = bLatLon.split(',');
// 	  vis.data.filter(function(d) {
// 		  if(d.decimalLatitude <= parseFloat(latlon[3]) && d.decimalLatitude >= parseFloat(latlon[1]) && d.decimalLongitude >= parseFloat(latlon[0]) && d.decimalLongitude <= parseFloat(latlon[2]))
// 		  {
// 			  newData.push(d);
// 		  }
// 	  });
// 	  console.log(newData);
// 	  UpdateAllCharts(newData);
	  
  // }
  
  
}