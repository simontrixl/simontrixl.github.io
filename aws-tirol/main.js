
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
    "BasemapAT.orthofoto": L.tilelayer.provider('BasemapAT.orthofoto')
}).addTo(map);