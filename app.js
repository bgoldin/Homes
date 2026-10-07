const houses=window.HOUSES||[];
const map=L.map("map",{zoomControl:true}).setView([42.05,-73.9],8);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
const layer=L.layerGroup().addTo(map),markers=[];
const $=id=>document.getElementById(id);
const money=v=>v?new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(v):"";
function icon(s){return L.divIcon({className:"",html:`<div class="score-marker marker${s}">${s}</div>`,iconSize:[30,30],iconAnchor:[15,15]})}
function show(h){
 $("empty").hidden=true;$("card").hidden=false;
 $("photo").src=h.picUrl;$("photo").alt="Photo of "+h.address;
 $("scoreBadge").textContent="Score "+h.score;$("scoreBadge").className="badge"+h.score;
 $("region").textContent=h.Where||"";$("address").textContent=h.address;$("price").textContent=money(h.Price);
 const f=[];if(h.Beds)f.push(h.Beds+" beds");if(h.Baths)f.push(h.Baths+" baths");if(h["Sq ft"])f.push(Number(h["Sq ft"]).toLocaleString()+" sq ft");if(h.Acreage)f.push(h.Acreage+" acres");$("facts").textContent=f.join(" · ");
 const z=[];["Pool","Hot tub","Pond/stream","Barn"].forEach(k=>{if(h[k]&&String(h[k]).toLowerCase()!=="no"&&String(h[k]).toLowerCase()!=="n")z.push(k+": "+h[k])});$("features").textContent=z.join(" · ");
 $("comments").textContent=h.Comments||"";$("comments").hidden=!h.Comments;
 $("zillow").href=h.zillow;$("directions").href="https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(h.address);
 if(innerWidth<=760)$("panel").scrollIntoView({behavior:"smooth",block:"start"});
}
houses.forEach(h=>{
 if(!Number.isFinite(h.lat)||!Number.isFinite(h.lng))return;
 const m=L.marker([h.lat,h.lng],{icon:icon(h.score),title:h.address});
 m.bindTooltip(h.address,{direction:"top"});m.on("click",()=>show(h));markers.push({marker:m,house:h});
});
const unresolved=houses.length-markers.length;
function render(s="all"){
 layer.clearLayers();const v=markers.filter(x=>s==="all"||x.house.score===+s);v.forEach(x=>x.marker.addTo(layer));
 if(v.length){const g=L.featureGroup(v.map(x=>x.marker));map.fitBounds(g.getBounds().pad(.15),{maxZoom:11})}
 $("status").textContent=v.length+" mapped properties"+(s==="all"&&unresolved?" · "+unresolved+" awaiting coordinate review":"");
}
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.score)}));
render();