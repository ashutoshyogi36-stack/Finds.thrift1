const demoProducts=[
{id:"demo1",name:"Stussy Script Tee",cat:"T-Shirts",price:1299,cond:"Good",size:"M",stock:1,img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80"},
{id:"demo2",name:"Vintage Green Sweatshirt",cat:"Hoodies",price:1499,cond:"Excellent",size:"L",stock:1,img:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80"},
{id:"demo3",name:"Classic Denim Jacket",cat:"Jackets",price:2199,cond:"Very Good",size:"L",stock:1,img:"https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=80"}];

let products=[...demoProducts], cart=[], settings={whatsapp:"",instagram:"",email:"",shipping_text:"Shipping timelines can vary by location.",return_text:"Please confirm exchange/return rules before ordering.",about_text:"finds.thrift1 is a curated thrift destination for people who want distinctive clothing without the mass-produced feel."};
let db=null;

function configured(){return window.FINDS_CONFIG && !window.FINDS_CONFIG.SUPABASE_URL.startsWith("PASTE_") && !window.FINDS_CONFIG.SUPABASE_ANON_KEY.startsWith("PASTE_") && window.supabase;}
async function init(){
  if(configured()){
    db=window.supabase.createClient(FINDS_CONFIG.SUPABASE_URL,FINDS_CONFIG.SUPABASE_ANON_KEY);
    const {data,error}=await db.from("products").select("*").order("created_at",{ascending:false});
    if(!error && data && data.length) products=data.map(normalizeProduct);
    const s=await db.from("settings").select("*").eq("id",1).maybeSingle();
    if(!s.error && s.data) settings={...settings,...s.data};
  }
  applySettings(); renderCategories(); renderProducts(); updateCart();
}
function normalizeProduct(p){return {...p,id:p.id,cat:p.category||p.cat,price:Number(p.price)||0,img:p.image_url||p.img||"",stock:Number(p.stock??1)}}
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
function renderCategories(){
  const select=document.getElementById("category"); if(!select)return;
  const cats=[...new Set(products.map(p=>p.cat).filter(Boolean))];
  select.innerHTML='<option>All</option>'+cats.map(c=>`<option>${escapeHtml(c)}</option>`).join("");
}
function renderProducts(){
  const q=(document.getElementById("search")?.value||"").toLowerCase(), c=document.getElementById("category")?.value||"All";
  const list=products.filter(p=>(c==="All"||p.cat===c)&&(`${p.name} ${p.cat} ${p.size||""}`.toLowerCase().includes(q)));
  document.getElementById("products").innerHTML=list.map(p=>{
    const sold=Number(p.stock)<=0;
    return `<article class="card ${sold?"sold":""}">
      <span class="tag">THRIFT</span><img src="${safeUrl(p.img)}" alt="${escapeHtml(p.name)}">
      <div class="card-body"><h3>${escapeHtml(p.name)}</h3>
      ${sold?'<span class="sold-badge">SOLD OUT</span>':""}
      <div class="price">${money(p.price)} <button class="add" ${sold?"disabled":""} onclick="addToCart('${escapeJs(p.id)}')">+ CART</button></div>
      <div class="meta">${escapeHtml(p.cat||"")} · ${escapeHtml(p.cond||"")} ${p.size?"· Size "+escapeHtml(p.size):""}</div>
      ${settings.whatsapp&&!sold?`<a class="btn dark-btn wa-order" target="_blank" rel="noopener" href="${waProductLink(p)}">ORDER ON WHATSAPP →</a>`:""}
      </div></article>`;
  }).join("")||"<p>No finds found.</p>";
}
function addToCart(id){const p=products.find(x=>String(x.id)===String(id));if(!p||Number(p.stock)<=0)return;cart.push(p);updateCart();toast(p.name+" added to cart")}
function updateCart(){
  document.getElementById("cartCount").textContent=cart.length;
  document.getElementById("cartItems").innerHTML=cart.length?cart.map((p,i)=>`<div class="cart-item"><img src="${safeUrl(p.img)}"><div><h4>${escapeHtml(p.name)}</h4><b>${money(p.price)}</b><br><button onclick="removeItem(${i})">Remove</button></div></div>`).join(""):"<p>Your cart is empty.</p>";
  document.getElementById("cartTotal").textContent=money(cart.reduce((a,p)=>a+p.price,0));
}
function removeItem(i){cart.splice(i,1);updateCart()}
function openCart(){document.getElementById("cart").classList.add("open");document.getElementById("overlay").classList.add("show")}
function closeCart(){document.getElementById("cart").classList.remove("open");document.getElementById("overlay").classList.remove("show")}
function checkout(){
  if(!cart.length)return toast("Add a product first");
  if(!settings.whatsapp)return toast("WhatsApp number is not configured yet");
  const lines=cart.map((p,i)=>`${i+1}. ${p.name} — ${money(p.price)}${p.size?" — Size "+p.size:""}`);
  const total=money(cart.reduce((a,p)=>a+p.price,0));
  window.open(`https://wa.me/${cleanPhone(settings.whatsapp)}?text=${encodeURIComponent("Hi finds.thrift1, I want to order:\n"+lines.join("\n")+"\nTotal: "+total)}`,"_blank");
}
function waProductLink(p){
  const text=`Hi finds.thrift1, I want to order ${p.name} for ${money(p.price)}${p.size?" (Size "+p.size+")":""}. Is it available?`;
  return `https://wa.me/${cleanPhone(settings.whatsapp)}?text=${encodeURIComponent(text)}`;
}
function focusSearch(){document.getElementById("search").focus();document.getElementById("search").scrollIntoView({behavior:"smooth",block:"center"})}
function sendMessage(e){e.preventDefault();toast("Message form demo submitted — connect your email form provider before launch");e.target.reset()}
function applySettings(){
  if(settings.about_text)document.getElementById("aboutText").textContent=settings.about_text;
  if(settings.shipping_text)document.getElementById("shippingText").textContent=settings.shipping_text;
  if(settings.return_text)document.getElementById("returnText").textContent=settings.return_text;
  if(settings.email)document.getElementById("emailText").textContent=settings.email;
  const ig=document.getElementById("instagramLink"); if(settings.instagram){ig.href=settings.instagram}else{ig.href="#"}
  const wa=document.getElementById("whatsappLink"); if(settings.whatsapp){wa.href=`https://wa.me/${cleanPhone(settings.whatsapp)}`}else{wa.href="#"}
  const st=document.getElementById("shippingTrust"); if(settings.shipping_text)st.textContent=settings.shipping_text.slice(0,45);
}
function cleanPhone(v){return String(v||"").replace(/\D/g,"")}
function safeUrl(v){try{const u=new URL(v);return ["http:","https:"].includes(u.protocol)?u.href:""}catch{return ""}}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function escapeJs(s){return String(s??"").replace(/\\/g,"\\\\").replace(/'/g,"\\'")}
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}
init();
