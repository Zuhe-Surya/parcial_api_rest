'use strict';
const $= s=>document.querySelector(s);

// Base URL dinamica
const origin = window.location.origin;
document.querySelectorAll('[data-origen]').forEach(el=>{ el.textContent=origin; });

// JSON coloreado
function colorJSON(json){
  return json.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,m=>{
      if(/^"/.test(m)) return /:$/.test(m)?`<span class="jk">${m}</span>`:`<span class="js">${m}</span>`;
      if(/true|false/.test(m)) return `<span class="jb">${m}</span>`;
      if(/null/.test(m)) return `<span class="jnl">${m}</span>`;
      return `<span class="jn">${m}</span>`;
    });
}

// Health check
async function checkHealth(){
  const elCode=$('#lc-status'), elJson=$('#lc-json code');
  const elChip=$('#nav-estado'), elHeroChip=$('.hero-chip');
  const elHeroTxt=$('#hero-estado-txt'), elNbTxt=$('.nb-txt');
  elCode.className='lc-status'; elCode.textContent='---';
  elJson.innerHTML='<span class="jc">// Conectando...</span>';
  try{
    const r=await fetch('/api/health');
    const d=await r.json();
    const ok=r.ok;
    elCode.className='lc-status '+(ok?'ok':'err');
    elCode.textContent=r.status;
    elJson.innerHTML=colorJSON(JSON.stringify(d,null,2));
    if(ok){
      elChip.className='nav-badge ok';
      elHeroChip.className='hero-chip ok';
      elNbTxt.textContent='Servidor en linea';
      elHeroTxt.textContent='Servidor en linea';
    } else {
      elChip.className='nav-badge err';
      elHeroChip.className='hero-chip err';
      elNbTxt.textContent='Error del servidor';
      elHeroTxt.textContent='Error del servidor';
    }
  } catch(e){
    elCode.className='lc-status err'; elCode.textContent='ERR';
    elJson.innerHTML='<span class="jc">// No se pudo conectar con el servidor</span>';
    elChip.className='nav-badge err'; elHeroChip.className='hero-chip err';
    elNbTxt.textContent='Sin conexion'; elHeroTxt.textContent='Sin conexion';
  }
}

// Copiar
function doCopy(text, btn){
  navigator.clipboard.writeText(text).then(()=>{
    btn.classList.add('copied');
    setTimeout(()=>btn.classList.remove('copied'),1800);
  }).catch(()=>{});
}

// Tabs de diagramas
function initTabs(){
  const tabs=document.querySelectorAll('.dtab');
  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>{
      const name=tab.dataset.tab;
      tabs.forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.diag-panel').forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      const panel=$('#tab-'+name);
      if(panel) panel.classList.add('active');
    });
  });
}

// Nav scroll
function initNav(){
  const nav=$('#nav');
  window.addEventListener('scroll',()=>{
    nav.style.boxShadow=scrollY>20?'0 4px 40px rgba(0,0,0,.6)':'none';
  },{passive:true});
}

document.addEventListener('DOMContentLoaded',()=>{
  checkHealth();
  $('#btn-reload')?.addEventListener('click',checkHealth);
  document.querySelectorAll('.copy-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const sel=btn.dataset.copy;
      if(sel){
        const el=$(sel);
        if(el) doCopy(el.textContent.trim(),btn);
      }
    });
  });
  initTabs();
  initNav();
});
