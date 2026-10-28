/* Local screen-design prototype. No enquiry is transmitted. */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const small = matchMedia('(max-width: 900px)');
let lang='th', active=0, selectedTopic=null, modalState=null, paused=reduce.matches;
let parentService=null;
const selectedAreas=new Set();let areasEdited=false;
const words={
 th:{identity:'เอเจนซีการตลาดเฉพาะทางสำหรับอุตสาหกรรมอาหาร',line:'ปรึกษาทาง LINE',contact:'ติดต่อเรา',pause:'หยุดวิดีโอ',play:'เล่นวิดีโอ',general:'ปรึกษาภาพรวมการตลาด',work:'ผลงานของเรา',company:'ข้อมูลบริษัท',contactTitle:'ติดต่อ WAKUWAKU',privacy:'อ่านประกาศความเป็นส่วนตัว',demo:'เมื่อกดส่ง ระบบจะเปิดแอปอีเมลของคุณพร้อมข้อความที่เตรียมไว้ ตรวจสอบแล้วกดส่งอีกครั้ง',demoDone:'เปิดแอปอีเมลพร้อมข้อความแล้ว หากไม่เปิดขึ้น กรุณาส่งอีเมลมาที่ info@wkwkp.com',form:'ส่งแบบฟอร์ม',more:'ดูรายละเอียดบริการ',enquire:'ปรึกษาเรื่องนี้',view:'ดูรายละเอียดผลงาน',similar:'ปรึกษาเกี่ยวกับงานลักษณะนี้',related:'ผลงานที่เกี่ยวข้อง',imagePending:'ภาพประกอบอยู่ระหว่างเตรียม',privacyPending:'ประกาศความเป็นส่วนตัวฉบับเผยแพร่จะเชื่อมต่อในขั้นตอนพัฒนา แบบฟอร์มตัวอย่างนี้ไม่ส่งหรือบันทึกข้อมูล',categories:['วิจัยและกลยุทธ์','แบรนด์และครีเอทีฟ','แคมเปญการตลาด','อีเวนต์และประสบการณ์','ยอดขายออนไลน์','เทคโนโลยีการตลาด']},
 en:{identity:'Marketing specialists for the food industry.',line:'Chat on LINE',contact:'Contact us',pause:'Pause video',play:'Play video',general:'Discuss your marketing',work:'Our Work',company:'Company Information',contactTitle:'Contact WAKUWAKU',privacy:'Read our privacy notice',demo:'Sending opens your email app with a message ready to go. Review it and press send there.',demoDone:'Your email app should now be open with the message. If not, please email info@wkwkp.com.',form:'Send an enquiry',more:'View service details',enquire:'Enquire',view:'View project',similar:'Discuss a project like this',related:'Related work',imagePending:'Project image in preparation',privacyPending:'The publication privacy notice will be connected during development. This preview does not send or save form data.',categories:['Research & strategy','Brand & creative','Marketing campaigns','Events & experiences','Online sales','Marketing technology']}
};
Object.assign(words.en,{free:'Get a free consultation',freeNote:'Start with a free consultation.',chooseAreas:'What would you like to discuss? (optional)',other:'Not sure yet / Other',caseContext:'Project of interest',copyContext:'Copy topic for LINE / Messenger',copied:'Topic copied. Paste it into your chat.',copyFailed:'Please select and copy the topic above.',brandPreview:'Selected brands · logo assets pending',pauseBrands:'Pause brand strip',resumeBrands:'Resume brand strip'});
Object.assign(words.th,{free:'ปรึกษาฟรี',freeNote:'เริ่มต้นด้วยการปรึกษาเบื้องต้นฟรี',chooseAreas:'คุณต้องการปรึกษาด้านใด? (ไม่บังคับ)',other:'ยังไม่แน่ใจ / อื่น ๆ',caseContext:'ผลงานที่สนใจ',copyContext:'คัดลอกหัวข้อสำหรับ LINE / Messenger',copied:'คัดลอกหัวข้อแล้ว วางในแชตของคุณได้เลย',copyFailed:'กรุณาเลือกและคัดลอกหัวข้อด้านบน',brandPreview:'แบรนด์ที่ร่วมงาน · อยู่ระหว่างเตรียมโลโก้',pauseBrands:'หยุดแถบแบรนด์',resumeBrands:'เล่นแถบแบรนด์'});
const formAreas=['Research & strategy','Brand & creative','Campaigns','Events & experiences','E-commerce','Systems & development'];
words.en.serviceIntro='Food industry challenges shape our services. We combine strategy, content, campaigns and development around what your business needs. Explore six ways we can help.';
words.th.serviceIntro='เราออกแบบบริการจากโจทย์การตลาดในอุตสาหกรรมอาหาร โดยผสานกลยุทธ์ คอนเทนต์ แคมเปญ และการพัฒนาให้เหมาะกับความต้องการของธุรกิจคุณ สำรวจ 6 ด้านที่เราช่วยคุณได้';
words.en.emailUs='Email us';words.th.emailUs='ติดต่อทางอีเมล';
const clientLogos=[{"src": "assets/client-logos/allowrie.png", "name": "Allowrie"}, {"src": "assets/client-logos/boncafe.png", "name": "Boncafe"}, {"src": "assets/client-logos/campagna.png", "name": "Campagna"}, {"src": "assets/client-logos/central-group.png", "name": "Central Group"}, {"src": "assets/client-logos/chua-hah-seng.png", "name": "Chua Hah Seng"}, {"src": "assets/client-logos/debic.png", "name": "Debic"}, {"src": "assets/client-logos/ding-fong.png", "name": "Ding Fong"}, {"src": "assets/client-logos/molle.png", "name": "Molle"}, {"src": "assets/client-logos/falcon.png", "name": "Falcon"}, {"src": "assets/client-logos/imperial.png", "name": "Imperial"}, {"src": "assets/client-logos/kai-pan-suk.png", "name": "Kai Pan Suk"}, {"src": "assets/client-logos/kilen-khu.png", "name": "Kilen Khu"}, {"src": "assets/client-logos/kimnori.png", "name": "Kimnori"}, {"src": "assets/client-logos/lobo.png", "name": "Lobo"}, {"src": "assets/client-logos/m-lifestore.png", "name": "M Lifestore"}, {"src": "assets/client-logos/makro.png", "name": "Makro"}, {"src": "assets/client-logos/mung-korn-koo.png", "name": "Mung Korn Koo"}, {"src": "assets/client-logos/nissin.png", "name": "Nissin"}, {"src": "assets/client-logos/pop-secret.png", "name": "Pop Secret"}, {"src": "assets/client-logos/premio.png", "name": "Premio"}, {"src": "assets/client-logos/segafredo.png", "name": "Segafredo"}, {"src": "assets/client-logos/senorita.png", "name": "Senorita"}, {"src": "assets/client-logos/mitr-phol.png", "name": "Mitr Phol"}, {"src": "assets/client-logos/so-good.png", "name": "So Good"}, {"src": "assets/client-logos/streamline.png", "name": "Streamline"}, {"src": "assets/client-logos/sunquick.png", "name": "Sunquick"}, {"src": "assets/client-logos/thychef.png", "name": "Thychef"}, {"src": "assets/client-logos/tipco.png", "name": "Tipco"}, {"src": "assets/client-logos/tulip.png", "name": "Tulip"}, {"src": "assets/client-logos/tyson-foods.png", "name": "Tyson Foods"}, {"src": "assets/client-logos/ufc.png", "name": "Ufc"}];
const t=key=>words[lang][key];
const toolLogos={'WakuFlow Content':'assets/tools/wf-content-symbol.png','WakuFlow Influencer':'assets/tools/wf-influencer-symbol.png','WakuFlow Tracker':'assets/tools/wf-tracker-symbol.png'};
const media={C001:'assets/C001.png',C002:'assets/C002.png',C003:'assets/C003.png',C004:'assets/C004.png',C005:'assets/C005.png',C006:'assets/C006.jpg',C009:'assets/C009.webp',C013:'assets/C013.jpg',C015:'assets/C015.jpg',C016:'assets/C016.jpg',C017:'assets/C017.jpg'}
const detailMedia={C009:{src:'assets/C009.webp',ratio:1.339},C013:{src:'assets/C013-wide.jpg',ratio:2},C015:{src:'assets/C015-wide.jpg',ratio:2.628},C016:{src:'assets/C016.jpg',ratio:1.339},C017:{src:'assets/C017.jpg',ratio:1.339}};;
const serviceCardMedia=[1,2,3,4,5,6].map(n=>`assets/services/service-0${n}-card.webp?v=2`);
const serviceDetailMedia=[1,2,3,4,5,6].map(n=>`assets/services/service-0${n}-detail.webp?v=3`);
const filmSources=[1,2,3,4].map(i=>`assets/hero-loop-${i}.webm`);
const posters=[1,2,3,4].map(i=>`assets/film-poster-${i}.jpg`);
const paragraphs=arr=>arr.map(p=>`<p>${esc(p)}</p>`).join('');
const imageHTML=(id,detail)=>(detail&&detailMedia[id]?.src||media[id])?`<img src="${detail&&detailMedia[id]?.src||media[id]}" alt="${esc(COPY.works[id].title)}" loading="lazy">`:`<div class="image-placeholder"><strong>${esc(COPY.works[id].title)}</strong><small>${t('imagePending')}</small></div>`;
function workCardHTML(id){
 const w=COPY.works[id];
 return `<article class="work-card" data-work="${id}"><button class="work-card-link" data-case="${id}" aria-label="${esc(t('view')+': '+w.title+' — '+w.headline[lang])}"><span class="work-card-media">${media[id]?imageHTML(id):'<span class="work-card-placeholder" aria-hidden="true"></span>'}</span><span class="work-card-caption"><span class="work-brand">${esc(w.title)}</span><span class="work-card-title">${esc(w.headline[lang])}</span></span></button></article>`;
}
function render(){
 document.documentElement.lang=lang;
 $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
 $('.language').innerHTML=lang==='th'?'TH <span>/ EN</span>':'<span>TH /</span> EN';
 $('.language').setAttribute('aria-label',lang==='th'?'Switch to English':'เปลี่ยนเป็นภาษาไทย');
 $('#about-copy').innerHTML=paragraphs(COPY.about[lang]);
 $('.service-stage').innerHTML=COPY.cards.map((c,i)=>`<article class="service-card" data-area="${i}" aria-label="${esc(c[lang].title)}"><img src="${serviceCardMedia[i]}" alt="${esc(t('categories')[i])}" loading="lazy"><div class="card-shade"></div><div class="card-top"><span>0${i+1} / 06</span></div><div class="card-body"><h3>${esc(c[lang].title)}</h3><p>${esc(c[lang].body)}</p><div class="service-actions"><button class="button detail-button" data-detail="${c.id}">${t('more')}</button></div></div></article>`).join('');
 $('.service-index').innerHTML=COPY.cards.map((c,i)=>`<button data-select="${i}" aria-label="${esc(c[lang].title)}"><span>0${i+1}</span>${t('categories')[i]}</button>`).join('');
 $('.work-rail').innerHTML=COPY.mapping.P00.map(workCardHTML).join('');
 $('#company-copy').textContent=COPY.company[lang];
 $('#company-facts').innerHTML=COPY.companyRows.map(r=>`<div><dt>${esc(r.label.split(' / ')[lang==='th'?0:1])}</dt><dd>${esc(r[lang])}</dd></div>`).join('');
 $('#contact-copy').innerHTML=paragraphs(COPY.contact[lang].slice(1));
 $$('[data-form]').forEach(el=>el.textContent=COPY.form[el.dataset.form][lang]);
 $('textarea').placeholder=COPY.form['内容の入力補助'][lang];
 $('.privacy-copy').textContent=COPY.privacyShort[lang];
 $('#form-status').textContent='';
 setActive(active);renderTopic();renderChoices();renderBrands();updateWorkNavigation();
 if(typeof layoutServices==='function')requestAnimationFrame(()=>layoutServices(true));
 if(modalState)openModal(modalState.type,modalState.id,false);
}
function setActive(index){
 active=Math.max(0,Math.min(5,index));
 $$('.service-card').forEach((el,i)=>{let offset=i-active;el.style.setProperty('--offset',offset);el.style.setProperty('--abs',Math.abs(offset));el.style.setProperty('--z',10-Math.abs(offset));el.style.setProperty('--opacity',Math.abs(offset)>3?0:1);el.classList.toggle('active',i===active);el.inert=i!==active;el.setAttribute('aria-hidden',String(i!==active));});
 $$('.service-index button').forEach((b,i)=>b.setAttribute('aria-current',String(i===active)));
 $('#service-prev').setAttribute('aria-label',lang==='th'?'บริการก่อนหน้า':'Previous service');
 $('#service-next').setAttribute('aria-label',lang==='th'?'บริการถัดไป':'Next service');
 $('#service-prev').disabled=active===0;$('#service-next').disabled=active===5;
}
function selectArea(i){
 setActive(i);
 const track=$('.service-scroll');
 if(track.classList.contains('service-pinned'))window.scrollTo({top:window.scrollY+track.getBoundingClientRect().top+active*Number(track.dataset.step)+2,behavior:'instant'});
}
function updateScroll(){
 if($('#detail').open)return;
 const track=$('.service-scroll');
 if(track?.classList.contains('service-pinned')){
  const box=track.getBoundingClientRect(),step=Number(track.dataset.step);
  if(step>0&&box.top<=0&&box.bottom>0){const next=Math.min(5,Math.floor(-box.top/step));if(next!==active)setActive(next);}
 }
}
function toolMock(title){
 const th=lang==='th',lines=(...w)=>w.map(n=>`<span class="tm-line" style="width:${n}%"></span>`).join('');
 if(title==='WakuFlow Content')return `<figure class="tool-mock tool-mock-c" aria-hidden="true"><div class="tm-bar"><i></i><i></i><i></i><span>${th?'บรีฟแคมเปญ':'Campaign brief'}</span></div><div class="tm-body"><div class="tm-row"><b>${th?'ลูกค้า':'Client'}</b>${lines(48)}</div><div class="tm-row"><b>${th?'แคมเปญ':'Campaign'}</b>${lines(68)}</div><div class="tm-row"><b>${th?'สถานะ':'Status'}</b><em class="tm-chip">${th?'ร่าง':'Draft'}</em><em class="tm-chip on">${th?'รอตรวจ':'In review'}</em></div><div class="tm-sec">1 ${th?'ข้อมูลสินค้า':'Product information'}</div>${lines(92,74)}<div class="tm-sec">2 ${th?'บรีฟสำหรับ KOL':'KOL brief'}</div>${lines(86,58)}<div class="tm-files"><span>${th?'โฟลเดอร์ไฟล์':'Folder link'}</span><span>${th?'ลิงก์แก้ไข':'Edit link'}</span></div></div><figcaption>${th?'ภาพประกอบหน้าจอ (ข้อมูลตัวอย่าง)':'Illustrative screen (sample data)'}</figcaption></figure>`;
 if(title==='WakuFlow Influencer')return `<figure class="tool-mock tool-mock-i" aria-hidden="true"><div class="tm-bar"><i></i><i></i><i></i><span>${th?'ไดเรกทอรีครีเอเตอร์':'Creator directory'}</span></div><div class="tm-body"><div class="tm-filters"><em class="tm-chip on">Nano</em><em class="tm-chip">Micro</em><em class="tm-chip">Mega</em><em class="tm-chip">${th?'แพลตฟอร์ม':'Platform'}</em><em class="tm-chip">${th?'ช่วงราคา':'Price'}</em></div><div class="tm-cards">${['A','B','C'].map((l,n)=>`<div class="tm-card"><div class="tm-avatar">${l}</div><span class="tm-line" style="width:${[70,58,64][n]}%"></span><span class="tm-line" style="width:${[44,52,38][n]}%"></span><em class="tm-chip on">${['Nano','Micro','Nano'][n]}</em></div>`).join('')}</div></div><figcaption>${th?'ภาพประกอบหน้าจอ (ข้อมูลตัวอย่าง)':'Illustrative screen (sample data)'}</figcaption></figure>`;
 if(title==='WakuFlow Tracker')return `<figure class="tool-mock tool-mock-t" aria-hidden="true"><div class="tm-bar"><i></i><i></i><i></i><span>${th?'ผลแคมเปญ':'Campaign results'}</span></div><div class="tm-body"><div class="tm-stats">${[th?'การเข้าถึง':'Engagements',th?'ลิงก์':'Links',th?'QR':'QR scans'].map(l=>`<div class="tm-stat"><span>${l}</span><span class="tm-line tm-num"></span></div>`).join('')}</div><div class="tm-bars">${[38,62,48,80,56,92,70].map(h=>`<i style="height:${h}%"></i>`).join('')}</div><div class="tm-row"><b>${th?'ช่องทาง':'Channel'}</b>${lines(76)}</div><div class="tm-row"><b>${th?'ลิงก์':'Link'}</b>${lines(54)}<em class="tm-chip on">QR</em></div></div><figcaption>${th?'ภาพประกอบหน้าจอ (ข้อมูลตัวอย่าง)':'Illustrative screen (sample data)'}</figcaption></figure>`;
 return '';
}
function renderTopic(){const box=$('#topic');box.hidden=!selectedTopic;if(selectedTopic)box.querySelector('span').textContent=t('caseContext')+': '+COPY.works[selectedTopic].title;}
function renderChoices(){
 $('#service-choices').innerHTML=[...COPY.cards.map((c,i)=>({id:c.id,label:lang==='en'?formAreas[i]:t('categories')[i]})),{id:'other',label:t('other')}].map(c=>`<label class="service-choice"><input type="checkbox" name="areas" value="${c.id}" ${selectedAreas.has(c.id)?'checked':''}><span>${esc(c.label)}</span></label>`).join('');
}
function renderBrands(){
 const brands=clientLogos.map(logo=>`<img src="${logo.src}" alt="${esc(logo.name)}" width="600" height="600" loading="eager" decoding="async" fetchpriority="low">`).join('');
 $('.client-track').innerHTML=`<div class="client-group">${brands}</div><div class="client-group" aria-hidden="true">${brands}</div>`;
}
function enquire(id){
 if(id?.startsWith('P')&&!areasEdited){selectedAreas.clear();selectedAreas.add(id);}
 if(id?.startsWith('C'))selectedTopic=id;
 renderTopic();renderChoices();if($('#detail').open)$('#detail').close();$('#contact').scrollIntoView({behavior:'instant'});
}
function openModal(type,id,show=true){
 const previousScroll=$('#detail').scrollTop;
 modalState={type,id};let content='';
 if(type==='area'){
  const index=COPY.cards.findIndex(c=>c.id===id),c=COPY.cards[index], p=COPY.pages[id];
  const consult=()=>`<div class="detail-cta"><button class="button send" data-contact-open aria-haspopup="dialog" aria-controls="contact-panel">${t('free')}</button><p class="consult-note">${t('freeNote')}</p></div>`;
  const support=`<section class="service-support"><h3>${lang==='th'?'สิ่งที่เราช่วยได้':'How we can help'}</h3><dl>${p.support.map(r=>`<div><dt>${esc(r.title[lang])}</dt><dd>${esc(r[lang])}</dd></div>`).join('')}</dl></section>`;
  const tools=id==='P06'?`<section class="service-tools"><h3>${lang==='th'?'เครื่องมือของ WAKUWAKU':'WAKUWAKU tools'}</h3>${COPY.tools.map(tool=>`<details class="tool-item"><summary><span class="tool-head">${toolLogos[tool.title]?`<img class="tool-logo" src="${toolLogos[tool.title]}" alt="" width="40" height="40" loading="lazy">`:''}<h4>${esc(tool.title)}</h4></span><span class="tool-more">${lang==='th'?'ดูรายละเอียด':'See details'}</span><span class="tool-chev" aria-hidden="true"></span><span class="tool-summary-text">${esc(tool[lang])}</span></summary><div class="tool-body"><ul>${(tool.features?.[lang]||[]).map(f=>`<li>${esc(f)}</li>`).join('')}</ul>${toolMock(tool.title)}${tool.fit?`<p class="tool-fit"><strong>${lang==='th'?'เหมาะกับ':'Best for'}</strong> ${esc(tool.fit[lang])}</p>`:''}</div></details>`).join('')}</section>`:'';
  const steps=`<section class="service-steps"><h3>${lang==='th'?'เริ่มจากเป้าหมายของคุณ':'Start with your objective'}</h3><ol>${COPY.steps.map(step=>`<li>${esc(step[lang])}</li>`).join('')}</ol></section>`;
  content=`<div class="service-detail-image"><img src="${serviceDetailMedia[index]}" alt="${esc(t('categories')[index])}"></div><h2 id="detail-title" tabindex="-1">${esc(p[lang][0])}</h2><p>${esc(p[lang][2])}</p>${consult()}${support}${tools}<section class="related"><h3>${t('related')}</h3><div class="related-grid">${COPY.mapping[id].map(workCardHTML).join('')}</div></section>${steps}${consult()}`;
 }else if(type==='case'){
  const w=COPY.works[id];content=`${parentService?`<button class="detail-back" data-back-service>${lang==='th'?'กลับไปยังบริการ':'Back to service'}</button>`:''}<div class="work-image"${detailMedia[id]?` style="aspect-ratio:${detailMedia[id].ratio}${detailMedia[id].ratio<1.8?';max-height:none':''}"`:''}>${imageHTML(id,true)}</div><div class="work-brand">${esc(w.title)}</div><h2 id="detail-title" tabindex="-1">${esc(w.headline[lang])}</h2>${w.detail[lang].intro?`<p>${esc(w.detail[lang].intro)}</p>`:''}<div class="case-detail-copy">${w.detail[lang].sections.map(s=>`<section><h3>${esc(s.title)}</h3>${paragraphs(s.body.split(/\n\n+/))}</section>`).join('')}</div><div class="tags">${w.tags[lang].map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="detail-cta"><button class="button send" data-contact-open aria-haspopup="dialog" aria-controls="contact-panel">${t('free')}</button></div>`;
 }else{content=`<h2 id="detail-title" tabindex="-1">${t('privacy')}</h2><p>${esc(COPY.privacyShort[lang])}</p><p>${t('privacyPending')}</p>`;}
 $('#detail-content').innerHTML=content;
 closeContact();
 $('#detail').append($('#contact-dock'));
 if(show&&!$('#detail').open)$('#detail').showModal();
 $('#detail').scrollTop=show?0:previousScroll;
}
function startFilms(){
 $('.film-wall').innerHTML=[0,1,2,3].map((i)=>`<div class="film" style="background-image:url('${posters[i]}')"><video muted loop playsinline preload="none" poster="${posters[i]}" aria-hidden="true"></video><div class="film-progress">${[0,1,2,3].map(()=>'<i><b></b></i>').join('')}</div><span class="film-label">WAKUWAKU — <span>01</span></span></div>`).join('');
}
document.addEventListener('click',e=>{
 const anchor=e.target.closest('a[href^="#"]');
 if(anchor){const target=$(anchor.getAttribute('href'));if(target){e.preventDefault();target.scrollIntoView({behavior:'instant'});history.replaceState(null,'',anchor.getAttribute('href'));}}
 const btn=e.target.closest('button');if(btn){
  if(btn.dataset.select!==undefined)selectArea(Number(btn.dataset.select));
  if(btn.dataset.detail){parentService=null;openModal('area',btn.dataset.detail);}
  if(btn.dataset.case){if(modalState?.type==='area')parentService={id:modalState.id,scroll:$('#detail').scrollTop,caseId:btn.dataset.case};openModal('case',btn.dataset.case);$('#detail-title').focus({preventScroll:true});}
  if(btn.hasAttribute('data-back-service')&&parentService){const saved=parentService;openModal('area',saved.id);$('#detail').scrollTop=saved.scroll;$('#detail-content [data-case="'+saved.caseId+'"]').focus({preventScroll:true});parentService=null;}
  if(btn.dataset.enquire)enquire(btn.dataset.enquire);
  if(btn.classList.contains('privacy-link'))openModal('privacy');
 }
 if(e.target.closest('.mobile-menu a')){$('.mobile-menu').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');}
});
$('.language').onclick=()=>{lang=lang==='th'?'en':'th';render()};
$('.menu-toggle').onclick=()=>{const menu=$('.mobile-menu');menu.hidden=!menu.hidden;$('.menu-toggle').setAttribute('aria-expanded',String(!menu.hidden));};
$('#service-prev').onclick=()=>selectArea(active-1);$('#service-next').onclick=()=>selectArea(active+1);
function updateWorkNavigation(){
 const rail=$('.work-rail');
 $('#work-prev').disabled=rail.scrollLeft<=2;
 $('#work-next').disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2;
 $('#work-prev').setAttribute('aria-label',lang==='th'?'ผลงานก่อนหน้า':'Previous project');
 $('#work-next').setAttribute('aria-label',lang==='th'?'ผลงานถัดไป':'Next project');
}
$('#work-prev').onclick=()=>moveWork(-1);
$('#work-next').onclick=()=>moveWork(1);
$('.work-rail').addEventListener('scroll',updateWorkNavigation,{passive:true});
new ResizeObserver(updateWorkNavigation).observe($('.work-rail'));
function moveWork(direction){const rail=$('.work-rail'),gap=parseFloat(getComputedStyle(rail).gap);rail.scrollBy({left:direction*($('.work-card').getBoundingClientRect().width+gap),behavior:reduce.matches?'instant':'smooth'});}
$('.work-rail').addEventListener('keydown',e=>{if(e.target===e.currentTarget&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();moveWork(e.key==='ArrowRight'?1:-1);}});
$('.dialog-close').onclick=()=>$('#detail').close();
 $('#detail').addEventListener('close',()=>{modalState=null;parentService=null;closeContact();document.body.append($('#contact-dock'));});
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#service-choices').addEventListener('change',e=>{if(e.target.name==='areas'){areasEdited=true;if(e.target.checked)selectedAreas.add(e.target.value);else selectedAreas.delete(e.target.value);}});
$('#clear-topic').onclick=()=>{selectedTopic=null;renderTopic()};
$('#enquiry').addEventListener('submit',e=>{
 e.preventDefault();
 const f=new FormData(e.target),th=lang==='th',nl='\r\n';
 const topic=selectedTopic?COPY.works[selectedTopic]?.title:'';
 const areas=[...e.target.querySelectorAll('#service-choices input:checked')].map(i=>i.nextElementSibling.textContent);
 const subject=(th?'สอบถามจากเว็บไซต์ WAKUWAKU':'Enquiry from the WAKUWAKU website')+(topic?' — '+topic:'');
 const body=[th?'เรียนทีม WAKUWAKU':'Hello WAKUWAKU team','',
  (th?'ชื่อ: ':'Name: ')+(f.get('name')||'-'),
  (th?'อีเมลสำหรับติดต่อกลับ: ':'Reply-to email: ')+f.get('email'),
  topic?(th?'ผลงานที่สนใจ: ':'Project of interest: ')+topic:null,
  areas.length?(th?'หัวข้อที่ต้องการปรึกษา: ':'Topics to discuss: ')+areas.join(', '):null,
  '',th?'สินค้าและรายละเอียดที่ต้องการปรึกษา:':'Product and what you would like to discuss:',f.get('message')
 ].filter(l=>l!==null).join(nl);
 location.href='mailto:info@wkwkp.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 $('#form-status').textContent=t('demoDone');
});
let scrollFrame=0;window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{updateScroll();scrollFrame=0;});},{passive:true});
let contactTopic=null;
const contactPanel=$('#contact-panel');
function closeContact(){if(contactPanel.matches(':popover-open'))contactPanel.hidePopover();}
function updateContactContext(){
 contactTopic=modalState?.id||null;
 const title=contactTopic?(contactTopic.startsWith('P')?COPY.cards.find(c=>c.id===contactTopic)?.[lang].title:COPY.works[contactTopic]?.title):null;
 $('#contact-context').hidden=!title;$('#contact-context').textContent=title||'';
 $('#copy-context').hidden=!title;$('#copy-status').textContent='';
 $('#contact-panel a[href^="mailto:"]').href='mailto:info@wkwkp.com'+(title?'?subject='+encodeURIComponent(t('free')+' — '+title):'');
}
contactPanel.addEventListener('beforetoggle',e=>{if(e.newState==='open')updateContactContext();});
contactPanel.addEventListener('toggle',e=>{$('#contact-toggle').setAttribute('aria-expanded',String(e.newState==='open'));if(e.newState==='open')contactPanel.querySelector('a').focus({preventScroll:true});});
document.addEventListener('click',e=>{
 if(e.target.closest('[data-contact-open]'))contactPanel.showPopover();
 if(e.target.closest('[data-contact-form]')){const topic=contactTopic;closeContact();enquire(topic);requestAnimationFrame(()=>$('#enquiry input').focus({preventScroll:true}));}
});
$('#copy-context').onclick=async()=>{try{await navigator.clipboard.writeText($('#contact-context').textContent);$('#copy-status').textContent=t('copied');}catch{$('#copy-status').textContent=t('copyFailed');}};
render();startFilms();updateScroll();
