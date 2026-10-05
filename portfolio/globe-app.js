(() => {
  const root=document.getElementById('will-project-globe');
  const stage=root.querySelector('.globe-stage');
  const svg=d3.select(root.querySelector('.globe-svg'));
  const picker=root.querySelector('.project-picker');
  const layer=root.querySelector('.pin-layer');
  const world=__WORLD_GEOMETRY__;
  const states=__US_GEOMETRY__;
  const land=topojson.feature(world,world.objects.land);
  const stateBorders=topojson.mesh(states,states.objects.states,(a,b)=>a!==b);
  const projects=__PROJECT_DATA__;
  const media=__PROJECT_MEDIA__;
  const mappedProjects=projects.filter(p=>p.coords);
  const dialog=root.querySelector('.figure-dialog');
  const mapParts=Object.fromEntries(['ocean','land','graticule','state-lines','atmosphere','globe-shading','pin-leaders'].map(name=>[name,svg.select('.'+name)]));
  const mapLabels=Object.fromEntries(['zoom-level','zoom-out','zoom-in','world-view','recent-view','map-view-label','map-place','map-coordinate','map-count'].map(name=>[name,root.querySelector('.'+name)]));
  const setLabel=(name,value)=>{if(mapLabels[name].textContent!==value)mapLabels[name].textContent=value;};
  setLabel('map-count',projects.length+' projects');
  const standalone=document.documentElement.dataset.portfolioPage==='true';
  const buttons=new Map(),choices=new Map();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const saved=window.openai?.widgetState;
  const projectFromHash=()=>projects.find(p=>'#project='+p.id===window.location.hash);
  let selected=projectFromHash()||projects.find(p=>p.id===saved?.modelContent?.project)||projects[0];
  let center=selected.coords?[-selected.coords[0],-selected.coords[1],0]:[-104,-18.5,0];
  let zoom=1,width=0,radius=0,frame=0,drawFrame=0,listTimer=0,listLockedUntil=0;
  let drag=null,pinch=null,gestureMoved=false,gesturePinched=false;
  const pointers=new Map();
  const projection=d3.geoOrthographic().clipAngle(90).precision(.5);
  const path=d3.geoPath(projection).digits(1),graticule=d3.geoGraticule().step([30,30])();
  const normalize=value=>((value+180)%360+360)%360-180;
  const clampZoom=value=>Math.max(1,Math.min(4,value));
  const validRotation=value=>Array.isArray(value)&&value.length===3&&value.every(Number.isFinite);
  const initialCamera=regionalCamera(selected);
  center=initialCamera.rotation;zoom=initialCamera.zoom;
  if(validRotation(saved?.privateContent?.rotation))center=saved.privateContent.rotation;
  if(Number.isFinite(saved?.privateContent?.zoom))zoom=clampZoom(saved.privateContent.zoom);
  function persist(){
    const result=window.openai?.setWidgetState?.({modelContent:{project:selected.id,location:selected.location},privateContent:{rotation:center,zoom}});
    result?.catch?.(()=>{});
  }
  function updateCard(){
    root.querySelector('.project-date').textContent=selected.date;
    for(const [selector,key]of [['.project-location','location'],['.project-region','region'],['.project-category','category'],['.project-title','title'],['.project-description','description'],['.project-status','status']])root.querySelector(selector).textContent=selected[key];
    projects.forEach(p=>{buttons.get(p.id).setAttribute('aria-pressed',String(p===selected));choices.get(p.id).setAttribute('aria-pressed',String(p===selected));});
    root.querySelector('.ai-detail').hidden=selected.detail!=='ai';
    root.dataset.project=selected.id;

    root.querySelector('.project-permalink').href='#project='+selected.id;
    root.querySelectorAll('.work-shortcuts a').forEach(a=>{if(a.hash==='#project='+selected.id)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
    const facts=root.querySelector('.project-facts');facts.replaceChildren();facts.hidden=!selected.facts?.length;
    for(const [label,text] of selected.facts||[]){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=text;row.append(dt,dd);facts.append(row);}
    const related=root.querySelector('.related-projects');related.replaceChildren();related.hidden=!selected.related?.length;
    for(const item of selected.related||[]){const a=document.createElement('a');a.href='#project='+item.id;a.textContent=item.label+' →';related.append(a);}

    root.querySelector('.published-scenario').hidden=!selected.publishedScenario;
    if(selected.publishedScenario)drawScenario();
    const video=root.querySelector('.project-video');
    if(video.dataset.project!==selected.id){
      video.replaceChildren();video.dataset.project=selected.id;video.hidden=!(standalone&&selected.video);
      if(!video.hidden){
        const frame=document.createElement('iframe');
        frame.src=selected.video.provider==='youtube'?'https://www.youtube.com/embed/'+selected.video.id+'?playsinline=1&rel=0':'https://player.vimeo.com/video/'+selected.video.id+'?playsinline=1&dnt=1';
        frame.title=selected.title+' video player';frame.loading='lazy';frame.referrerPolicy='strict-origin-when-cross-origin';
        frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;
        video.append(frame);
      }
    }
    const gallery=root.querySelector('.project-gallery');gallery.replaceChildren();gallery.hidden=!selected.media.length;
    selected.media.forEach(id=>gallery.append(makeFigurePreview(id)));
    const links=root.querySelector('.project-links');links.replaceChildren();links.hidden=!selected.links.length;
    selected.links.forEach(link=>{const a=document.createElement('a');a.href=link.url;a.textContent=link.label+' ↗';a.target='_blank';a.rel='noopener noreferrer';links.append(a);});
  }
  function makeFigurePreview(id){
      const figure=media[id],button=document.createElement('button');button.type='button';button.className='figure-preview';button.dataset.figure=id;button.setAttribute('aria-label','Enlarge '+figure.title);
      if(figure.kind)button.dataset.kind=figure.kind;
      const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.src=figure.src;img.alt=figure.alt;img.width=figure.width;img.height=figure.height;
      const label=document.createElement('span');label.textContent=figure.title+' ↗';button.append(img,label);button.addEventListener('click',()=>openFigure(id));
      if(figure.credit){const credit=document.createElement('small');credit.className='figure-credit';credit.textContent=figure.credit;button.append(credit);}
      return button;
  }
  ['safe-financials','safe-emissions','safe-income-components','divestment','backtest','scenarios','enroads','river-runoff','rivers_fyi'].forEach(id=>root.querySelector('.figure-index').append(makeFigurePreview(id)));
  function openFigure(id){
    const figure=media[id];dialog.querySelector('h2').textContent=figure.title;
    const image=dialog.querySelector('img');image.src=standalone?'assets/'+figure.original:figure.src;image.alt=figure.alt;
    dialog.querySelector('figcaption').textContent=figure.caption;
    dialog.querySelector('.original-figure').href=standalone?'assets/'+figure.original:(figure.originalUrl||'https://www.willstauffer.com/assets/img/'+figure.original);
    dialog.dataset.zoomed='false';dialog.style.setProperty('--figure-width',figure.width+'px');dialog.querySelector('.zoom-figure').textContent='Zoom figure';dialog.querySelector('.zoom-figure').setAttribute('aria-pressed','false');
    dialog.showModal();
  }
  function drawScenario(){
    if(!selected.publishedScenario)return;
    const chart=d3.select(root.querySelector('.scenario-chart'));
    const chartWidth=root.querySelector('.published-scenario').clientWidth;
    if(chartWidth<1)return;
    const year=root.querySelector('.scenario-year').value;
    const values=selected.publishedScenario.years[year];
    const rows=[{label:'National commitments (NDC)',value:values.ndc,y:32,kind:'ndc-bar'},{label:'Net Zero 2050',value:values.netZero,y:100,kind:'net-zero-bar'}];
    const scale=d3.scaleLinear().domain([0,600]).range([0,chartWidth-32]);
    chart.attr('viewBox',`0 0 ${chartWidth} 167`).attr('height',167).attr('aria-label',`Modeled net income adjustment in ${year}, in millions of US dollars: Nationally Determined Contributions ${values.ndc}; Net Zero 2050 ${values.netZero}.`);
    chart.selectAll('*').remove();
    chart.selectAll('.scenario-grid').data([0,300,600]).join('line').attr('class','scenario-grid').attr('x1',scale).attr('x2',scale).attr('y1',30).attr('y2',126);
    chart.selectAll('.scenario-tick').data([0,300,600]).join('text').attr('x',scale).attr('y',151).attr('text-anchor',d=>d===0?'start':'middle').text(d=>d);
    chart.selectAll('.scenario-label').data(rows).join('text').attr('x',0).attr('y',d=>d.y-8).text(d=>d.label);
    chart.selectAll('.scenario-bar').data(rows).join('rect').attr('class',d=>'scenario-bar '+d.kind).attr('x',0).attr('y',d=>d.y).attr('width',d=>scale(d.value)).attr('height',24);
    chart.selectAll('.scenario-value').data(rows).join('text').attr('x',d=>scale(d.value)+6).attr('y',d=>d.y+16).text(d=>d.value);
  }
  root.querySelector('.scenario-year').addEventListener('change',drawScenario);
  dialog.querySelector('.zoom-figure').addEventListener('click',()=>{const zoomed=dialog.dataset.zoomed!=='true';dialog.dataset.zoomed=String(zoomed);dialog.querySelector('.zoom-figure').setAttribute('aria-pressed',String(zoomed));dialog.querySelector('.zoom-figure').textContent=zoomed?'Fit figure':'Zoom figure';});
  dialog.querySelector('.close-figure').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  function followList(animate=true){
    clearTimeout(listTimer);listLockedUntil=performance.now()+900;
    picker.scrollTo({top:choices.get(selected.id).offsetTop,behavior:animate&&!reduced.matches?'smooth':'instant'});
  }
  function regionalCamera(project){
    if(!project.coords)return {rotation:center,zoom:1};
    if(project.area!=='usa')return {rotation:[-project.coords[0],-project.coords[1],0],zoom:1};
    const neighbors=mappedProjects.filter(p=>p.area===project.area&&d3.geoDistance(p.coords,project.coords)<Math.PI/9);
    const centroid=d3.geoCentroid({type:'MultiPoint',coordinates:neighbors.map(p=>p.coords)});
    const unit=d3.geoOrthographic().rotate([-centroid[0],-centroid[1],0]).scale(1).translate([0,0]);
    const extent=Math.max(...neighbors.flatMap(p=>unit(p.coords).map(Math.abs)),.05);
    return {rotation:[-centroid[0],-centroid[1],0],zoom:Math.max(1,Math.min(3.2,.30/(.415*extent)))};
  }
  function placePins(front){
    // Only separate overlapping click targets. Keep the geographic anchor fixed.
    const gap=48,margin=24;
    for(let iteration=0;iteration<60;iteration++){
      let overlap=false;
      for(let a=0;a<front.length;a++)for(let b=a+1;b<front.length;b++){
        let dx=front[b].x-front[a].x,dy=front[b].y-front[a].y,distance=Math.hypot(dx,dy);
        if(distance<gap-.01){
          overlap=true;
          if(distance<.01){dx=1;dy=0;distance=1;}
          const shift=(gap-distance)/2;
          front[a].x-=dx/distance*shift;front[a].y-=dy/distance*shift;
          front[b].x+=dx/distance*shift;front[b].y+=dy/distance*shift;
        }
      }
      front.forEach(f=>{f.x=Math.max(margin,Math.min(width-margin,f.x));f.y=Math.max(margin,Math.min(width-margin,f.y));});
      if(!overlap)break;
    }
    return front;
  }
  function requestDraw(){
    // Pointer events can arrive faster than the display can paint.
    if(!drawFrame)drawFrame=requestAnimationFrame(()=>{drawFrame=0;draw();});
  }
  function draw(){
    if(drawFrame){cancelAnimationFrame(drawFrame);drawFrame=0;}
    radius=width*.415*zoom;projection.rotate(center).scale(radius).translate([width/2,width/2]);
    mapParts.ocean.attr('d',path({type:'Sphere'}));mapParts.land.attr('d',path(land));
    mapParts.graticule.attr('d',path(graticule));mapParts['state-lines'].attr('d',zoom>1.4?path(stateBorders):null);
    mapParts.atmosphere.attr('cx',width/2).attr('cy',width/2).attr('r',radius+7);
    mapParts['globe-shading'].attr('cx',width/2).attr('cy',width/2).attr('r',radius);
    const front=placePins(mappedProjects.filter(p=>d3.geoDistance(p.coords,[-center[0],-center[1]])<Math.PI/2-.04).map(p=>{const pos=projection(p.coords);return {p,x:pos[0],y:pos[1],anchorX:pos[0],anchorY:pos[1]};}).filter(f=>f.x>=24&&f.x<=width-24&&f.y>=24&&f.y<=width-24));
    const displaced=front.filter(f=>Math.hypot(f.x-f.anchorX,f.y-f.anchorY)>.5);
    const leaders=mapParts['pin-leaders'];
    leaders.selectAll('line').data(displaced,f=>f.p.id).join('line').attr('x1',f=>f.anchorX).attr('y1',f=>f.anchorY).attr('x2',f=>f.x).attr('y2',f=>f.y);
    const anchors=[...new Map(displaced.map(f=>[f.p.coords.join(','),f])).values()];
    leaders.selectAll('circle').data(anchors,f=>f.p.coords.join(',')).join('circle').attr('cx',f=>f.anchorX).attr('cy',f=>f.anchorY).attr('r',2);
    const visible=new Set(front.map(f=>f.p.id));
    projects.forEach(p=>{const button=buttons.get(p.id),hidden=!visible.has(p.id);if(button.hidden!==hidden)button.hidden=hidden;});
    front.forEach(f=>{buttons.get(f.p.id).style.transform=`translate(${f.x}px,${f.y}px) translate(-50%,-50%)`;});
    setLabel('zoom-level',zoom<1.05?'World':zoom.toFixed(1)+'×');
    mapLabels['zoom-out'].disabled=zoom<=1.01;mapLabels['zoom-in'].disabled=zoom>=3.99;
    const globeMode=zoom<1.05;
    for(const [name,pressed] of [['world-view',globeMode],['recent-view',selected.id==='entelligent'&&!globeMode]]){
      if(mapLabels[name].getAttribute('aria-pressed')!==String(pressed))mapLabels[name].setAttribute('aria-pressed',String(pressed));
    }
    setLabel('map-view-label',globeMode?'Globe view':selected.id==='entelligent'?'Recent AI work':'Regional view');
    setLabel('map-place',globeMode?'Selected projects':selected.location);
    const visibleCenter=[normalize(-center[0]),-center[1]];
    const formatCoordinate=(n,pos,neg)=>Math.abs(n).toFixed(2)+'° '+(n<0?neg:pos);
    setLabel('map-coordinate',formatCoordinate(visibleCenter[1],'N','S')+' / '+formatCoordinate(visibleCenter[0],'E','W'));
    root.dataset.rotation=center.map(v=>Math.round(v*100)/100).join(',');root.dataset.zoom=zoom.toFixed(3);
  }
  function resize(){
    const nextWidth=stage.clientWidth;
    if(nextWidth===width)return;
    width=nextWidth;svg.attr('viewBox',`0 0 ${width} ${width}`);
    const last=choices.get(projects.at(-1).id);
    picker.style.setProperty('--list-tail',Math.max(0,picker.clientHeight-last.offsetHeight)+'px');
    draw();followList(false);if(selected.publishedScenario)drawScenario();
  }
  function moveCamera(target,{animate=true,travel=false}={}){
    cancelAnimationFrame(frame);
    const fromRotation=[...center],fromZoom=zoom;
    const targetRotation=[center[0]+normalize(target.rotation[0]-center[0]),target.rotation[1],0];
    const targetZoom=clampZoom(target.zoom);
    if(!animate||reduced.matches){center=targetRotation;zoom=targetZoom;draw();persist();return;}
    const angular=d3.geoDistance([-center[0],-center[1]],[-targetRotation[0],-targetRotation[1]]);
    const pullBack=travel&&angular>Math.PI/8&&(fromZoom>1.1||targetZoom>1.1);
    const duration=pullBack?1150:650,start=performance.now();
    const tick=now=>{
      const t=Math.min(1,(now-start)/duration);
      if(pullBack){
        const turn=d3.easeCubicInOut(Math.max(0,Math.min(1,(t-.18)/.60)));
        center=[fromRotation[0]+(targetRotation[0]-fromRotation[0])*turn,fromRotation[1]+(targetRotation[1]-fromRotation[1])*turn,0];
        if(t<.22)zoom=fromZoom+(1-fromZoom)*d3.easeCubicOut(t/.22);
        else if(t>.72)zoom=1+(targetZoom-1)*d3.easeCubicInOut((t-.72)/.28);
        else zoom=1;
      }else{
        const eased=d3.easeCubicInOut(t);center=[fromRotation[0]+(targetRotation[0]-fromRotation[0])*eased,fromRotation[1]+(targetRotation[1]-fromRotation[1])*eased,0];zoom=fromZoom+(targetZoom-fromZoom)*eased;
      }
      draw();if(t<1)frame=requestAnimationFrame(tick);else{center=[normalize(center[0]),center[1],0];persist();}
    };
    frame=requestAnimationFrame(tick);
  }
  function selectProject(project,{source='pin',animate=true,historyMode='replace'}={}){
    selected=project;updateCard();if(source!=='scroll')followList(animate);
    if(standalone&&historyMode!=='none'&&window.location.hash!=='#project='+project.id)history[historyMode==='push'?'pushState':'replaceState'](null,'','#project='+project.id);
    moveCamera(regionalCamera(project),{animate,travel:true});
    if(matchMedia('(max-width: 660px)').matches&&['pin','list','recent','link'].includes(source))root.querySelector('.project-card').scrollIntoView({block:'start',behavior:animate&&!reduced.matches?'smooth':'instant'});
  }
  projects.forEach((project,index)=>{
    const pin=document.createElement('button');pin.type='button';pin.className='map-pin';pin.dataset.project=project.id;pin.setAttribute('aria-label','Open '+project.title+' in '+project.location);pin.title=project.title+' · '+project.location;
    const dot=document.createElement('span');dot.className='pin-dot';dot.setAttribute('aria-hidden','true');pin.append(dot);pin.addEventListener('click',()=>selectProject(project));layer.append(pin);buttons.set(project.id,pin);
    const choice=document.createElement('button');choice.type='button';choice.className='project-choice';choice.dataset.project=project.id;
    const date=document.createElement('span');date.className='choice-date';date.textContent=project.date;
    const copy=document.createElement('span');copy.className='choice-copy';
    const location=document.createElement('span');location.className='choice-location';location.textContent=project.location;
    const title=document.createElement('span');title.className='choice-title';title.textContent=project.title;
    copy.append(title,location);choice.append(copy,date);choice.addEventListener('click',()=>selectProject(project,{source:'list'}));picker.append(choice);choices.set(project.id,choice);
  });
  const unlockList=()=>{listLockedUntil=0;};
  picker.addEventListener('wheel',unlockList,{passive:true});picker.addEventListener('pointerdown',unlockList);picker.addEventListener('keydown',unlockList);
  picker.addEventListener('scroll',()=>{
    clearTimeout(listTimer);
    listTimer=setTimeout(()=>{
      if(performance.now()<listLockedUntil)return;
      const nearest=projects.reduce((best,p)=>Math.abs(choices.get(p.id).offsetTop-picker.scrollTop)<Math.abs(choices.get(best.id).offsetTop-picker.scrollTop)?p:best,projects[0]);
      if(nearest!==selected)selectProject(nearest,{source:'scroll'});
    },180);
  },{passive:true});
  root.querySelector('.world-view').addEventListener('click',()=>{
    moveCamera({rotation:center,zoom:1});
    if(matchMedia('(max-width: 660px)').matches)stage.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
  });
  root.querySelector('.recent-view').addEventListener('click',()=>selectProject(projects.find(p=>p.id==='entelligent'),{source:'recent'}));
  root.querySelector('.browse-projects').addEventListener('click',()=>{
    root.querySelector('.list-heading').scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
    choices.get(selected.id).focus({preventScroll:true});
  });
  root.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#project="]');
    if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const project=projects.find(p=>link.hash==='#project='+p.id);if(!project)return;
    event.preventDefault();selectProject(project,{source:'link',historyMode:'push'});
  });
  const followHash=()=>{const project=projectFromHash()||projects[0];if(project!==selected)selectProject(project,{source:'history',animate:false,historyMode:'none'});};
  window.addEventListener('hashchange',followHash);window.addEventListener('popstate',followHash);
  root.querySelector('.zoom-in').addEventListener('click',()=>moveCamera({rotation:center,zoom:zoom*1.4}));
  root.querySelector('.zoom-out').addEventListener('click',()=>moveCamera({rotation:center,zoom:zoom/1.4}));
  root.querySelectorAll('[data-rotate]').forEach(button=>button.addEventListener('click',()=>moveCamera({rotation:[center[0]-Number(button.dataset.rotate),center[1],0],zoom:1})));
  function beginDrag(pointer){drag={x:pointer.x,y:pointer.y,rotation:[...center],zoom};}
  function beginPinch(){const [a,b]=[...pointers.values()];pinch={distance:Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),zoom};drag=null;gesturePinched=true;}
  stage.addEventListener('pointerdown',event=>{
    if(event.target.closest('.map-pin')||(event.pointerType==='mouse'&&event.button!==0))return;
    cancelAnimationFrame(frame);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});stage.setPointerCapture(event.pointerId);stage.dataset.dragging='true';
    if(pointers.size===1){gestureMoved=false;gesturePinched=false;beginDrag(pointers.get(event.pointerId));}else if(pointers.size===2)beginPinch();
  });
  stage.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId))return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.size===2&&pinch){const [a,b]=[...pointers.values()];zoom=clampZoom(pinch.zoom*Math.hypot(b.x-a.x,b.y-a.y)/pinch.distance);requestDraw();return;}
    if(!drag||pointers.size!==1)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y,distance=Math.hypot(dx,dy);
    if(distance>5)gestureMoved=true;
    const exploration=Math.min(1,distance/(width*.28));zoom=drag.zoom+(1-drag.zoom)*exploration;
    const sensitivity=width*.415*Math.sqrt(drag.zoom);
    center=[drag.rotation[0]+dx/sensitivity*65,Math.max(-60,Math.min(60,drag.rotation[1]-dy/sensitivity*65)),0];requestDraw();
  });
  const finish=event=>{
    if(!pointers.has(event.pointerId))return;pointers.delete(event.pointerId);
    if(pointers.size===1){pinch=null;beginDrag([...pointers.values()][0]);return;}
    if(pointers.size)return;drag=null;pinch=null;stage.dataset.dragging='false';center[0]=normalize(center[0]);
    if(gestureMoved&&!gesturePinched&&event.type!=='pointercancel'){
      const nearest=mappedProjects.reduce((best,p)=>d3.geoDistance(p.coords,[-center[0],-center[1]])<d3.geoDistance(best.coords,[-center[0],-center[1]])?p:best,mappedProjects[0]);
      if(d3.geoDistance(nearest.coords,[-center[0],-center[1]])<Math.PI/5)selectProject(nearest,{source:'globe'});else moveCamera({rotation:center,zoom:1});
    }else persist();
  };
  stage.addEventListener('pointerup',finish);stage.addEventListener('pointercancel',finish);stage.addEventListener('lostpointercapture',finish);
  window.addEventListener('openai:set_globals',event=>{
    const incoming=event.detail?.globals?.widgetState,project=projects.find(p=>p.id===incoming?.modelContent?.project);
    if(project){selected=project;updateCard();followList(false);}
    if(validRotation(incoming?.privateContent?.rotation)){cancelAnimationFrame(frame);center=incoming.privateContent.rotation;if(Number.isFinite(incoming.privateContent.zoom))zoom=clampZoom(incoming.privateContent.zoom);draw();}
  });
  updateCard();new ResizeObserver(resize).observe(stage);resize();
})();
