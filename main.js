const request = require('request');
const fs = require('fs');
// https://www.motorsportreg.com/calendar/autocross/US/?country=US&radius=9999&lat=39.29&lng=-84.53&loc=Parkdale%2C+OH+45240%2C+USA&types=autocross
// https://www.motorsportreg.com/calendar/autocross/US/?country=US&radius=9999&lat=39.29&lng=-84.53&loc=Parkdale%2C+OH+45240%2C+USA&types=autocross&page=2


var markers = true; // do we create the marker based maps. Stored in webpages folder
var heat = false; // do we create the heatmap based maps. 

//getInitLinks();
//correctXML(); 
createWebPages();

function correctXML() {
	fs.readdirSync('./Events/').forEach(file => {
		fs.readFile('./Events/' + file, 'ascii', function(err, data) {
			if (data[data.length - 1] != '</' + file.replace('.xml','') + '>') {
				fs.appendFileSync('./Events/' + file, '</' + file.replace('.xml','') + '>\r\n');
			}
		});
	});
}


function getInitLinks() {
	// please not this creates the list of pages to parse based on XML names, so if you rest this then the files need emptied. 
	// if used enough I'll automate it 
	fs.readdirSync('./Events/').forEach(field => {
		fs.writeFileSync('./Events/' + field, '');
		fs.appendFileSync('./Events/' + field, '<' + field.replace('.xml','') + '>\r\n');
		for (var k = 0; k < 11; k++) { // 11 was the most pages I saw, so running with it. May increase for safety when seasons refresh next year
			var page = '/&page=' + (k + 1)
			if (k == 0) {
				page = '';
			}
			// '/US/?country=US&radius=9999&lat=39.29&lng=-84.53&loc=Parkdale%2C+OH+45240%2C+USA'
			request('https://www.motorsportreg.com/calendar/' + field.replace('.xml','') + page, function (error, response, body) {
				var links = [];
				var names = [];
				var lines = body.split('\n'); 
				for (var i = 0; i < lines.length; i++) {
					// <h3 class="title"><a itemprop="url" href="/events/2020-hscc-day-series-special-event-wnc-agricultural-center-highlands-296692" class=""><span itemprop="name">2020 HSCC Independence Day Special Event</span></a></h3>
					if (lines[i].includes('<h3 class="title"><a itemprop="url" href="') && lines[i].includes('" class=""><span itemprop="name">') && lines[i].includes('</span></a></h3>')) {
						var link = lines[i].split('<h3 class="title"><a itemprop="url" href="');
						
						link = link[1].split('" class=""><span itemprop="name">');
						var name = link[1].split('</span></a></h3>');
						
						links.push(link[0]);
						names.push(name[0]);
					}
				}
				
				for (var i = 0; i < links.length; i++) {
					getLocations(links[i], names[i], field);
				}
				
			});
		}
	});
}

function getLocations(link, name, field) {
	//console.log(link);
	request('https://www.motorsportreg.com' + link, function (error1, response1, body1) {
		var lati = -1;
		var longi = -1;
		try {
			var lines1 = body1.split('\n');
		} catch (err) {
			console.log('error with event. Would recommend running again. Likely internet hiccup or timeout: \n' + console.log(link));
		}
		for (var j = 0; j < lines1.length; j++) {
			if (lines1[j].includes('<meta property="event:location:latitude" content="')) {
				lati = lines1[j].split('<meta property="event:location:latitude" content="')[1].split('" />')[0];
			} else if (lines1[j].includes('<meta property="event:location:longitude" content="')) {
				longi = lines1[j].split('<meta property="event:location:longitude" content="')[1].split('" />')[0];
			}
		}
		fs.appendFileSync('./Events/' + field, '\t<event>\r\n');
		fs.appendFileSync('./Events/' + field, '\t\t<name>' + name + '</name>\n');
		fs.appendFileSync('./Events/' + field, '\t\t<link>' + link + '</link>\n');
		fs.appendFileSync('./Events/' + field, '\t\t<longitude>' + longi + '</longitude>\n');
		fs.appendFileSync('./Events/' + field, '\t\t<latitude>' + lati + '</latitude>\n');
		fs.appendFileSync('./Events/' + field, '\t</event>\r\n');
	});
}

//************************ONLY USE ABOVE TO POPULATE FRESH XML's **************************************//

//************************BELOW IS EARLY MAPPING OF GOOGLE MAPS ***************************************//
function createWebPages() {
	xml2js = require('xml2js');
	
	var parser = new xml2js.Parser();
	
	fs.readdirSync('./Events/').forEach(file => {
		fs.readFile('./Events/' + file, 'ascii', function(err, data) {
			if (markers) {
				fs.writeFileSync('./Webpages/' + file.replace('xml', 'html'), '');
				fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), '<!DOCTYPE html>\n<html>\n<head>\n<title>Simple Map</title>\n<script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>\n<script\nsrc="https://maps.googleapis.com/maps/api/js?key=AIzaSyDbeBny3tv1AGy8IDMr4OQ8cxo-9dfryb4&callback=initMap&libraries=&v=weekly"\ndefer\n></script>\n<style type="text/css">\n/* Always set the map height explicitly to define the size of the div\n* element that contains the map. */\n#map {\nheight: 100%;\n}\n/* Optional: Makes the sample page fill the window. */\nhtml,\nbody {\nheight: 100%;\nmargin: 0;\npadding: 0;\n}\n</style>\n<script>\n(function(exports) {\n\nfunction initMap() {\nexports.map = new google.maps.Map(document.getElementById("map"), {\ncenter: {lat: 40, lng: -96},\nzoom: 4.5\n});');
			}
			
			if (heat) {
				fs.writeFileSync('./Heatmaps/' + file.replace('xml', 'html'), '');
				fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), '<!DOCTYPE html>\n<html>\n<head>\n<title>Simple Map</title>\n<script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>\n<script\nsrc="https://maps.googleapis.com/maps/api/js?key=AIzaSyDbeBny3tv1AGy8IDMr4OQ8cxo-9dfryb4&callback=initMap&libraries=&v=weekly"\ndefer\n></script>\n<style type="text/css">\n/* Always set the map height explicitly to define the size of the div\n* element that contains the map. */\n#map {\nheight: 100%;\n}\n/* Optional: Makes the sample page fill the window. */\nhtml,\nbody {\nheight: 100%;\nmargin: 0;\npadding: 0;\n}\n</style>\n<script>\n(function(exports) {\n\nfunction initMap() {\nexports.map = new google.maps.Map(document.getElementById("map"), {\ncenter: {lat: 40, lng: -96},\nzoom: 4.5\n});');
			}
			parser.parseString(data.toString(), function (err, result) {
				if (markers) {
					for (var i = 0; i < result[file.replace('.xml', '')].event.length; i++) {
						// for markers uncomment the following lines 
						fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), 'var marker' + i + ' = new google.maps.Marker({\n');
						fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), 'position: {lat: ' + result[file.replace('.xml', '')].event[i].latitude[0] + ', lng: ' + result[file.replace('.xml', '')].event[i].longitude[0] + '},\n');
						fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), 'map: map,\n');
						fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), 'url: \'https://motorsportreg.com' + result[file.replace('.xml', '')].event[i].link[0] + '\',\n');
						fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), 'title: \'' + result[file.replace('.xml', '')].event[i].name[0].toString().replace(/\'/g, "") + '\'\n');
						fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), '});\n');
						
						fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), 'google.maps.event.addListener(marker' + i + ', \'click\', function() {\n');
						fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), 'window.location.href = marker' + i + '.url;\n');
						fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), '});\n');
						/*
						
						google.maps.event.addListener(marker, 'click', function() {
							window.location.href = marker.url;
						});
						*/
					}    
				}
				
				if (heat) {
					// up/down, left/right
	
					// left: -125 
					// right: -66
					// top: 49.5
					// bottom: 25
					
					// length: 59
					// height: 24.5
					
					// holy slow down following. I'm so sorry 
					var accuracy = .1; // can increase or decrease accuracy here. 
					for (var i = -126; i < -65; i = i + accuracy) { // for length of US
						for (var j = 24; j < 50; j = j + accuracy) { // for height of US
							// realistically should filter by water and by if not in the US, but both of those API's cost money and I'm not about that. 
							var eventCount = 0;
							for (var k = 0; k < result[file.replace('.xml', '')].event.length; k++) {
								if (distance(j, parseFloat(result[file.replace('.xml', '')].event[k].latitude[0]), i, parseFloat(result[file.replace('.xml', '')].event[k].longitude[0])) < 90) {
									eventCount++;
								}
							}
							
							var opacity = eventCount * 0.01; // if 10 or more events then be completely colored. Can decrease later
							if (opacity > 0) {
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'var rectangle = new google.maps.Rectangle({\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'strokeColor: \'#FF0000\',\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'strokeOpacity: 0,\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'strokeWeight: 0,\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'fillColor: \'#ff0008\',\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'fillOpacity: ' + opacity + ',\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'map: map,\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'bounds: {\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'north: ' + (j + .099) + ',\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'south: ' + (j - .099) + ' ,\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'east: ' + (i + .099) + ',\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), 'west: ' + (i - .099) + ',\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), '}\n');
								fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), '});\n');
							}
						}
					}
					// https://api.onwater.io/api/v1/results/[latitude],[longitude]?access_token=EQfZzbPGcTC8yxEbhg-s
					// save this for later. Check if location is on water, but low usage limit so will take extra long.
					//request('https://api.onwater.io/api/v1/results/38.9140465608,-76.8778635441?access_token= enter key here', function (error, response, body) {
					//	console.log(body);
					//});
				}
			});
	
			if (markers) {
				fs.appendFileSync('./Webpages/' + file.replace('xml', 'html'), '}\nexports.initMap = initMap;\n})((this.window = this.window || {}));\n</script>\n</head>\n<body>\n<div id="map"></div>\n</body>\n</html>');
			} 
			
			if (heat) {
				fs.appendFileSync('./Heatmaps/' + file.replace('xml', 'html'), '}\nexports.initMap = initMap;\n})((this.window = this.window || {}));\n</script>\n</head>\n<body>\n<div id="map"></div>\n</body>\n</html>');
			}
		});
	});
}

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}


// thanks geeks to geeks. I'm too lazy to figure this out
function distance(lat1, lat2, lon1, lon2) { 

    // The math module contains a function 
    // named toRadians which converts from 
    // degrees to radians. 
    lon1 = degrees_to_radians(lon1); 
    lon2 = degrees_to_radians(lon2); 
    lat1 = degrees_to_radians(lat1); 
    lat2 = degrees_to_radians(lat2); 

    // Haversine formula  
    var dlon = lon2 - lon1;  
    var dlat = lat2 - lat1; 
    var a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2),2); 
          
    var c = 2 * Math.asin(Math.sqrt(a)); 

    // Radius of earth in kilometers. Use 3956  
    // for miles 
    var r = 3956; 

    // calculate the result 
    return(c * r); 
}  
