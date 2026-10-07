const houses=window.HOUSES||[];
const map=L.map("map",{zoomControl:true}).setView([42.05,-73.9],8);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
const layer=L.layerGroup().addTo(map), markers=[];
const $=id=>document.getElementById(id);
const money=v=>v?new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(v):"";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function icon(score){return L.divIcon({className:"",html:`<div class="score-marker marker${score}">${score}</div>`,iconSize:[30,30],iconAnchor:[15,15]})}
function cacheKey(a){return "hvgeo:"+a.toLowerCase()}
async function geocode(address){
  const cached=localStorage.getItem(cacheKey(address)); if(cached)return JSON.parse(cached);
  const url="https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q="+encodeURIComponent(address);
  const res=await fetch(url,{headers:{"Accept":"application/json"}});
  if(!res.ok)throw new Error("Geocoder unavailable");
  const rows=await res.json(); if(!rows.length)return null;
  const p={lat:+rows[0].lat,lng:+rows[0].lon}; localStorage.setItem(cacheKey(address),JSON.stringify(p)); return p;
}
function showHouse(h){
  $("empty").hidden=true;$("card").hidden=false;
  $("photo").src=h.picUrl;$("photo").alt="Photo of "+h.address;
  $("scoreBadge").textContent="Score "+h.score;$("scoreBadge").className="badge"+h.score;
  $("region").textContent=h.Where||"";$("address").textContent=h.address;
  $("price").textContent=money(h.Price);
  const facts=[]; if(h.Beds)facts.push(h.Beds+" beds");if(h.Baths)facts.push(h.Baths+" baths");if(h["Sq ft"])facts.push(Number(h["Sq ft"]).toLocaleString()+" sq ft");if(h.Acreage)facts.push(h.Acreage+" acres");
  $("facts").textContent=facts.join(" · ");
  const features=[];["Pool","Hot tub","Pond/stream","Barn"].forEach(k=>{if(h[k]&&String(h[k]).toLowerCase()!=="no"&&String(h[k]).toLowerCase()!=="n")features.push(k+": "+h[k])});
  $("features").textContent=features.join(" · ");
  $("comments").textContent=h.Comments||"";$("comments").hidden=!h.Comments;
  $("zillow").href=h.zillow;
  $("directions").href="https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(h.address);
  if(innerWidth<=760)$("panel").scrollIntoView({behavior:"smooth",block:"start"});
}
function render(score="all"){
  layer.clearLayers(); const visible=markers.filter(x=>score==="all"||x.house.score===+score);
  visible.forEach(x=>x.marker.addTo(layer));
  if(visible.length){const group=L.featureGroup(visible.map(x=>x.marker));map.fitBounds(group.getBounds().pad(.15),{maxZoom:11})}
  $("status").textContent=visible.length+" scored properties";
}
async function init(){
  $("status").textContent="Locating "+houses.length+" properties…";
  let failed=0;
  for(let i=0;i<houses.length;i++){
    const h=houses[i];$("status").textContent="Locating "+(i+1)+" of "+houses.length+"…";
    try{
      const p=await geocode(h.address);if(!p){failed++;continue}
      const marker=L.marker([p.lat,p.lng],{icon:icon(h.score),title:h.address});
      marker.bindTooltip(esc(h.address),{direction:"top"});marker.on("click",()=>showHouse(h));
      markers.push({marker,house:h});
    }catch(e){failed++}
    await new Promise(r=>setTimeout(r,1050));
  }
  render(); if(failed)$("status").textContent=markers.length+" properties mapped · "+failed+" need coordinate review";
}
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.score)}));
init();