
(()=>{
'use strict';

const TYPES={
  paper:['İnşaat ve Yıkıntı Atıkları','--paper'],
  plastic:['Tekstil Suyu ve Mikroplastikler','--plastic'],
  glass:['Elektronik Atıklar','--glass'],
  metal:['Sanayi ve Endüstriyel Atıklar','--metal'],
  organic:['Evsel Atıklar','--organic'],
  hazard:['Tehlikeli Atıklar','--hazard'],
  medical:['Tıbbi Atıklar','--medical']
};
const $=s=>document.querySelector(s);
const root=document.documentElement;

const esc=s=>String(s??'').replace(
  /[&<>"']/g,
  c=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[c])
);

const safeUrl=v=>{
  if(typeof v==='object'&&v)
    v=v.image||v.src||v.url||'';

  if(typeof v!=='string')return '';

  v=v.trim();

  if(!v||/^(javascript|data|vbscript):/i.test(v))
    return '';

  if(/^https?:\/\//i.test(v))return v;
  if(v.startsWith('/fhaber/'))return v;
  if(v.startsWith('/'))return v;

  return v.replace(/^\.\//,'');
};

// KATEGORİ VE RENK EŞLEŞTİRMESİ
const catType=c=>{
  const s=String(c||'')
    .toLocaleLowerCase('tr-TR')
    .trim();

  if(s==='paper'||/inşaat|yıkıntı/.test(s))
    return 'paper';

  if(s==='plastic'||/plastik|tekstil/.test(s))
    return 'plastic';

  if(s==='glass'||/elektronik/.test(s))
    return 'glass';

  if(s==='metal'||/sanayi|endüstri/.test(s))
    return 'metal';

  if(s==='organic'||/evsel/.test(s))
    return 'organic';

  if(s==='hazard'||/tehlike/.test(s))
    return 'hazard';

  if(s==='medical'||/tıbbi|sağlık/.test(s))
    return 'medical';

  return 'organic';
};

// GERİ DÖNÜŞÜM KUTULARI
function bin(c,k){
  const ic=k==='medical'
    ?'<path d="M29 41h6v5h5v6h-5v5h-6v-5h-5v-6h5z" fill="#e11d3c"/>'
    :k==='hazard'
    ?'<rect x="30" y="40" width="4" height="12" fill="#111"/>'
    :'<path d="M32 41l9 15H23z" fill="none" stroke="#111" stroke-width="2.4"/>';

  return `<svg viewBox="0 0 64 92" aria-hidden="true">
    <ellipse cx="32" cy="88" rx="26" ry="3" fill="#000" opacity=".4"/>
    <rect x="14" y="7" width="36" height="6" fill="${c}"/>
    <polygon points="9,22 55,22 50,81 14,81" fill="${c}"/>
    <polygon points="34,22 55,22 50,81 34,81" fill="#0003"/>
    <rect x="21" y="35" width="22" height="30" fill="#f4f4f0"/>
    ${ic}
    <rect x="4" y="12" width="56" height="11" fill="${c}"/>
    <circle cx="18" cy="84" r="4.5" fill="#111"/>
    <circle cx="46" cy="84" r="4.5" fill="#111"/>
  </svg>`;
}

// SİTE RENKLERİ VE AYARLAR
function setup(){
  if($('#bb')){
    $('#bb').innerHTML=Object.entries(TYPES)
      .map(([k,v])=>bin(`var(${v[1]})`,k))
      .join('');
  }

  if($('#ft')){
    $('#ft').innerHTML=Object.values(TYPES)
      .map(v=>`<li>
        <span class="sw" style="--c:var(${v[1]})"></span>
        ${v[0]}
      </li>`)
      .join('');
  }

  const DEF={
    '--bg':'#ffffff',
    '--surface':'#eef3f0',
    '--accent':'#0e8a5f',
    '--paper':'#1d6fe0',
    '--plastic':'#f5c400',
    '--glass':'#14a44d',
    '--metal':'#8a949c',
    '--organic':'#8a5a2b',
    '--hazard':'#d9262c',
    '--medical':'#e11d74'
  };

  const LBL={
    '--bg':'Arka plan',
    '--surface':'Kart zemini',
    '--accent':'Ana yeşil',
    '--paper':'İnşaat ve Yıkıntı',
    '--plastic':'Tekstil ve Mikroplastik',
    '--glass':'Elektronik',
    '--metal':'Sanayi ve Endüstriyel',
    '--organic':'Evsel',
    '--hazard':'Tehlikeli',
    '--medical':'Tıbbi'
  };

  let cur={...DEF};

  try{
    const saved=JSON.parse(
      localStorage.getItem('fh-c2')||'{}'
    );

    for(const k of Object.keys(DEF)){
      if(/^#[0-9a-f]{6}$/i.test(saved[k]))
        cur[k]=saved[k];
    }
  }catch(e){}

  const apply=()=>{
    for(const k in cur)
      root.style.setProperty(k,cur[k]);
  };

  const panel=()=>{
    $('#pn').innerHTML=Object.keys(DEF)
      .map(k=>`<label>
        ${LBL[k]}
        <input type="color" data-k="${k}" value="${cur[k]}">
      </label>`)
      .join('')+'<button id="rs">SIFIRLA</button>';
  };

  if($('#pn')&&$('#tg')){
    panel();

    $('#tg').onclick=()=>
      $('#pn').classList.toggle('open');

    $('#pn').addEventListener('input',e=>{
      const k=e.target.dataset.k;

      if(!Object.hasOwn(DEF,k))return;

      cur[k]=e.target.value;
      apply();

      try{
        localStorage.setItem(
          'fh-c2',
          JSON.stringify(cur)
        );
      }catch(_){}
    });

    $('#pn').addEventListener('click',e=>{
      if(e.target.id==='rs'){
        cur={...DEF};
        apply();
        panel();

        try{
          localStorage.removeItem('fh-c2');
        }catch(_){}
      }
    });
  }

  apply();
}

// GITHUB HABER VERİLERİ
const api=
'https://api.github.com/repos/xenHH/fhaber/contents/haberler?ref=main';

async function loadNews(){
  const r=await fetch(api,{
    headers:{
      Accept:'application/vnd.github+json'
    }
  });

  if(!r.ok)
    throw Error('GitHub haber listesi alınamadı: '+r.status);

  const items=await r.json();

  if(!Array.isArray(items))
    throw Error('Haberler klasörü bulunamadı');

  const md=items.filter(x=>/\.md$/i.test(x.name));

  const results=await Promise.all(
    md.map(async f=>{
      try{
        const resp=await fetch(f.download_url);

        if(!resp.ok)
          throw Error('İçerik yüklenemedi');

        const raw=await resp.text();

        const match=raw.match(
          /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/
        );

        if(!match||!window.jsyaml)
          return null;

        const data=window.jsyaml.load(match[1])||{};
        const slug=f.name.replace(/\.md$/i,'');
        const body=raw.slice(match[0].length);
        const date=data.date?new Date(data.date):null;

        return {
          id:slug,
          h:String(data.title||'Başlıksız Haber'),
          s:String(data.spot||''),
          category:String(data.category||''),
          section:String(
            data.section||
            data.content_type||
            data.type||
            ''
          ),
          t:catType(data.category),
          img:safeUrl(data.image),
          imgs:Array.isArray(data.gallery)
            ?data.gallery.map(safeUrl).filter(Boolean)
            :[],
          text:body,
          date:date&&!isNaN(date)
            ?date.toISOString()
            :String(data.date||''),
          author:String(data.author||'')
        };

      }catch(e){
        console.warn(f.name,e);
        return null;
      }
    })
  );

  return results
    .filter(Boolean)
    .sort(
      (a,b)=>
        new Date(b.date||0)-new Date(a.date||0)
    );
}

// HABER KARTLARI
function card(n,hero){
  const link='f_haber_detay_sayfas.html?haber='+
    encodeURIComponent(n.id);

  return `<a class="card ${hero?'hero':''}"
    href="${link}"
    style="--c:var(${TYPES[n.t][1]})">

    ${hero?'<span class="tag">Manşet Haber</span>':''}

    ${n.img
      ?`<img src="${esc(n.img)}"
          alt=""
          class="${hero?'hero-img':'card-img'}"
          loading="lazy">`
      :''}

    <h3 class="ed">${esc(n.h)}</h3>
    <p>${esc(n.s)}</p>
    <span class="more">HABERİ OKU →</span>
  </a>`;
}

function error(msg){
  $('#app').innerHTML=
    `<p class="site-message">${esc(msg)}</p>`;
}

// ANA SAYFA VE HABER LİSTELERİ
async function listing(page){
  $('#app').innerHTML=
    '<p class="site-message">Haberler yükleniyor...</p>';

  try{
    const all=await loadNews();

    if(!all.length){
      error('Henüz yayımlanmış haber bulunmuyor.');
      return;
    }

    let N=all;

    if(page!=='home'){
      const names={
        tv:['tv','tv haberi','televizyon'],
        gazete:['gazete','gazete haberi'],
        roportaj:['röportaj','roportaj'],
        podcast:['podcast']
      };

      N=all.filter(n=>
        names[page].includes(
          n.section.toLocaleLowerCase('tr-TR')
        )
      );

      if(!N.length){
        error(
          'Bu bölümde henüz haber bulunmuyor. Decap CMS’te haberin Yayın Türü alanını seçerek burada gösterebilirsin.'
        );
        return;
      }
    }

    if(page==='home'){
      let heroIndex=0;

      const draw=()=>{
        $('#app').innerHTML=
          card(N[heroIndex],true)+
          (N.length>1
            ?'<h2 class="slider-title ed">Tüm Haberler</h2>'+
              '<div class="news-slider">'+
              N.map((n,i)=>
                i!==heroIndex?card(n,false):''
              ).join('')+
              '</div>'
            :'');
      };

      draw();

      if(N.length>1){
        setInterval(()=>{
          if(document.querySelector('.news-slider:hover'))
            return;

          heroIndex=(heroIndex+1)%N.length;
          draw();
        },7000);
      }

    }else{
      $('#app').innerHTML=
        '<div class="grid">'+
        N.map((n,i)=>card(n,i===0)).join('')+
        '</div>';
    }

  }catch(e){
    console.error(e);

    error(
      'Haberler şu anda yüklenemiyor. İnternet bağlantısını, GitHub deposunun herkese açık olduğunu ve haberler klasörünü kontrol edin.'
    );
  }
}

// HABER DETAY SAYFASI
function renderDetail(n){
  const art=$('#article-container');
  const title=n.h||n.title||'Haber';
  const body=String(n.text||n.body||'');

  art.style.setProperty(
    '--c',
    `var(${TYPES[n.t]?.[1]||'--organic'})`
  );

  document.title=title+' | F Haber';

  const parsed=window.marked
    ?window.marked.parse(body)
    :'<p>'+esc(body)+'</p>';

  const safe=window.DOMPurify
    ?window.DOMPurify.sanitize(parsed)
    :'<p>'+esc(body)+'</p>';

  const images=Array.isArray(n.imgs)?n.imgs:[];

  art.innerHTML=`
    <span class="tag">
      ${esc(n.category||TYPES[n.t]?.[0]||'Haber')}
    </span>

    ${n.date
      ?`<div class="meta">
          ${esc(new Date(n.date).toLocaleDateString('tr-TR'))}
        </div>`
      :''}

    <h1 class="ed">${esc(title)}</h1>

    <p class="lead">
      ${esc(n.s||n.spot||'')}
    </p>

    ${n.img
      ?`<figure>
          <img class="art-img"
            src="${esc(safeUrl(n.img))}"
            alt="${esc(title)}">
        </figure>`
      :''}

    <div class="article-body">
      ${safe}
    </div>

    ${images.length
      ?`<div class="gh">FOTOĞRAF GALERİSİ</div>
        <div class="gallery">
          ${images.map((im,i)=>
            `<img src="${esc(safeUrl(im))}"
              alt="Haber fotoğrafı ${i+1}"
              loading="lazy">`
          ).join('')}
        </div>`
      :''}
  `;

  const lb=$('#lb');

  if(lb){
    const img=lb.querySelector('img');
    let idx=0;
    let imgs=[];

    function show(i){
      imgs=[...art.querySelectorAll('img')];

      if(!imgs.length)return;

      idx=(i+imgs.length)%imgs.length;
      img.src=imgs[idx].src;
      lb.classList.add('open');
    }

    art.addEventListener('click',e=>{
      if(e.target.matches('img')){
        show(
          [...art.querySelectorAll('img')]
            .indexOf(e.target)
        );
      }
    });

    lb.querySelector('.x').onclick=()=>
      lb.classList.remove('open');

    lb.querySelector('.pv').onclick=()=>
      show(idx-1);

    lb.querySelector('.nx').onclick=()=>
      show(idx+1);

    lb.addEventListener('click',e=>{
      if(e.target===lb)
        lb.classList.remove('open');
    });

    document.addEventListener('keydown',e=>{
      if(!lb.classList.contains('open'))
        return;

      if(e.key==='Escape')
        lb.classList.remove('open');

      if(e.key==='ArrowLeft')
        show(idx-1);

      if(e.key==='ArrowRight')
        show(idx+1);
    });
  }
}

// HABERİ AÇMA
async function detail(){
  const art=$('#article-container');

  art.innerHTML='<p>Haber yükleniyor...</p>';

  const slug=new URLSearchParams(location.search)
    .get('haber');

  if(slug){
    try{
      const all=await loadNews();
      const n=all.find(n=>n.id===slug);

      if(n){
        renderDetail(n);
        return;
      }

    }catch(e){
      console.warn(e);
    }
  }

  let saved=null;

  try{
    saved=JSON.parse(
      localStorage.getItem('fh-current-news')||'null'
    );
  }catch(e){}

  if(saved){
    renderDetail(saved);
    return;
  }

  art.innerHTML=`
    <h1 class="ed">Haber bulunamadı</h1>
    <p>Haberin bağlantısı geçersiz veya içerik henüz yayımlanmamış olabilir.</p>
    <a href="index.html" class="back">
      ANA SAYFAYA DÖN
    </a>
  `;
}

// BAŞLAT
setup();

const page=document.body.dataset.page||'home';

if(page==='detail'){
  detail();
}else{
  listing(page);
}

})();
