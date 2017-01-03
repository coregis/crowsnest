//replace the url for the spreadsheet being mapped here
window.onload=function(){
	getSpreadsheet('https://docs.google.com/spreadsheets/d/1zz05QMpd59xPzgmTZwyWNUl87I__dOTQPU5fQiNijZA/pubhtml');
}

//all of this is happening asynchronously; the callback is telling Tabletop to build the map using the spreadsheet
function getSpreadsheet(key){
  Tabletop.init( { 
    key: key,
    callback: buildMap,
    simpleSheet: true
  });
}

function buildMap(data, tabletop) {

L.mapbox.accessToken = 'pk.eyJ1IjoiY29yZS1naXMiLCJhIjoiaUxqQS1zQSJ9.mDT5nb8l_dWIHzbnOTebcQ';

  // build map
  var map = L.mapbox.map('map', 'mapbox.light').setView([0,0],1);
  var points = L.featureGroup();
  var brewery = L.featureGroup();
  var restaurant = L.featureGroup();
  var groceryStore = L.featureGroup();
  var attraction = L.featureGroup();
  
  for(var i=0;i<data.length;i++) {
    var marker = L.marker([parseFloat(data[i].lat), parseFloat(data[i].lng)]);
    var popupInfo = metadata(data[i]);
	
	//type in your desired dimensions for the markers; the marker will always be square
	var iconDim = 31;
	category = data[i].category.toLowerCase();
	marker.setIcon( L.icon({
		iconUrl: "markers/" + data[i].markerfile,
		iconSize: [iconDim, iconDim],
		iconAnchor: [iconDim/2, iconDim*0.9],
		popupAnchor: [0, 0]
		/*shadowUrl: 'my-icon-shadow.png',
		shadowSize: [68, 95],
		shadowAnchor: [22, 94]*/
	}));
    marker.bindPopup(popupInfo,{'maxWidth':'350','maxHeight':'350','minWidth':'200'});
    points.addLayer(marker);
	if (category === "brewery") {
	  brewery.addLayer(marker);
	}
	else if (category === "restaurant") {
	   restaurant.addLayer(marker);
	}
	else if (category === "grocery store") {
	   groceryStore.addLayer(marker);
	}
	else if (category === "attraction") {
	   attraction.addLayer(marker);
	}	
  }

  var overlayMaps = {
    "Breweries": brewery,
	"Restaurants": restaurant,
	"Grocery Stores": groceryStore,
	"Attractions": attraction,
  };
  
  /*function chooseIcon(category, active) {  
	  if (active.toLowerCase() === "yes"){
		  if (category === "limited vote") {
			  return "336699-15.svg";
		  }
		  else if (category === "instant runoff voting") {
			  return "cc3333-15.svg";
		  }
		  else if (category === "single transferable vote") {
			  return "cc3333-15.svg";
		  }
		  else if (category === "approval voting (bucklin system)") {
			  return "fc9d9d-15.svg";
		  }
		  else if (category === "cumulative voting") {
			  return "ffff00-15.svg";
		  }
		  else if (category === "approval voting (preferential voting)") {
			  return "ffff00-15.svg";
		  }
	  }
	  else {
		  if (category === "limited vote") {
			  return "66ccff-15.svg";
		  }
		  else if (category === "instant runoff voting") {
			  return "fc9d9d-15.svg";
		  }
		  else if (category === "single transferable vote") {
			  return "fc9d9d-15.svg";
		  }
		  else if (category === "approval voting (bucklin system)") {
			  return "fc9d9d-15.svg";
		  }
		  else if (category === "cumulative voting") {
			  return "ffff99-15.svg";
		  }
		  else if (category === "approval voting (preferential voting)") {
			  return "fc9d9d-15.svg";
		  }
	  }
	  return "black.svg";
  }*/
  
  /*Because of additional permutations of state/school/past/current/ need to set the icons from the marker-file attribute*/
  
/*  function chooseIcon(marker-file) {  
	  if (marker-file === "cumulative-current-school.svg") {
		  return "cumulative-current-school.svg";
	  }
	  else if (marker-file === "cumulative-current.svg") {
		  return "cumulative-current.svg";
	  }
	  else if (marker-file === "cumulative-current-state.svg") {
		  return "cumulative-current-state.svg";
	  }	  
	  else if (marker-file === "cumulative-past-school.svg") {
		  return "cumulative-past-school.svg";
	  }
	  else if (marker-file === "cumulative-past-state.svg") {
		  return "cumulative-past-state.svg";
	  }
	  else if (marker-file === "cumulative-past.svg") {
		  return "cumulative-past.svg";
	  }	  
	  else if (marker-file === "limited-current-school.svg") {
		  return "limited-current-school.svg";
	  }
	  else if (marker-file === "limited-current.svg") {
		  return "limited-current.svg";
	  }
	  else if (marker-file === "limited-past-school.svg") {
		  return "limited-past-school.svg";
	  }
	  else if (marker-file === "limited-past.svg") {
		  return "limited-past.svg";
	  }
	  else if (marker-file === "ranked-choice-current.svg") {
		  return "ranked-choice-current.svg";
	  }
	  else if (marker-file === "ranked-choice-past-school.svg") {
		  return "ranked-choice-past-school.svg";
	  }
	  else if (marker-file === "ranked-choice-past-state.svg") {
		  return "ranked-choice-past-state.svg";
	  }
	  else if (marker-file === "ranked-choice-past.svg") {
		  return "ranked-choice-past.svg";
	  }		
	  return "black.svg";
  }
*/
  
  L.control.layers(false, overlayMaps).addTo(map);
  map.addLayer(approvalBucklin);
  map.addLayer(approvalPreferential);
  map.addLayer(cumulativeVoting);
  map.addLayer(instantRunoff);
  map.addLayer(limitedVote);
  map.addLayer(singleTransferable);
  
  
  var bounds = points.getBounds();
  map.fitBounds(bounds, {padding:[10,10]});

  map.setView(map.getCenter());
/*These three lines prevent the user from zooming out to space or panning to Europe; however, they prevent popups from appearing for points near bound limits*/ 
 /*map.setMaxBounds(bounds);
  map.options.maxZoom = 9;
  map.options.minZoom = 5;*/

  map.on('click', function(e) {
    var coords = document.getElementById('coords');
    coords.innerHTML="<p>Lat: <strong>" + e.latlng.lat + "</strong>, Lng: <strong>" + e.latlng.lng+"</strong>";
  });
}

//add fields here that you do not want displayed in the popupInfo. Must be all lowercase
/*
NEED TO FIGURE OUT HOW TO SHOW ONLY NON-NULL FIELDS IN THE POPUP;
ALSO NEED TO FIGURE OUT HOW TO SHOW MULTIPLE IMAGES IN A GALLERY/SLID-SHOW. BELOW IS AN EXAMPLE:
https://www.mapbox.com/mapbox.js/example/v1.0.0/markers-with-image-slideshow/
*/
function metadata(properties) {
  //This is equivalent to the first row of the spreadsheet, these are the field names; field names are called keys
  var obj = Object.keys(properties);
  //This is all of the HTML that goes into the popup
  var info = "";
  for(var p=0; p<obj.length; p++) {
    var prop = obj[p];
    if (prop != 'lat' &&
        prop != 'lng' &&
        prop != 'marker-file' &&
		properties[prop].length > 0) {
      //prop is the field name from the spreadsheet; properties is the geoJSON generated from one row of the spreadsheet
	  //INSTEAD OF PROP, NEED TO WRITE A NEW FUNCTION THAT DOES TEXT SUBSTITUTIONS
	  //get rid of <strong>"+prop+"</strong>: to not show the field names in the popup
	  info += "<p class='"+prop+"'>"+properties[prop]+"</p>";
    }
  }
//console.log(info);
  return info;
}

function showErrors(err) {
  console.log(err);
}