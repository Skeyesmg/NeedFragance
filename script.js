const WHATSAPP = "56930241024";

// Productos: nombre, descripción, tamaño, precio CLP, familia, fotografía.
const products = [
  ["Eclaire EDP","Dulce y cremoso, con acordes de caramelo, leche, miel y vainilla.","100 ml",29990,"Gourmand","eclaire.jpg"],
  ["Good Girl Blush Elixir","Rosa, vainilla y pachulí en una composición intensa y sensual.","80 ml",89990,"Floral dulce","good-girl-blush.jpg"],
  ["Bianco Latte","Una mezcla cálida y envolvente de caramelo, miel, vainilla y almizcle.","100 ml",139990,"Gourmand","bianco-latte.jpg"],
  ["Athena Velixir","Fragancia intensa y sofisticada, ideal para dejar una presencia marcada.","100 ml",44990,"Intenso","athena.jpg"],
  ["Azzaro Parfum","Carácter cálido, elegante y seductor para ocasiones especiales.","100 ml",92990,"Amaderado","azzaro.jpg"],
  ["Power Of You","Acordes frutales, florales y gourmand con un carácter luminoso.","90 ml",109990,"Frutal floral","power-of-you.jpg"],
  ["Prada Paradigme EDP","Acordes ambarados y amaderados de estilo moderno y sofisticado.","100 ml",84990,"Ambarado","prada-paradigme.jpg"],
  ["Hawas Ice","Fresco, dulce y energético, con un carácter acuático y frutal.","100 ml",36990,"Acuático","hawas-ice.jpg"],
  ["Hawas Fire","Una combinación cálida y especiada con un fondo profundo.","100 ml",39990,"Especiado","hawas-fire.jpg"],
  ["Althair Parfums de Marly","Vainilla, canela, ámbar y maderas en un aroma cálido y elegante.","125 ml",259990,"Vainilla amaderada","althair.jpg"],
  ["Summer Hammer","Una fragancia fresca, vibrante y moderna, ideal para días cálidos.","100 ml",164990,"Fresco","summer-hammer.jpg"],
  ["Yara Elixir","Dulce, cremoso y envolvente, con un carácter gourmand.","100 ml",29990,"Gourmand femenino","yara-elixir.jpg"],
  ["212 Vip Rose Nyc Cab","Femenino, juvenil y elegante, inspirado en la energía nocturna de Nueva York.","80 ml",79990,"Floral fresco","212-vip-rose.jpg"],
  ["Lorenzo Pazzaglia Tropikalys Karma","Aroma tropical y exótico, con frutas y acordes cálidos.","50 ml",164990,"Tropical","tropikalys-karma.jpg"],
  ["Oud Profundo","Oud camboyano, rosa turca y ámbar. Lujo ancestral redefinido.","50 ml",72000,"Oriental amaderado","61GUf9792XL._SL1000_.-700x700.jpg"]
].map(([name,description,size,price,family,img])=>({name,description,size,price,family,img}));

const $ = selector => document.querySelector(selector);
const byName = new Map(products.map(product=>[product.name,product]));
const money = new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0});
const normalize = value => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const grid = $("#product-grid");
const drawer = $("#bag-drawer");
const scrim = $("#drawer-scrim");
const checkout = $("#checkout");

let bag = {};
try { bag = JSON.parse(localStorage.getItem("need-bag")) || {}; } catch(error) { bag = {}; }
Object.keys(bag).forEach(name=>{if(!byName.has(name)||!Number.isInteger(bag[name])||bag[name]<1)delete bag[name];});

function imageMarkup(product,alt=""){
  return product.img
    ? `<img src="${product.img}" alt="${alt || product.name}" loading="lazy">`
    : `<div class="oud-art" role="img" aria-label="Presentación ilustrada de Oud Profundo">
         <span class="oud-art-kicker">NEED · EXCLUSIVE</span>
         <div class="oud-bottle"><span class="oud-cap"></span><span class="oud-label"><b>OUD</b><small>PROFUNDO</small><i>50 ml</i></span></div>
         <span class="oud-art-caption">ORIENTAL · AMADERADO</span>
       </div>`;
}

function setupFamilies(){
  const families = [...new Set(products.map(product=>product.family))].sort((a,b)=>a.localeCompare(b,"es"));
  $("#family-filter").insertAdjacentHTML("beforeend",families.map(family=>`<option value="${family}">${family}</option>`).join(""));
}

function renderGrid(){
  const query = normalize($("#search").value.trim());
  const family = $("#family-filter").value;
  const filtered = products.filter(product=>{
    const matchesText = normalize(`${product.name} ${product.family} ${product.description}`).includes(query);
    return matchesText && (!family || product.family===family);
  });

  grid.innerHTML = filtered.map(product=>`
    <article class="product-card">
      <div class="product-media">
        ${imageMarkup(product,`${product.name}, ${product.size}`)}
        <span class="product-tag">${product.family}</span>
      </div>
      <div class="product-info">
        <p class="product-family">${product.family}</p>
        <h3>${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-bottom">
          <div class="product-price"><small>${product.size}</small><strong>${money.format(product.price)}</strong></div>
          <button class="add-button" type="button" data-add="${product.name}">Agregar +</button>
        </div>
      </div>
    </article>`).join("");

  $("#no-results").hidden = filtered.length>0;
  $("#result-count").textContent = `${filtered.length} FRAGANCIA${filtered.length===1?"":"S"}`;
}

function updateBag(){
  const rows = Object.entries(bag).map(([name,quantity])=>({product:byName.get(name),quantity}));
  const count = rows.reduce((sum,row)=>sum+row.quantity,0);
  const total = rows.reduce((sum,row)=>sum+row.product.price*row.quantity,0);

  $("#bag-count").textContent = count;
  $("#subtotal").textContent = money.format(total);
  $("#bag-empty").hidden = rows.length>0;
  $("#bag-list").innerHTML = rows.map(({product,quantity})=>`
    <li class="bag-item">
      <div class="bag-thumb">${imageMarkup(product)}</div>
      <div class="bag-info">
        <div class="bag-top"><strong class="bag-name">${product.name}</strong><button class="remove-item" type="button" data-action="remove" data-name="${product.name}" aria-label="Eliminar ${product.name}">×</button></div>
        <p class="bag-price">${product.size} · ${money.format(product.price)}</p>
        <div class="quantity"><button type="button" data-action="decrease" data-name="${product.name}" aria-label="Quitar una unidad">−</button><span>${quantity}</span><button type="button" data-action="increase" data-name="${product.name}" aria-label="Agregar una unidad">+</button></div>
      </div>
    </li>`).join("");

  if(rows.length){
    const lines = rows.map(({product,quantity})=>`${quantity} x ${product.name} (${product.size}) - ${money.format(product.price*quantity)}`).join("\n");
    const message = `Hola, quiero coordinar este pedido de need.fragrances:\n${lines}\n\nTotal: ${money.format(total)}`;
    checkout.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
    checkout.target = "_blank";
    checkout.rel = "noopener";
  }else{
    checkout.href = "#coleccion";
    checkout.target = "_self";
    checkout.removeAttribute("rel");
  }
  try{localStorage.setItem("need-bag",JSON.stringify(bag));}catch(error){}
}

function changeQuantity(name,delta){
  const next = (bag[name]||0)+delta;
  if(next>0)bag[name]=next;else delete bag[name];
  updateBag();
}

let previousFocus = null;
function setDrawer(open){
  if(open)previousFocus=document.activeElement;
  drawer.classList.toggle("open",open);
  scrim.classList.toggle("open",open);
  drawer.setAttribute("aria-hidden",String(!open));
  document.body.classList.toggle("lock",open);
  if(open)$("#close-bag").focus();
  else if(previousFocus)previousFocus.focus({preventScroll:true});
}

document.addEventListener("click",event=>{
  const addButton=event.target.closest("[data-add]");
  const actionButton=event.target.closest("[data-action]");
  if(addButton){
    changeQuantity(addButton.dataset.add,1);
    const original=addButton.textContent;
    addButton.textContent="Agregado ✓";
    addButton.disabled=true;
    setTimeout(()=>{addButton.textContent=original;addButton.disabled=false;},1000);
  }
  if(actionButton){
    const {action,name}=actionButton.dataset;
    if(action==="remove")delete bag[name];
    if(action==="increase")changeQuantity(name,1);
    if(action==="decrease")changeQuantity(name,-1);
    if(action==="remove")updateBag();
  }
});

$("#search").addEventListener("input",renderGrid);
$("#family-filter").addEventListener("change",renderGrid);
$("#open-bag").addEventListener("click",()=>setDrawer(true));
$("#close-bag").addEventListener("click",()=>setDrawer(false));
$("#continue-shopping").addEventListener("click",()=>setDrawer(false));
$("#empty-explore").addEventListener("click",()=>setDrawer(false));
scrim.addEventListener("click",()=>setDrawer(false));
checkout.addEventListener("click",()=>{if(!Object.keys(bag).length)setDrawer(false);});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&drawer.classList.contains("open"))setDrawer(false);});

setupFamilies();
renderGrid();
updateBag();
