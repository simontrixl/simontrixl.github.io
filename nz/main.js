
let stop={
     nr: 14,
     name: "Haast",
     lat: -43.881111,
     lng: 169.042222,
     user: "simontrixl",
     wikipedia: "https://en.wikipedia.org/wiki/Haast_River"

};




const map = L.map("map" ,{
    center: [ stop.lat, stop.lng ],
    zoom: 13, 
    layers: [
        L.tileLayer ("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});
//-43.881111, 169.042222 Koordinaten von Haast

console.log(ROUTE);

for (let entry of ROUTE) {
    console.log(entry);

    let mrk =L.marker([entry.lat, entry.lng]).addTo(map);
    mrk.bindPopup(
        `${entry.name}
        <p><i class="fas fa-external-link-alt"></i><a href="${entry.wikipedia}">Read about stop in Wikipedia</a></p>
        `).openPopup(); 

}



//console.log(document.querySelector("#map")); 

