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
			d.CritChildren = +d.CritChildren;
			d.TotalChildren = +d.TotalChildren;
		})
		console.log(data);
		allAssets = data;

		roots = allAssets.filter(d => (d.ROOT > 0));
	    
		
		//console.log([...new Set(data.map(item => item.UFOKN_ID))]);

		//floodRoot.push(allAssets.find(asset => asset.ROOT == 3 && asset.POWER_POLY == 6));
		//floodRoot.push(allAssets.find(asset => asset.UFOKN_ID == "dngyy39et4hf" && asset.ROOT > 0));

		


		////////// CHANGE FLOOD ///////////
		floodRoot = allAssets.filter(asset => asset.ROOT > 0 && asset.Flooded == 1);
		//floodRoot = allAssets.filter(asset => asset.ROOT > 0 && asset.Flooded100 > 0);
		
		floodRoot.sort((a, b) => (b.CritChildren > a.CritChildren) ? 1 : (b.CritChildren === a.CritChildren) ? ((b.TotalChildren > a.TotalChildren) ? 1 : -1) : -1 )
		


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

		hierarchyData.push({name: floodRoot[0].UFOKN_ID, ROOT: floodRoot[0].ROOT, WATER_POLY: floodRoot[0].WATER_POLY, MED_POLY: floodRoot[0].MED_POLY, POWER_POLY: floodRoot[0].POWER_POLY, Address: floodRoot[0].Address, AssetInfo: floodRoot[0].AssetInfo, children: []});
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

		configureTable();
		updateTable();

		
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
			children.push({name: d.UFOKN_ID, ROOT: d.ROOT, WATER_POLY: d.WATER_POLY, MED_POLY: d.MED_POLY, POWER_POLY: d.POWER_POLY, Address: d.Address, AssetInfo: d.AssetInfo, children: []});
			children[i+1].children = getChildren(d);
		});
	}
	else {
		nextLevelRoots = nextLevelRoots.filter(asset => affectedCritAssets.includes(asset.UFOKN_ID) == false);
		nextLevelRoots.forEach(asset => affectedCritAssets.push(asset.UFOKN_ID));

		nextLevelRoots.forEach((d, i) => {
			children.push({name: d.UFOKN_ID, ROOT: d.ROOT, WATER_POLY: d.WATER_POLY, MED_POLY: d.MED_POLY, POWER_POLY: d.POWER_POLY, Address: d.Address, AssetInfo: d.AssetInfo, children: []});
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
 	leafletMap.updatePolygon(asset, false);
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

	leafletMap.updatePolygon(null, true);

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
	//console.log(id);
	//console.log(document.getElementById('rootSelect').options);
	let id_index = [...new Set(floodRoot.map(item => item.UFOKN_ID))].indexOf(id);
	if (id_index >= 0) {
		changeTree(id_index);
		tree.openNode(id);
	}
	else {
		tree.openNode(id);
	}
}

function closeTreeNode(id) {
	console.log(id);
	tree.closeNode(id);
}

function updateAllCharts(data) {
	// SORT DATA BEFORE PASSING TO MAP
	data.sort((a, b) => {
	  //const titleA = a.title.toUpperCase(); // ignore upper and lowercase
	  //const titleB = b.title.toUpperCase(); // ignore upper and lowercase
	  if (a.ROOT < b.ROOT) {
	    return -1;
	  }
	  if (a.ROOT > b.ROOT) {
	    return 1;
	  }

	  // names must be equal
	  return 0;
	});

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
	leafletMap.updatePolygon(null, true);

	hierarchyData.pop();
	hierarchyData.push({name: floodRoot[index].UFOKN_ID, ROOT: floodRoot[index].ROOT, WATER_POLY: floodRoot[index].WATER_POLY, MED_POLY: floodRoot[index].MED_POLY, POWER_POLY: floodRoot[index].POWER_POLY, Address: floodRoot[index].Address, AssetInfo: floodRoot[index].AssetInfo, children: []});
	hierarchyData[0].children = (getChildren(floodRoot[index]));

	updateTable();

	tree.getData(0);
}

// function highlightRoot(assetName) {
// 	console.log(".".concat(assetName));
// 	console.log(d3.select(".".concat(assetName)));
// 	d3.select(".".concat(assetName)).attr('r', 12);
// }

function configureTable() {
	const totalCounts = [];
	const totalRoots = [];

	totalCounts.push(allAssets.reduce((acc, cur) => cur.Flooded == 0 ? ++acc : acc, 0));
	totalCounts.push(allAssets.reduce((acc, cur) => cur.Flooded == 1 ? ++acc : acc, 0));
	totalCounts.push(allAssets.reduce((acc, cur) => cur.Flooded == 2 ? ++acc : acc, 0));
	totalCounts.push(allAssets.reduce((acc, cur) => cur.Flooded == 3 ? ++acc : acc, 0));
	
	let rootsArr = allAssets.filter(asset => asset.ROOT > 0);

	totalRoots.push(rootsArr.reduce((acc, cur) => cur.Flooded == 0 ? ++acc : acc, 0));
	totalRoots.push(rootsArr.reduce((acc, cur) => cur.Flooded == 1 ? ++acc : acc, 0));
	totalRoots.push(rootsArr.reduce((acc, cur) => cur.Flooded == 2 ? ++acc : acc, 0));
	totalRoots.push(rootsArr.reduce((acc, cur) => cur.Flooded == 3 ? ++acc : acc, 0));

	//console.log(totalCounts);
	//console.log(totalRoots);

	d3.select('#totalRow').html(`<td>${totalCounts[1]} total/${totalRoots[1]} critical</td>
                <td>${totalCounts[2]} total/${totalRoots[2]} critical</td>
                <td>${totalCounts[3]} total/${totalRoots[3]} critical</td>`);
}

function updateTable() {
	//console.log(hierarchyData);
	let secondLevel = 0;

	let firstLevel = hierarchyData[0].children;
	if (firstLevel.length > 1) {
		firstLevel.forEach(d =>{
			if (d.ROOT > 0) {
				if (d.children.length > 0) {
					//console.log(d.children[0].name);
					secondLevel += parseInt(d.children[0].name);
				}
			}
		});
		//console.log(secondLevel);
		//let firstLevelTotal = 
		d3.select('#selectedCascade').html(`<td>${hierarchyData[0].name}</td>
	                <td>${parseInt(hierarchyData[0].children[0].name) + hierarchyData[0].children.length - 1} total/${hierarchyData[0].children.length - 1} critical</td>
	                <td>${secondLevel} total/${0} critical</td>`);
	}
	else {
		d3.select('#selectedCascade').html(`<td>${hierarchyData[0].name}</td>
	                <td>${hierarchyData[0].children[0].name} total/${0} critical</td>
	                <td>${0} total/${0} critical</td>`);
	}
}


function addLegend() {
	var svg = d3.select("#my_dataviz");

	// Handmade legend
	svg.append("circle").attr("cx",50).attr("cy",130).attr("r", 10).style("fill", "#0000FF").style("stroke", "#000000");
	svg.append("circle").attr("cx",50).attr("cy",160).attr("r", 10).style("fill", "#FF0000").style("stroke", "#000000");
	svg.append("circle").attr("cx",50).attr("cy",190).attr("r", 10).style("fill", "#FFFF00").style("stroke", "#000000");
	svg.append("circle").attr("cx",50).attr("cy",220).attr("r", 5).style("fill", "#FFFFFF").style("stroke", "#000000");
	svg.append("text").attr("x", 70).attr("y", 130).text("Water Utility").style("font-size", "15px").attr("alignment-baseline","middle");
	svg.append("text").attr("x", 70).attr("y", 160).text("Hospital").style("font-size", "15px").attr("alignment-baseline","middle");
	svg.append("text").attr("x", 70).attr("y", 190).text("Power Station").style("font-size", "15px").attr("alignment-baseline","middle");
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