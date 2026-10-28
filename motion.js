// Motion timing is independent of remote video readiness: the page cannot get stuck loading.
const sticky=$('.help-sticky'), serviceTrack=$('.service-scroll');
const wordmark=document.createElement('div');wordmark.className='service-wordmark';wordmark.setAttribute('aria-hidden','true');wordmark.innerHTML='<img src="assets/logo.png" alt=""><img src="assets/logo.png" alt=""><img src="assets/logo.png" alt="">';sticky.prepend(wordmark);
const intro=$('.opening'),skipOpening=$('.opening-skip');
// Measure the stable small viewport rather than mixing vh, svh and innerHeight.
const frameProbe=document.createElement('div');frameProbe.setAttribute('aria-hidden','true');frameProbe.style.cssText='position:fixed;width:0;height:100svh;visibility:hidden;pointer-events:none';document.body.append(frameProbe);
function layoutServices(preserve=false){
 const old=serviceTrack.getBoundingClientRect(),oldPinned=serviceTrack.classList.contains('service-pinned');
 const wasInside=old.top<=Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))&&old.bottom>0;
 const cards=$$('.service-card');if(!cards.length)return;
 // The supplied artwork reserves its lower 45% for copy; grow rather than cover the main slide.
 const wanted=Math.ceil(Math.max(440,...cards.map(c=>{const body=c.querySelector('.card-body');return (body.offsetHeight-parseFloat(getComputedStyle(body).paddingTop))/.45;})));
 const frame=frameProbe.getBoundingClientRect().height;
 const header=$('.header').offsetHeight,gap=parseFloat(getComputedStyle(sticky).gap),bottom=small.matches?92:100;
 // Fit the entire card presentation into the sticky frame without moving copy over the artwork.
 const available=Math.floor(frame-header-(small.matches?14:16)-bottom-$('.service-index').offsetHeight-gap);
 const pin=!reduce.matches&&available>=360;
 const scale=pin?Math.min(1,available/wanted):1;
 serviceTrack.classList.toggle('service-pinned',pin);
 sticky.style.setProperty('--card-height',wanted+'px');
 sticky.style.setProperty('--service-scale',scale);
 sticky.style.setProperty('--visual-height',(wanted*scale)+'px');
 sticky.style.setProperty('--visible-card-width',(cards[0].offsetWidth*scale)+'px');
 const step=Math.round(frame*.5);serviceTrack.dataset.step=step;
 serviceTrack.style.height=pin?(frame+step*6)+'px':'auto';
 if(preserve&&wasInside&&!$('#detail').open){const top=scrollY+serviceTrack.getBoundingClientRect().top;window.scrollTo({top:pin?top+active*step+2:top-header,behavior:'instant'});}
 if(!pin&&oldPinned)setActive(active);
 headerTheme();
}
let resizeFrame=0,lastWidth=0,lastHeight=0;
function scheduleLayout(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{
 const w=document.documentElement.clientWidth,h=frameProbe.getBoundingClientRect().height;
 if(w!==lastWidth||h!==lastHeight){lastWidth=w;lastHeight=h;layoutServices(true);}
 if(!small.matches){$('.mobile-menu').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');}
});}
window.addEventListener('resize',scheduleLayout,{passive:true});
document.fonts.ready.then(()=>layoutServices(true));
let serviceTouch=null;
$('.service-stage').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')serviceTouch={x:e.clientX,y:e.clientY};});
$('.service-stage').addEventListener('pointerup',e=>{if(!serviceTouch)return;const dx=e.clientX-serviceTouch.x,dy=e.clientY-serviceTouch.y;serviceTouch=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)selectArea(active+(dx<0?1:-1));});
$('.service-stage').addEventListener('pointercancel',()=>{serviceTouch=null;});
let openingTimers=[], heroVisible=true, entranceDone=false;
// Each file contains the complete rotating sequence. Playback never seeks to
// arbitrary offsets, so it also works on preview servers without byte ranges.
const filmPlayers=$$('.film video').map((video,index)=>({video,index,pending:null}));
function playVisibleFilms(){
 filmPlayers.forEach(player=>{
  const {video:v,index:i}=player;
  const eligible=!paused&&(!small.matches||i===0);
  if(eligible&&!v.getAttribute('src')){v.muted=true;v.defaultMuted=true;v.preload='auto';v.src=filmSources[i];v.load();}
  if(!eligible||document.hidden||!heroVisible||!entranceDone){v.pause();return;}
  if(!v.paused||player.pending)return;
  player.pending=v.play().catch(()=>v.closest('.film').classList.remove('playing')).finally(()=>{player.pending=null;});
 });
}
function prepareFilms(){
 filmPlayers.forEach(({video:v,index:i})=>{
  v.addEventListener('playing',()=>{v.closest('.film').classList.add('playing');v.removeAttribute('poster');});
  v.addEventListener('error',()=>v.closest('.film').classList.remove('playing'));
  v.addEventListener('canplay',playVisibleFilms);
  v.addEventListener('timeupdate',()=>{
   const position=Math.min(3,Math.floor(v.currentTime/5));
   const progress=Math.min(1,Math.max(0,(v.currentTime-position*5)/5));
   [...v.parentElement.querySelectorAll('.film-progress b')].forEach((b,n)=>b.style.width=(n<position?100:n===position?progress*100:0)+'%');
   v.parentElement.querySelector('.film-label span').textContent='0'+((i+position)%4+1);
  });
 });
 playVisibleFilms();
}
function finishOpening(){openingTimers.forEach(clearTimeout);openingTimers=[];document.documentElement.classList.remove('is-opening');intro.classList.add('done');skipOpening.hidden=true;entranceDone=true;playVisibleFilms();}
function runOpening(){
 openingTimers.forEach(clearTimeout);openingTimers=[];
 if(reduce.matches||location.hash&&location.hash!=='#home'){finishOpening();return;}
 entranceDone=false;intro.classList.remove('done','depart');skipOpening.hidden=false;document.documentElement.classList.add('is-opening');
 $$('.film video').forEach(v=>v.pause());
 openingTimers.push(setTimeout(()=>intro.classList.add('depart'),250));
 openingTimers.push(setTimeout(()=>{document.documentElement.classList.remove('is-opening');entranceDone=true;playVisibleFilms();},1100));
 openingTimers.push(setTimeout(finishOpening,1600));
}
skipOpening.onclick=finishOpening;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!skipOpening.hidden)finishOpening();});
const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('viewed');reveal.unobserve(entry.target);}}),{threshold:.15});
$$('.about h2,#about-copy,.service-heading h2,.section-title,.company-grid,.contact-grid').forEach(el=>{el.classList.add('motion-reveal');if(el.getBoundingClientRect().top>innerHeight)el.classList.add('reveal-pending');reveal.observe(el);});
const heroObserver=new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;if(!heroVisible)$$('.film video').forEach(v=>v.pause());else playVisibleFilms();});heroObserver.observe($('.film-wall'));
document.addEventListener('pointerup',playVisibleFilms,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)$$('.film video').forEach(v=>v.pause());else playVisibleFilms();});
reduce.addEventListener('change',()=>{paused=reduce.matches;if(paused)finishOpening();playVisibleFilms();layoutServices(true);});
function headerTheme(){const light=['about','work','contact'].some(id=>{const r=$('#'+id).getBoundingClientRect();return r.top<=60&&r.bottom>60;});$('.header').classList.toggle('light',light);}
window.addEventListener('scroll',headerTheme,{passive:true});
// Mouse dragging complements touch scrolling and keyboard / arrow controls.
const rail=$('.work-rail');let drag=null, blockClick=false;
rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:rail.scrollLeft,id:e.pointerId};blockClick=false;});
rail.addEventListener('pointermove',e=>{if(!drag)return;const delta=e.clientX-drag.x;if(Math.abs(delta)>6){blockClick=true;rail.classList.add('dragging');if(!rail.hasPointerCapture(e.pointerId))rail.setPointerCapture(e.pointerId);rail.scrollLeft=drag.left-delta;}});
function endDrag(){drag=null;rail.classList.remove('dragging');setTimeout(()=>blockClick=false,0);}
rail.addEventListener('pointerup',endDrag);rail.addEventListener('pointercancel',endDrag);rail.addEventListener('lostpointercapture',endDrag);
rail.addEventListener('click',e=>{if(blockClick){e.preventDefault();e.stopImmediatePropagation();}},true);
const progress=document.createElement('div');progress.className='work-progress';progress.setAttribute('aria-hidden','true');progress.innerHTML='<b></b>';rail.after(progress);
rail.addEventListener('scroll',()=>{const max=rail.scrollWidth-rail.clientWidth;progress.firstChild.style.width=(max?rail.scrollLeft/max*100:100)+'%';},{passive:true});
prepareFilms();runOpening();layoutServices();updateScroll();headerTheme();
small.addEventListener('change',playVisibleFilms);

window.addEventListener('wheel',()=>{if(!entranceDone)finishOpening();},{passive:true});window.addEventListener('touchstart',()=>{if(!entranceDone)finishOpening();},{passive:true});
