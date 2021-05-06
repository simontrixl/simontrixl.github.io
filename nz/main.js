let stop = {
    nr: 14,
    name: "Haast",
    lat: -43.881111,   
    lng: 169.042222,
    user: "simontrixl",
    wikipedia: "https://en.wikipedia.org/wiki/Haast_River"

};


const map = L.map("map", {
    //center: [ stop.lat, stop.lng ],
    //zoom: 13, 
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});

console.log(ROUTE);

let nav = document.querySelector("#navigation");

ROUTE.sort((stop1, stop2) => {
    return stop1.nr > stop2.nr
});

for (let entry of ROUTE) {
    console.log(entry);

    nav.innerHTML += `
        <option value="${entry.user}">Stop ${entry.nr}: ${entry.name}</option>
    `;

    let mrk = L.marker([entry.lat, entry.lng]).addTo(map);
    mrk.bindPopup(`
    ${entry.nr}: ${entry.name}:
        <p><i class="fas fa-external-link-alt"></i><a href="${entry.wikipedia}">Read about stop in Wikipedia</a></p>
    `);

    if (entry.nr == 14) {
        map.setView([entry.lat, entry.lng], 13);
        mrk.openPopup();
    }
}
nav.options.selectedIndex = 14 - 1;
nav.onchange = (evt) => {
    let selected = evt.target.selectedIndex;
    let options = evt.target.options;
    let username = options[selected].value;
    let link = `https://${username}.github.io/nz/index.html`;
    console.log(username, link);

    window.location.href = link;
};

//minimap
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"), {
        toggleDisplay: true,
        minimized: false,
    }
).addTo(map);



//console.log(document.querySelector("#map")); 


//<option value="simontrixl">Haast</option>