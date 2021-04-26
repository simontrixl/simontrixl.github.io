let basemapGray = L.tileLayer.provider('BasemapAT.grau'); //https://leafletjs.com/reference-1.7.1.html#tilelayer

let map = L.map("map", { //https://leafletjs.com/reference-1.7.1.html#map-l-map
    center: [47, 11],
    zoom: 10,
    layers: [
        basemapGray
    ]
});

let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    snowheight: L.featureGroup(),
    windspeed: L.featureGroup(),
    relLuft: L.featureGroup(),
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
    "Windgeschwindigkeit km/h": overlays.windspeed,
    "Luftfeuchtigkeit": overlays.relLuft,
    "Windrichtung": overlays.winddirection
}, {
    collapsed: false
}).addTo(map);
overlays.temperature.addTo(map);

L.control.scale({
    imperial: false
}).addTo(map);

let getColor = (value, colorRamp) => {
    //console.log("Wert:", value, "Palette:", colorRamp);
    for (let rule of colorRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.col;
        }
    }
    return "black";
};

let newLabel = (coords, options) => {
    let color = getColor(options.value, options.colors);
    //console.log("Wert", options.value, "bekommt Farbe:", color);
    let label = L.divIcon({
        html: `<div style="background-color: ${color}">${options.value}</div>`,
        className: "text-label"
    })
    let marker = L.marker([coords[1], coords[0]], {
        icon: label,
        title: `${options.station} (${coords[2]}m)`
    });
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
            // console.log('Station: ', station);
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
            if (typeof station.properties.HS == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.HS.toFixed(0),
                    colors: COLORS.snowheight,
                    station: station.properties.name
                });
                marker.addTo(overlays.snowheight);
            }
            if (typeof station.properties.WG == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.WG.toFixed(0),
                    colors: COLORS.windspeed,
                    station: station.properties.name
                });
                marker.addTo(overlays.windspeed);
            }

            if (typeof station.properties.HR == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.HR.toFixed(1),
                    colors: COLORS.relLuft,
                    station: station.properties.name
                });
                marker.addTo(overlays.relLuft);               
            
            }
            if (typeof station.properties.LT == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT.toFixed(1),
                    colors: COLORS.temperature,
                    station: station.properties.name
                });
                marker.addTo(overlays.temperature);
            }

        }
        // set map view to all station
        map.fitBounds(overlays.stations.getBounds());
    });




// Werte mit 0 habe ich in eine eig Klasse getan, da ja negativ=blau und positiv=grün.. bin mir aba nit sicher ob das stimmt 