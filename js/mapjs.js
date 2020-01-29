var class1 = 1000;
var class2 = 2000;
var class3 = 5000;
var class4 = 10000;
const maxpic = 73066;
const maplat = 48.861989576315885;
const maplon = 2.3193358726491717;

var slider = document.getElementById('slider-color');
var input1 = document.getElementById('input1');
var input2 = document.getElementById('input2');
var input3 = document.getElementById('input3');
var input4 = document.getElementById('input4');
var inputs = [input1,input2,input3,input4];
var classif = [class1,class2,class3,class4];
document.getElementById("maxinput").innerHTML = " - " + maxpic.toString();

noUiSlider.create(slider, {
	start: [Math.log(class1), Math.log(class2), Math.log(class3), Math.log(class4)],
	connect: [true, true, true, true, true],
	range: {
		'min': [0],
		'max': [Math.log(maxpic)],
	}
});

slider.noUiSlider.on('update', function (values, handle) {
    inputs[handle].value = Math.round(Math.exp(values[handle]));
    classif[handle] = Math.round(Math.exp(values[handle]));
});
var connect = slider.querySelectorAll('.noUi-connect');
var classes = ['c-5-color', 'c-4-color', 'c-3-color', 'c-2-color', 'c-1-color'];


for (var i = 0; i < connect.length; i++) {
    connect[i].classList.add(classes[i]);
}

inputs.forEach(function (input, handle) {
    input.addEventListener('change', function () {
    	var valuebefore = this.value;
        slider.noUiSlider.setHandle(handle, Math.log(this.value));
        this.value = valuebefore;
        classif[handle] = parseInt(this.value);
    });

});


var mymap = L.map('mapid').setView([maplat,maplon], 13);


L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
maxZoom: 18,
minZoom: 12,

attribution: 'By Kazuto Nishimori and Nathan Wies. Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> and Flickr API ' +
'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
id: 'mapbox/streets-v11'
}).addTo(mymap);

//var geojson = L.geoJson(hex).addTo(mymap);
var geojson = L.geoJson(hex, {
	style: style,
}).addTo(mymap);

function getColor(d) {
return 	d > classif[3] ? document.styleSheets[document.styleSheets.length - 1].cssRules[0].style.background :
			d > classif[2] ? document.styleSheets[document.styleSheets.length - 1].cssRules[1].style.background :
			d > classif[1] ? document.styleSheets[document.styleSheets.length - 1].cssRules[2].style.background :
			d > classif[0] ? document.styleSheets[document.styleSheets.length - 1].cssRules[3].style.background :
     				     document.styleSheets[document.styleSheets.length - 1].cssRules[4].style.background;
}; 


function style(feature) {
return {
		fillColor: getColor(feature.properties.pic),
		weight: 0.5,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.5
};
}


function updateMap() {
  	geojson.eachLayer(function(layer){
		layer.setStyle(style(layer.feature));
	}); 
  	document.getElementById("dyninput1").innerHTML = " - " + classif[0].toString();
  	document.getElementById("dyninput2").innerHTML = " - " + classif[1].toString();
  	document.getElementById("dyninput3").innerHTML = " - " + classif[2].toString();
  	document.getElementById("dyninput4").innerHTML = " - " + classif[3].toString();
  };

inputs.forEach(function (input, handle) {
	    input.addEventListener('change', updateMap)});

slider.noUiSlider.on('update', updateMap);
		

var mapControlsContainer = document.getElementsByClassName("leaflet-control")[0];
var logoContainer = document.getElementById("logoContainer");

mapControlsContainer.appendChild(logoContainer);

var div = L.DomUtil.get('logoContainer'); // this must be an ID, not class!
L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);


var lat, lon; 
var apiurl, picurl, address;
var rad = parseFloat(1);
var num = parseFloat(10);

var Icon1 = L.icon({
    iconUrl: 'target.png',
    iconSize:     [30, 30], // size of the icon
    iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
});

var mymarker = L.marker(
            [0, 0],
            {icon: Icon1}
    ).addTo(mymap);

function myFunction() {
  var x = document.getElementById("frm1");
  rad = parseFloat(x.elements[0].value);
  num = parseFloat(x.elements[1].value);
  window.alert("New Markers will now have specified radius of "+rad.toString(10)+" km and will show " +num.toString(10)+ " pictures")
}
var arr = ['<div class = "popup">']

//this function is called when the user clicks the map
mymap.on("click", function(e){
// in order to force the order in which the methods are run
// we use a technique called callbacks, which calls methods 
// in an order such that they only run when we want 

// gets street address from passed lat lon values
function getAddress(other){
	$.get('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+ e.latlng.lat.toString(10) +'&lon='+e.latlng.lng.toString(10), function(data){
	    address = data.address;
	});
	other(makeMarker);
}

// pulls the actual flickr data nearby the point
function doJson(other){
	$.getJSON("https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ca370d51a054836007519a00ff4ce59e&per_page="+num.toString(10)+"&format=json&nojsoncallback=1&privacy_filter=1& accuracy=16&lat="+e.latlng.lat.toString(10)+"&lon="+e.latlng.lng.toString(10)+"&radius="+rad.toString(10),function(json){
	    if(parseInt(json.photos.total)>0){
	    arr.push("<h3>Total Pictures Found: "+json.photos.total.toString(10)+" at a radius of "+ rad.toString(10) +" km</h3>");
	    $.each(json.photos.photo,function(i,result){
	    picurl = "https://farm"+result.farm +".staticflickr.com/"+result.server +"/"+result.id+"_"+ result.secret+".jpg";
	    arr.push('<img src="'+picurl+'"/><br>'+result.title+'<br><br>');
	    })
	    arr.push("<p><h3>Nearest Address</h3>Road: " + address.road + "<br>City: "+address.city+"<br> Postcode: "+ address.postcode + "<br> Country: " + address.country +"</p><p><h3>Coordinates</h3>Latitude: " + e.latlng.lat.toString(10) + "<br>Longitude: " + e.latlng.lng.toString(10) + "</p><p>Displaying Maximum of " +num.toString(10)+ " pictures</p>")
	    }
	    else{
	        arr.push('<p>No Images Found</p>')
	    }
	    arr.push('<form id = "frm1">Radius:<br><input type="text" name="rad" id="radius" value="1"><br>Number of Pictures: <br><input type="text" name="pics" id="picture" value="10"><br><br><button type="button" onclick="myFunction();">Change</button></form>')
	    other();
	})
}

// makes the marker with all of the info passed in the getJson function
function makeMarker(){
    arr.push("<div>")
		var newLatLng = new L.LatLng(e.latlng.lat, e.latlng.lng);
	mymarker.setLatLng(newLatLng); 
    var allpics = arr.toString();
    allpics = allpics.replace(/,/g, "");
    mymarker.bindPopup(allpics).openPopup().setOpacity(0);
    picurl = ""
    arr = ['<div class = "popup">']

}

getAddress(doJson);

})
