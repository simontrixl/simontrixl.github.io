let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray
    ]
});

let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    "BasemapAT.highdpi": L.tileLayer.provider('BasemapAT.highdpi'),
    "BasemapAT.overlay": L.tileLayer.provider('BasemapAT.overlay'),
    "Basemap.overlay+orthofoto": L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay'),
    ])
}).addTo(map);



let awsUrl = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

let awsLayer = L.featureGroup();
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol");
//awsLayer.addTo(map);

let snowLayer = L.featureGroup();
layerControl.addOverlay(snowLayer, "Schneehöhe");
//snowLayer.addTo(map);

let windLayer = L.featureGroup();
layerControl.addOverlay(windLayer, "Windgeschwindigkeit");
windLayer.addTo(map);

let luftLayer = L.featureGroup();
layerControl.addOverlay(luftLaywer, "Lufttemperatur");
luftLayer.addTo(map);

fetch(awsUrl)
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            console.log('Station: ', station);
            let marker = L.marker([
                station.geometry.coordinates[1],
                station.geometry.coordinates[0]
            ]);
            let formattedDate = new Date(station.properties.date);
            marker.bindPopup(`
            <h3>${station.properties.name}</h3>
            <ul>
                <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                <li>Temperatur:${station.properties.LT} C</li>
                <li>Luftdruck:${station.properties.LD || '?'} </li>
                <li>Schneehöhe:${station.properties.HS} cm</li>
                <li>Luftfeuchtigkeit:${station.properties.RH || '?'} %</li>
                <li>Windgeschwindigkeit: ${station.properties.WG || '?'}km/h</li>
                <li>Seehöhe: ${station.geometry.coordinates[2]} m</li>
            </ul>
            <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);

            marker.addTo(awsLayer);
            if (station.properties.HS) {
                let highlightClass = '';
                if (station.properties.HS > 100) {
                    highlightClass = 'snow-100';
                }
                if (station.properties.HS > 200) {
                    highlightClass = 'snow-200';
                }
                let snowIcon = L.divIcon({
                    html: `<div class="snow-label ${highlightClass}">${station.properties.HS}</div>`
                })
                let snowMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: snowIcon
                });
                snowMarker.addTo(snowLayer);
            }

            marker.addTo(awsLayer);
            if (station.properties.WG) {
                let highlightClass = '';
                if (station.properties.WG > 10) {
                    highlightClass = 'wind-10';
                }
                if (station.properties.WG > 20) {
                    highlightClass = 'wind-20';
                }
                let windIcon = L.divIcon({
                    html: `<div class="wind-lable ${highlightClass}">${station.properties.WG}</div>`
                })
                let windMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: windIcon
                });
                windMarker.addTo(windLayer);
            }
        }
        // set map view to all station
        map.fitBounds(awsLayer.getBounds());
    });