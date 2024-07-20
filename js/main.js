let allAssets = [];
let affectedCritAssets = [];
let affectedAssets = [];
let filteredAssets = [];
let openAssets = [];
let floodRoot = [];
let leafletMap;
let tree;
let hierarchyData = [];


d3.csv('data/asset_data2.csv')
	.then(data => {
		data.forEach(d => {
			d.X = +d.X;
      		d.Y = +d.Y;
      		d.Z = +d.Z;
			d.WATER_POLY = +d.WATER_POLY;
			d.POWER_POLY = +d.POWER_POLY;
			d.MED_POLY = +d.MED_POLY;
			d.ROOT = +d.ROOT;
			d.Index = +d.Index;
			d.name = d.UFOKN_ID;
			d.rootName = '';
		})
		console.log(data);
		allAssets = data;

		roots = allAssets.filter(d => (d.ROOT > 0));
	    
		
		//console.log([...new Set(data.map(item => item.UFOKN_ID))]);

		//floodRoot.push(allAssets.find(asset => asset.ROOT == 3 && asset.POWER_POLY == 6));
		//floodRoot.push(allAssets.find(asset => asset.UFOKN_ID == "dngyy39et4hf" && asset.ROOT > 0));

		


		////////// CHANGE FLOOD ///////////
		floodRoot = allAssets.filter(asset => asset.ROOT > 0 && asset.Flooded > 0);
		//floodRoot = allAssets.filter(asset => asset.ROOT > 0 && asset.Flooded100 > 0);
		
		


		console.log(floodRoot);
		
		affectedCritAssets = [...new Set(floodRoot.map(item => item.UFOKN_ID))];
		floodRoot.forEach((d, i) => document.getElementById('rootSelect').options[rootSelect.options.length] = new Option(d.UFOKN_ID, i));
		
		affectedAssets = [...new Set(floodRoot.map(item => item.UFOKN_ID))];
		
		// floodRoot.forEach((d, i) => {
		// 	hierarchyData.push({name: d.UFOKN_ID, ROOT: d.ROOT, WATER_POLY: d.WATER_POLY, MED_POLY: d.MED_POLY, POWER_POLY: d.POWER_POLY, children: []});
		// 	// if ((["dngyt3h4cy37", "dngyxwtxvvd4", "dngyydqx6mxw", "dngyybmdr5n3", "dnun2e74wq52"]).includes(d.UFOKN_ID)) {
		// 	// 	hierarchyData[i].children = (getChildren(d));
		// 	// }
		// 	// else {
		// 	// 	hierarchyData[i].children = null;
		// 	// }
		// 	if ((["dngyt3h4cy37"]).includes(d.UFOKN_ID)) {
		// 		hierarchyData[i].children = (getChildren(d));
		// 	}
		// 	else {
		// 		hierarchyData[i].children = null;
		// 	}
		// })

		hierarchyData.push({name: floodRoot[0].UFOKN_ID, ROOT: floodRoot[0].ROOT, WATER_POLY: floodRoot[0].WATER_POLY, MED_POLY: floodRoot[0].MED_POLY, POWER_POLY: floodRoot[0].POWER_POLY, children: []});
		hierarchyData[0].children = (getChildren(floodRoot[0]));
		console.log(hierarchyData);


		affectedCritAssets.forEach(d => {
			openAssets.push({UFOKN_ID: d, open: false});
		});
		console.log(affectedCritAssets);


		affectedAssets = Array.from(new Set(affectedAssets));
		console.log(affectedAssets);
		
		filteredAssets = floodRoot.slice(0);




		/////// SHOW ALL FLOODED ASSETS /////////
		//filteredAssets = allAssets.filter(asset => asset.Flooded > 0);
		//filteredAssets = allAssets.filter(asset => asset.Flooded100 > 0);




		//Test Flooded
		//filteredAssets = allAssets.filter(d => (d.Flooded > 0));
		//filteredAssets = allAssets.slice(0);
		
		leafletMap = new LeafletMap({ parentElement: '#my-map', legendElement: '#map-legend' }, filteredAssets, null);
		tree = new Tree({'parentElement': '#tree'}, hierarchyData);

		addLegend();
	}) 
	.catch(error => console.error(error));



function getChildren(floodRoot) {
	let children = [];
	let nextLevelRoots = [];
	let nextLevelAssets = [];

	// get assets affected by the root
	switch(floodRoot.ROOT) {
		case 0:
			break;
		case 1:
			nextLevelAssets = allAssets.filter(asset => (asset.WATER_POLY == floodRoot.WATER_POLY) && ((asset.ROOT == 0) || (asset.ROOT == 2)));
			break;
		case 2:
			nextLevelAssets = allAssets.filter(asset => (asset.MED_POLY == floodRoot.MED_POLY) && (asset.ROOT == 0));
			break;
		case 3:
			nextLevelAssets = allAssets.filter(asset => (asset.POWER_POLY == floodRoot.POWER_POLY) && (asset.ROOT < 3));
			break;
	}

	// remove assets already impacted by another root and add new assets to affected
	nextLevelAssets = nextLevelAssets.filter(asset => affectedAssets.includes(asset.UFOKN_ID) == false);
	nextLevelAssets.forEach(asset => affectedAssets.push(asset.UFOKN_ID));

    // get next level of roots
	nextLevelRoots = nextLevelAssets.filter(asset => asset.ROOT > 0);

	// add next level to hierarchy
	if (nextLevelAssets.length > 0) {
		children.push({name: (nextLevelAssets.length - nextLevelRoots.length).toString(), ROOT: 0});

		nextLevelRoots = nextLevelRoots.filter(asset => affectedCritAssets.includes(asset.UFOKN_ID) == false);
		nextLevelRoots.forEach(asset => affectedCritAssets.push(asset.UFOKN_ID));

		nextLevelRoots.forEach((d, i) => {
			children.push({name: d.UFOKN_ID, ROOT: d.ROOT, WATER_POLY: d.WATER_POLY, MED_POLY: d.MED_POLY, POWER_POLY: d.POWER_POLY, children: []});
			children[i+1].children = getChildren(d);
		});
	}
	else {
		nextLevelRoots = nextLevelRoots.filter(asset => affectedCritAssets.includes(asset.UFOKN_ID) == false);
		nextLevelRoots.forEach(asset => affectedCritAssets.push(asset.UFOKN_ID));

		nextLevelRoots.forEach((d, i) => {
			children.push({name: d.UFOKN_ID, ROOT: d.ROOT, WATER_POLY: d.WATER_POLY, MED_POLY: d.MED_POLY, POWER_POLY: d.POWER_POLY, children: []});
			children[i].children = getChildren(d);
		});

	}
	
	
	return children;
}


//////// MAP FUNCTIONS ////////

// FIX THIS and addPolygon Assets - water only affects hospital, hospital only affects residential, power affects all except other power

function showPolygonAssets(asset) {
  console.log(asset);
  if (asset.ROOT == 1) {
    filteredAssets = allAssets.filter(d => (d.WATER_POLY == asset.WATER_POLY) && ((d.ROOT == 0) || (d.ROOT == 2)));
  }
  else if (asset.ROOT == 2) {
    filteredAssets = allAssets.filter(d => (d.MED_POLY == asset.MED_POLY) && (d.ROOT == 0));
  }
  else if (asset.ROOT == 3) {
    filteredAssets = allAssets.filter(d => (d.POWER_POLY == asset.POWER_POLY) && (d.ROOT < 3));
  }
  updateAllCharts(filteredAssets);
}

function showRootforBuilding(asset) {
  console.log(asset);
  let buildingRoots = [];
  buildingRoots.push(asset);
  if (asset.WATER_POLY >= 0) {
    let waterRoots = allAssets.filter(d => ((d.ROOT == 1) && (d.WATER_POLY == asset.WATER_POLY)))
    waterRoots.forEach(d => buildingRoots.push(d));
  } 
  if (asset.MED_POLY >= 0) {
    let medRoots = allAssets.filter(d => ((d.ROOT == 2) && (d.MED_POLY == asset.MED_POLY)));
    medRoots.forEach(d => buildingRoots.push(d));
  } 
  if (asset.POWER_POLY >= 0) {
    let powerRoots = allAssets.filter(d => ((d.ROOT == 3) && (d.POWER_POLY == asset.POWER_POLY)));
    powerRoots.forEach(d => buildingRoots.push(d));
  } 
  console.log(buildingRoots);
  filteredAssets = buildingRoots;
  updateAllCharts(filteredAssets); 
}

function addPolygonAssets(asset) {
	console.log(openAssets);
  //let currRoot = filteredAssets.filter(d => d.ROOT > 0 && d.UFOKN_ID == asset.name);
  console.log(asset);
  if (asset.ROOT == 1) {
    let assetsToAdd = allAssets.filter(d => (d.WATER_POLY == asset.WATER_POLY) && ((d.ROOT == 0) || (d.ROOT == 2)));
    assetsToAdd.forEach(d => {
    	d.rootName = asset.name;
    	filteredAssets.push(d);
    }); 
  }
  else if (asset.ROOT == 2) {
    let assetsToAdd = allAssets.filter(d => (d.MED_POLY == asset.MED_POLY) && (d.ROOT == 0));
    assetsToAdd.forEach(d => {
    	d.rootName = asset.name;
    	filteredAssets.push(d);
    }); 
  }
  else if (asset.ROOT == 3) {
    let assetsToAdd = allAssets.filter(d => (d.POWER_POLY == asset.POWER_POLY) && (d.ROOT < 3));
    assetsToAdd.forEach(d => {
    	d.rootName = asset.name;
    	filteredAssets.push(d);
    }); 

  }
  //filteredAssets = filteredAssets.push(currRoot);
  //console.log(filteredAssets);
  filteredAssets = removeDuplicates(filteredAssets);
  console.log(filteredAssets);
  updateAllCharts(filteredAssets); 
}

function removePolygonAssets(asset) {
	console.log(openAssets);
	console.log(filteredAssets);
	console.log(asset.children);


	//let updatedRoots = filteredAssets.filter(d => d.ROOT > 0);

	//let childRoots = [...new Set(asset.children.map(d => d.name))];
	//updatedRoots = updatedRoots.filter(d => childRoots.includes(d.UFOKN_ID) == false);

	//filteredAssets = updatedRoots;

	// updatedRoots.forEach(d => {
	// 	if (d.UFOKN_ID == asset.name) {
	// 		if (d.ROOT == 3) {
	// 			//filteredAssets = filteredAssets.filter
	// 		}

	// 	}
		
	// });

	let openRoots = openAssets.filter(item => item.open);
	console.log(openRoots);	

	//console.log(document.getElementById('rootSelect').value);

	filteredAssets = floodRoot.slice(0);
	console.log(floodRoot);

	openRoots.forEach(d => {
		let assetObj = allAssets.find(item => item.UFOKN_ID == d.UFOKN_ID && item.ROOT > 0);
		addPolygonAssets(assetObj);
	})
	console.log(filteredAssets);

	updateAllCharts(filteredAssets); 
}

function openTreeNode(id) {
	console.log(id);
	tree.openNode(id);
}

function closeTreeNode(id) {
	console.log(id);
	tree.closeNode(id);
}

function updateAllCharts(data) {
  leafletMap.data = data;
  leafletMap.updateVis();
}
  
function removeDuplicates(data) {
  //console.log(data);
  const ids = data.map(({ Index }) => Index);
  const filtered = data.filter(({ Index }, i) =>
    !ids.includes(Index, i + 1));
  //console.log(filtered);

  return(filtered);
}

function changeTree(index) {
	openAssets.forEach(d => d.open = false);
	filteredAssets = floodRoot.slice(0);
	affectedCritAssets = [...new Set(floodRoot.map(item => item.UFOKN_ID))];
	affectedAssets = [...new Set(floodRoot.map(item => item.UFOKN_ID))];
	updateAllCharts(filteredAssets); 

	hierarchyData.pop();
	hierarchyData.push({name: floodRoot[index].UFOKN_ID, ROOT: floodRoot[index].ROOT, WATER_POLY: floodRoot[index].WATER_POLY, MED_POLY: floodRoot[index].MED_POLY, POWER_POLY: floodRoot[index].POWER_POLY, children: []});
	hierarchyData[0].children = (getChildren(floodRoot[index]));

	tree.getData(0);
}

function addLegend() {
	var svg = d3.select("#my_dataviz");

	// Handmade legend
	svg.append("circle").attr("cx",50).attr("cy",130).attr("r", 10).style("fill", "#0000FF").style("stroke", "#000000");
	svg.append("circle").attr("cx",50).attr("cy",160).attr("r", 10).style("fill", "#FF0000").style("stroke", "#000000");
	svg.append("circle").attr("cx",50).attr("cy",190).attr("r", 10).style("fill", "#FFFF00").style("stroke", "#000000");
	svg.append("circle").attr("cx",50).attr("cy",220).attr("r", 5).style("fill", "#FFFFFF").style("stroke", "#000000");
	svg.append("text").attr("x", 70).attr("y", 130).text("Water Root").style("font-size", "15px").attr("alignment-baseline","middle");
	svg.append("text").attr("x", 70).attr("y", 160).text("Medical Root").style("font-size", "15px").attr("alignment-baseline","middle");
	svg.append("text").attr("x", 70).attr("y", 190).text("Power Root").style("font-size", "15px").attr("alignment-baseline","middle");
	svg.append("text").attr("x", 70).attr("y", 220).text("Residential Asset").style("font-size", "15px").attr("alignment-baseline","middle");
}

// function changeDataset(value) {
// 	if (value == "colabRoots") {
// 		console.log("hello1");
// 	}
// 	else if (value == "flood100Roots") {
// 		floodRoot = allAssets.filter(asset => asset.ROOT > 0 && asset.Flooded100 > 0);
// 		filteredAssets = floodRoot.slice(0);
// 		affectedCritAssets = [...new Set(floodRoot.map(item => item.UFOKN_ID))];
// 		affectedAssets = [...new Set(floodRoot.map(item => item.UFOKN_ID))];
// 		updateAllCharts(filteredAssets); 
// 	}
// }
