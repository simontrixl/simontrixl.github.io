const map = L.map("map" ,{
    center: [ -43.881111, 169.042222 ],
    zoom: 13, 
    layers: [
        L.tileLayer ("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});
//-43.881111, 169.042222 Koordinaten von Haast

let mrk =L.marker([-43.881111, 169.042222]).addTo(map);
mrk.bindPopup("Haast").openPopup();

console.log(document.querySelector("#map"));
