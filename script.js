const products=[
{id:1,name:"Stussy Script Tee",cat:"T-Shirts",price:1299,cond:"Good",img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80"},
{id:2,name:"Vintage Green Sweatshirt",cat:"Hoodies",price:1499,cond:"Excellent",img:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80"},
{id:3,name:"Classic Denim Jacket",cat:"Jackets",price:2199,cond:"Very Good",img:"https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=80"},
{id:4,name:"Retro Track Jacket",cat:"Jackets",price:1799,cond:"Very Good",img:"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=80"},
{id:5,name:"Vintage Flannel Shirt",cat:"Shirts",price:1299,cond:"Good",img:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80"},
{id:6,name:"Baggy Blue Jeans",cat:"Jeans",price:1699,cond:"Good",img:"https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80"},
{id:7,name:"Washed Graphic Tee",cat:"T-Shirts",price:1199,cond:"Good",img:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=80"},
{id:8,name:"Vintage Zip Hoodie",cat:"Hoodies",price:1599,cond:"Excellent",img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80"}];
let cart=[];
const money=n=>"₹"+n.toLocaleString("en-IN");
function renderProducts(){
 const q=(document.getElementById("search")?.value||"").toLowerCase(), c=document.getElementById("category")?.value||"All";
 const list=products.filter(p=>(c==="All"||p.cat===c)&&p.name.toLowerCase().includes(q));
 document.getElementById("products").innerHTML=list.map(p=>`<article class="card"><span class="tag">THRIFT</span><img src="${p.img}" alt="${p.name}"><div class="card-body"><h3>${p.name}</h3><div class="price">${money(p.price)} <button class="add" onclick="addToCart(${p.id})">+ CART</button></div><div class="meta">${p.cat} · ${p.cond}</div></div></article>`).join("")||"<p>No finds found.</p>";
}
function addToCart(id){const p=products.find(x=>x.id===id);cart.push(p);updateCart();toast(p.name+" added to cart");}
function updateCart(){
 document.getElementById("cartCount").textContent=cart.length;
 document.getElementById("cartItems").innerHTML=cart.length?cart.map((p,i)=>`<div class="cart-item"><img src="${p.img}"><div><h4>${p.name}</h4><b>${money(p.price)}</b><br><button onclick="removeItem(${i})">Remove</button></div></div>`).join(""):"<p>Your cart is empty.</p>";
 document.getElementById("cartTotal").textContent=money(cart.reduce((a,p)=>a+p.price,0));
}
function removeItem(i){cart.splice(i,1);updateCart()}
function openCart(){document.getElementById("cart").classList.add("open");document.getElementById("overlay").classList.add("show")}
function closeCart(){document.getElementById("cart").classList.remove("open");document.getElementById("overlay").classList.remove("show")}
function checkout(){if(!cart.length)return toast("Add a product first");toast("Checkout demo — connect payment/WhatsApp before launch");}
function focusSearch(){document.getElementById("search").focus();document.getElementById("search").scrollIntoView({behavior:"smooth",block:"center"})}
function sendMessage(e){e.preventDefault();toast("Message form demo submitted");e.target.reset()}
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}
renderProducts();updateCart();