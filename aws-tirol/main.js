let basemapGray = L.tileLayer.provider('BasemapAT.grau'); //https://leafletjs.com/reference-1.7.1.html#tilelayer

let map = L.map("map", { //https://leafletjs.com/reference-1.7.1.html#map-l-map
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray
    ]
});

let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    snowheight: L.featureGroup(),
    windspeed: L. featureGroup(),
    winddirection: L.featureGroup(),
};

let layerControl = L.control.layers({ //https://leafletjs.com/reference-1.7.1.html#control-layers-l-control-layers
    "BasemapAT.grau": basemapGray,
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    "BasemapAT.highdpi": L.tileLayer.provider('BasemapAT.highdpi'),
    "BasemapAT.overlay": L.tileLayer.provider('BasemapAT.overlay'),
    "Basemap.overlay+orthofoto": L.layerGroup([ //https://leafletjs.com/reference-1.7.1.html#layergroup-l-layergroup
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay'),
    ])
}, {
    "Wetterstationen Tirol": overlays.stations, 
    "Temperatur  Grad ": overlays.temperature,
    "Schneehöhe cm": overlays.snowheight,
    "Windgeschwindigkeit km/h":overlays.windspeed,
    "Windrichtung": overlays.winddirection
}, {
    collapsed: false
}).addTo(map);
overlays.temperature.addTo(map);

L.control.scale({
    imperial: false
}).addTo(map);

let newLabel = (coords, options) => {
    console.log("Koordinaten coords: ", coords);
    console.log("Optionsobjekt:", options);
    let marker = L.marker([coords[1], coords[0]]);
    console.log ("Marker:", marker);
    return marker;
};

let awsUrl = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

//let awsLayer = L.featureGroup(); //https://leafletjs.com/reference-1.7.1.html#featuregroup-l-featuregroup
//layerControl.addOverlay(awsLayer, "Wetterstationen Tirol");
//awsLayer.addTo(map);

//let snowLayer = L.featureGroup();
//layerControl.addOverlay(snowLayer, "Schneehöhe");
//snowLayer.addTo(map);

//let windLayer = L.featureGroup();
//layerControl.addOverlay(windLayer, "Windgeschwindigkeit");
//windLayer.addTo(map);

//let luftLayer = L.featureGroup();
//layerControl.addOverlay(luftLayer, "Lufttemperatur");
//luftLayer.addTo(map);

fetch(awsUrl)
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            console.log('Station: ', station);
            let marker = L.marker([ //https://leafletjs.com/reference-1.7.1.html#marker-l-marker
                station.geometry.coordinates[1],
                station.geometry.coordinates[0]
            ]);

            let formattedDate = new Date(station.properties.date);

            marker.bindPopup(`
            <h3>${station.properties.name}</h3>
            <ul>
                <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                <li>Temperatur:${station.properties.LT ||'?'} C</li> 
                <li>Luftdruck:${station.properties.LD || '?'} </li>
                <li>Schneehöhe:${station.properties.HS} cm</li>
                <li>Luftfeuchtigkeit:${station.properties.RH || '?'} %</li>
                <li>Windgeschwindigkeit: ${station.properties.WG || '?'}km/h</li>
                <li>Seehöhe: ${station.geometry.coordinates[2]} m.ü.A</li>
            </ul>
            <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);

            marker.addTo(overlays.stations);
            if (typeof station.properties.HS =="number") {
                let highlightClass = '';
                if (station.properties.HS > 100) {
                    highlightClass = 'snow-100';
                }
                if (station.properties.HS > 200) {
                    highlightClass = 'snow-200';
                }
                let snowIcon = L.divIcon({ //https://leafletjs.com/reference-1.7.1.html#divicon-l-divicon
                    html: `<div class="snow-label ${highlightClass}">${station.properties.HS}</div>`
                })
                let snowMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: snowIcon
                });
                snowMarker.addTo(overlays.snowheight);
            }

            marker.addTo(overlays.stations);
            if (typeof station.properties.WG == "number") {
                let highlightClass = '';
                if (station.properties.WG > 10) {
                    highlightClass = 'wind-10';
                }
                if (station.properties.WG > 20) {
                    highlightClass = 'wind-20';
                }
                let windIcon = L.divIcon({
                    html: `<div class="wind-lable ${highlightClass}">${station.properties.WG}</div>`
                });
                let windMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: windIcon
                });
                windMarker.addTo(overlays.windspeed);
            }
            if (typeof station.properties.LT =="number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT
                });
                marker.addTo(overlays.temperature);
            
            }

        }
        // set map view to all station
        map.fitBounds(overlays.stations.getBounds());
    });


    

// Werte mit 0 habe ich in eine eig Klasse getan, da ja negativ=blau und positiv=grün.. bin mir aba nit sicher ob das stimmt 