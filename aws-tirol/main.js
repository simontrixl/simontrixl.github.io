
let basemapGray = L.tileLayer.provider ('BasemapAT.grau');

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
awsLayer.addTo(map);

fetch(awsUrl)
    .then(response => response.json())
    .then(json => {
    console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            //console.log('Station: ', station);
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
            </ul>
            `);
            marker.addTo(awsLayer);
    }
    // set map view to all station
    map.fitBounds(awsLayer.getBounds());
});