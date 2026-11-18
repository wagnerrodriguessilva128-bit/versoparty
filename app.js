// 1) Crie um projeto gratuito no Supabase e cole a URL e a chave publicável (anon) abaixo.
const SUPABASE_URL = "https://qigvopnisfqpaalhznuy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SKPKh_pXI2_vzgu_x2i-iA_PfoUF6Sf";
const BUCKET = "videos";
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_ANON_KEY.startsWith("COLE_");
const db = configured && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const $ = id => document.getElementById(id);
$("year").textContent = new Date().getFullYear();
const uploadDialog = $("uploadDialog"), videoDialog = $("videoDialog");
let activeVideo = null, videos = [];

function notice(message){$("notice").textContent=message;$("notice").classList.remove("hidden");}
function ytId(url){try{const u=new URL(url);if(u.hostname.includes("youtu.be"))return u.pathname.slice(1);if(u.hostname.includes("youtube.com"))return u.searchParams.get("v")||u.pathname.split("/").filter(Boolean).pop();}catch{}return null;}
function safeText(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function card(v){
 const isYT=v.kind==="youtube", id=isYT?ytId(v.youtube_url):null;
 const thumb=isYT&&id?`https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`:"";
 return `<article class="video-card" data-id="${v.id}"><div class="thumb">${thumb?`<img src="${thumb}" alt="">`:"<span style='font-size:48px'>🎬</span>"}<span class="bigplay">▶</span></div><div class="card-info"><h3>${safeText(v.title)}</h3><p>por ${safeText(v.author)}</p><div class="card-bottom"><span>▶ Assistir</span><span>♡ ${v.likes_count||0}</span></div></div></article>`;
}
function render(){
 const q=$("search").value.toLowerCase();
 const list=videos.filter(v=>(v.title+" "+v.author+" "+(v.description||"")).toLowerCase().includes(q));
 $("videoGrid").innerHTML=list.length?list.map(card).join(""):`<div class="empty">Ainda não há vídeos publicados. Seja o primeiro a compartilhar! 🎬</div>`;
 $("videoCount").textContent=`${videos.length} vídeo(s) publicado(s)`;
 document.querySelectorAll(".video-card").forEach(el=>el.addEventListener("click",()=>openVideo(el.dataset.id)));
}
async function loadVideos(){
 if(!db){$("videoCount").textContent="Configuração necessária";$("videoGrid").innerHTML='<div class="empty">O visual do site está pronto! Para ativar envios e vídeos compartilhados, configure o Supabase seguindo o arquivo CONFIGURACAO.md.</div>';return;}
 const {data,error}=await db.from("videos").select("*, likes(count)").eq("status","approved").order("created_at",{ascending:false});
 if(error){notice("Não foi possível carregar os vídeos. Confira a configuração do Supabase.");return;}
 videos=(data||[]).map(v=>({...v,likes_count:v.likes?.[0]?.count||0}));render();
}
function openUpload(){ $("formStatus").textContent="";uploadDialog.showModal(); }
$("openUpload").onclick=openUpload;$("heroUpload").onclick=openUpload;$("closeUpload").onclick=()=>uploadDialog.close();$("closeVideo").onclick=()=>{videoDialog.close();$("player").innerHTML="";};
document.querySelectorAll('input[name="kind"]').forEach(r=>r.addEventListener("change",()=>{const yt=document.querySelector('input[name="kind"]:checked').value==="youtube";$("fileArea").classList.toggle("hidden",yt);$("youtubeArea").classList.toggle("hidden",!yt);}));
$("search").addEventListener("input",render);

$("uploadForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!db){$("formStatus").textContent="Configure primeiro o Supabase no arquivo app.js e publique novamente.";return;}
 const kind=document.querySelector('input[name="kind"]:checked').value;
 const author=$("author").value.trim(),title=$("title").value.trim(),description=$("description").value.trim();
 const btn=$("submitUpload");btn.disabled=true;btn.textContent="Enviando...";
 try{
  let payload={kind,author,title,description,status:"approved"};
  if(kind==="youtube"){const url=$("youtubeUrl").value.trim();if(!ytId(url))throw Error("Cole um link válido do YouTube.");payload.youtube_url=url;}
  else{
   const file=$("videoFile").files[0];if(!file)throw Error("Escolha um arquivo de vídeo.");if(file.size>MAX_FILE_SIZE)throw Error("O arquivo passa de 50 MB. Escolha um vídeo menor.");
   if(!["video/mp4","video/webm","video/quicktime"].includes(file.type))throw Error("Formato não aceito. Use MP4, WebM ou MOV.");
   const ext=file.name.split(".").pop().toLowerCase(),path=`${crypto.randomUUID()}.${ext}`;
   const {error:upErr}=await db.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false});if(upErr)throw upErr;
   payload.file_path=path;
  }
  const {error}=await db.from("videos").insert(payload);if(error)throw error;
  $("uploadForm").reset();$("formStatus").textContent="Enviado! Seu vídeo ficará pendente até o administrador aprovar.";notice("Recebemos seu envio. Ele aparecerá para todos depois da aprovação.");
 }catch(err){$("formStatus").textContent=err.message||"Erro ao enviar. Tente novamente.";}
 finally{btn.disabled=false;btn.textContent="Enviar para aprovação";}
});

async function openVideo(id){
 activeVideo=videos.find(v=>String(v.id)===String(id));if(!activeVideo)return;
 $("watchTitle").textContent=activeVideo.title;$("watchMeta").textContent=`por ${activeVideo.author}`;$("watchDescription").textContent=activeVideo.description||"";
 $("player").innerHTML="";
 if(activeVideo.kind==="youtube"){const vid=ytId(activeVideo.youtube_url);$("player").innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}" title="Vídeo do YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;}
 else{const {data}=db.storage.from(BUCKET).getPublicUrl(activeVideo.file_path);$("player").innerHTML=`<video controls playsinline src="${data.publicUrl}"></video>`;}
 const {count}=await db.from("likes").select("*",{count:"exact",head:true}).eq("video_id",activeVideo.id);$("likeCount").textContent=count||0;
 await loadComments();videoDialog.showModal();
}
$("likeButton").onclick=async()=>{if(!activeVideo)return;const key=`vp-liked-${activeVideo.id}`;if(localStorage.getItem(key)){notice("Você já curtiu este vídeo neste navegador.");return;}const {error}=await db.from("likes").insert({video_id:activeVideo.id});if(error){notice("Não foi possível registrar a curtida.");return;}localStorage.setItem(key,"1");$("likeCount").textContent=Number($("likeCount").textContent)+1;};
async function loadComments(){const {data}=await db.from("comments").select("*").eq("video_id",activeVideo.id).order("created_at",{ascending:false});$("commentList").innerHTML=(data||[]).map(c=>`<div class="comment"><b>${safeText(c.author)}</b>${safeText(c.body)}</div>`).join("")||'<p class="muted">Ainda não há comentários.</p>';}
$("commentForm").onsubmit=async e=>{e.preventDefault();const author=$("commentName").value.trim(),body=$("commentText").value.trim();const {error}=await db.from("comments").insert({video_id:activeVideo.id,author,body});if(error){notice("Não foi possível enviar o comentário.");return;}$("commentText").value="";await loadComments();};
loadVideos();
