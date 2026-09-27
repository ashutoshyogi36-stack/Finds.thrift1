let db=null,currentUser=null,editingId=null,products=[];
const $=id=>document.getElementById(id);
function configured(){return window.FINDS_CONFIG && !FINDS_CONFIG.SUPABASE_URL.startsWith("PASTE_") && !FINDS_CONFIG.SUPABASE_ANON_KEY.startsWith("PASTE_") && window.supabase;}
function msg(id,text,show=true){const el=$(id);el.textContent=text;el.classList.toggle("hidden",!show)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
async function init(){
  if(!configured()){msg("loginMsg","First complete Supabase setup and put the project URL + anon key in config.js.");return}
  db=window.supabase.createClient(FINDS_CONFIG.SUPABASE_URL,FINDS_CONFIG.SUPABASE_ANON_KEY);
  const {data}=await db.auth.getSession(); currentUser=data.session?.user||null; updateUI();
  db.auth.onAuthStateChange((_e,session)=>{currentUser=session?.user||null;updateUI()});
}
function updateUI(){
  $("loginCard").classList.toggle("hidden",!!currentUser);
  $("dashboard").classList.toggle("hidden",!currentUser);
  if(currentUser){loadProducts();loadSettings()}
}
$("loginForm").addEventListener("submit",async e=>{
 e.preventDefault();msg("loginMsg","");
 const {error}=await db.auth.signInWithPassword({email:$("loginEmail").value,password:$("loginPassword").value});
 if(error)msg("loginMsg",error.message);
});
$("logoutBtn").addEventListener("click",async()=>{await db.auth.signOut()});
async function loadProducts(){
 const {data,error}=await db.from("products").select("*").order("created_at",{ascending:false});
 if(error){msg("productMsg",error.message);return} products=data||[];renderProducts();
}
function renderProducts(){
 $("productList").innerHTML=products.length?products.map(p=>`<div class="product-row">
 <img src="${esc(p.image_url||"")}" alt="">
 <div><b>${esc(p.name)}</b><div class="muted">₹${Number(p.price||0).toLocaleString("en-IN")} · ${esc(p.category||"")} · Size ${esc(p.size||"-")} · Stock ${esc(p.stock)}</div></div>
 <div class="row"><button class="admin-btn alt" onclick="editProduct('${p.id}')">Edit</button><button class="admin-btn" onclick="deleteProduct('${p.id}')">Delete</button></div>
 </div>`).join(""):"<p class='muted'>No products yet. Add your first product above.</p>";
}
window.editProduct=id=>{
 const p=products.find(x=>x.id===id);if(!p)return;editingId=id;
 $("formTitle").textContent="Edit Product";$("productId").value=id;$("pName").value=p.name||"";$("pPrice").value=p.price||0;$("pCategory").value=p.category||"";$("pSize").value=p.size||"";$("pCondition").value=p.condition||"";$("pStock").value=p.stock??1;$("pImageUrl").value=p.image_url||"";$("pDescription").value=p.description||"";window.scrollTo({top:0,behavior:"smooth"});
}
$("cancelEditBtn").addEventListener("click",()=>clearForm());
function clearForm(){editingId=null;$("formTitle").textContent="Add Product";$("productForm").reset();$("pStock").value=1}
$("productForm").addEventListener("submit",async e=>{
 e.preventDefault();msg("productMsg","");
 const name=$("pName").value.trim(), price=Number($("pPrice").value), category=$("pCategory").value.trim(), size=$("pSize").value.trim(), condition=$("pCondition").value.trim(), stock=Number($("pStock").value), description=$("pDescription").value.trim();
 let image_url=$("pImageUrl").value.trim();
 const file=$("pImage").files[0];
 if(file){
   const ext=(file.name.split(".").pop()||"jpg").toLowerCase();const path=`${crypto.randomUUID()}.${ext}`;
   const up=await db.storage.from("product-images").upload(path,file,{upsert:false,contentType:file.type});
   if(up.error){msg("productMsg","Image upload failed: "+up.error.message);return}
   const pub=db.storage.from("product-images").getPublicUrl(path);image_url=pub.data.publicUrl;
 }
 if(!image_url && !editingId){msg("productMsg","Please upload a photo or add an image URL.");return}
 const payload={name,price,category,size,condition,stock,description,image_url,updated_at:new Date().toISOString()};
 let result;
 if(editingId) result=await db.from("products").update(payload).eq("id",editingId);
 else result=await db.from("products").insert(payload);
 if(result.error){msg("productMsg",result.error.message);return}
 msg("productMsg",editingId?"Product updated.":"Product added.");
 clearForm();loadProducts();
});
window.deleteProduct=async id=>{
 if(!confirm("Delete this product?"))return;
 const {error}=await db.from("products").delete().eq("id",id);
 if(error)msg("productMsg",error.message);else{msg("productMsg","Product deleted.");loadProducts()}
}
async function loadSettings(){
 const {data,error}=await db.from("settings").select("*").eq("id",1).maybeSingle();if(error)return;
 const s=data||{};$("sWhatsapp").value=s.whatsapp||"";$("sInstagram").value=s.instagram||"";$("sEmail").value=s.email||"";$("sShipping").value=s.shipping_text||"";$("sReturn").value=s.return_text||"";$("sAbout").value=s.about_text||"";
}
$("settingsForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const payload={id:1,whatsapp:$("sWhatsapp").value.trim(),instagram:$("sInstagram").value.trim(),email:$("sEmail").value.trim(),shipping_text:$("sShipping").value.trim(),return_text:$("sReturn").value.trim(),about_text:$("sAbout").value.trim(),updated_at:new Date().toISOString()};
 const {error}=await db.from("settings").upsert(payload);
 msg("settingsMsg",error?error.message:"Settings saved.");
});
init();
