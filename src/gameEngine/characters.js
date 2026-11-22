const PALS = {
  hero0:{skin:'#f2c9a0',hair:'#3a2a1a',hs:'short',shirt:'#2f9e6a',pants:'#35435a',hat:'bandana',hc:'#e0483a'},
  hero1:{skin:'#e8b890',hair:'#1b1b22',hs:'long',shirt:'#3b82d9',pants:'#4a3a6a',hat:'cap',hc:'#f4f4f4'},
  hero2:{skin:'#c98e62',hair:'#5a2a1a',hs:'short',shirt:'#9a4ad0',pants:'#2a3a4a',hat:'none'},
  hero3:{skin:'#f6d7b8',hair:'#e8b040',hs:'bun',shirt:'#f08a2e',pants:'#3a4a6a',hat:'none'},
  mama:{skin:'#f0c8a0',hair:'#8a4b2a',hs:'bun',shirt:'#e86a8a',pants:'#6a4c93',ex:['apron']},
  prof:{skin:'#f0c8a0',hair:'#e8e8e8',hs:'short',shirt:'#4a5a8a',pants:'#3a4a5a',ex:['coat','glasses']},
  tendero:{skin:'#d9a577',hair:'#3a2a1a',hs:'short',shirt:'#3b82d9',pants:'#4a4a5a',ex:['apron']},
  clienta:{skin:'#f0c8a0',hair:'#a0522d',hs:'long',shirt:'#8ac6a0',pants:'#5a5a7a'},
  enfermera:{skin:'#f5d2b0',hair:'#f8a8c8',hs:'long',shirt:'#ffffff',pants:'#f070a8',hat:'cap',hc:'#ffffff'},
  posadera:{skin:'#e0b080',hair:'#7a3b1a',hs:'bun',shirt:'#f2994a',pants:'#6a4a3a',ex:['apron']},
  posadero:{skin:'#d9a577',hair:'#8a8a8a',hs:'bald',shirt:'#a8683a',pants:'#4a3a2a',ex:['beard']},
  guardia:{skin:'#c88a5a',hair:'#222222',hs:'short',shirt:'#566b7f',pants:'#3a4350',hat:'helmet',hc:'#8a9aaa'},
  nina:{skin:'#f0c8a0',hair:'#ffd24a',hs:'long',shirt:'#ff7ab6',pants:'#ffffff'},
  viejo:{skin:'#d9b08a',hair:'#d0d0d0',hs:'bald',shirt:'#6a8f5a',pants:'#5a4a3a',ex:['beard']},
  cochero:{skin:'#e0b080',hair:'#3a2a1a',hs:'short',shirt:'#c9a227',pants:'#4a3a2a',hat:'hat',hc:'#5a3a1a',ex:['scarf']},
  abuela:{skin:'#eecaa6',hair:'#e0e0e0',hs:'bun',shirt:'#9a7ac8',pants:'#5a4a6a',ex:['apron']},
  teo:{skin:'#e8b890',hair:'#5a3a1a',hs:'short',shirt:'#5aa84a',pants:'#6a5a3a',hat:'cap',hc:'#5aa84a'},
  pia:{skin:'#f0c8a0',hair:'#c0602a',hs:'long',shirt:'#f7d84a',pants:'#d86a8a'},
  nemo:{skin:'#c88a5a',hair:'#222222',hs:'short',shirt:'#e8d8a0',pants:'#2f6ab0',hat:'hat',hc:'#e8d070'},
  lia:{skin:'#f6d7b8',hair:'#2a7ad8',hs:'long',shirt:'#3ab8d8',pants:'#2a5a9a'},
  marea:{skin:'#d9a577',hair:'#8a4a2a',hs:'bun',shirt:'#e86a5a',pants:'#3a5a8a',hat:'bandana',hc:'#3ab8d8'},
  anciano:{skin:'#d9b08a',hair:'#e8e8e8',hs:'bald',shirt:'#3a8aa8',pants:'#4a4a5a',ex:['beard']},
  rogelio:{skin:'#c88a5a',hair:'#3a2a1a',hs:'short',shirt:'#3a7a3a',pants:'#5a4a2a',hat:'hat',hc:'#4a6a2a',ex:['beard']},
  zarza:{skin:'#e8d0b0',hair:'#6a2a8a',hs:'long',shirt:'#5a2a7a',pants:'#2a2a3a',hat:'hood',hc:'#5a2a7a'},
  duende:{skin:'#a8d890',hair:'#4a8a3a',hs:'short',shirt:'#8a6a3a',pants:'#5a4a2a',hat:'cap',hc:'#c0402a'},
  alcalde:{skin:'#d9a577',hair:'#9a9a9a',hs:'short',shirt:'#7a8aaa',pants:'#3a3a4a',ex:['scarf','glasses']},
  nino:{skin:'#f0c8a0',hair:'#3a3a5a',hs:'short',shirt:'#e8a83a',pants:'#4a6a8a',hat:'cap',hc:'#4a6a8a'},
  pico:{skin:'#c88a5a',hair:'#3a2a1a',hs:'short',shirt:'#8a7a6a',pants:'#4a4a5a',hat:'helmet',hc:'#e8b030'},
  quartz:{skin:'#f0c8a0',hair:'#8a3ac8',hs:'bun',shirt:'#e8e0f0',pants:'#5a4a8a',ex:['glasses','coat']},
  eco:{skin:'#d9b08a',hair:'#8a8a9a',hs:'bald',shirt:'#6a5a8a',pants:'#3a3a4a',ex:['beard','cape'],exc:'#7a5aa8'},
  chispa:{skin:'#b87a4a',hair:'#222222',hs:'short',shirt:'#c0602a',pants:'#3a3a3a',ex:['apron']},
  capitan:{skin:'#d9a577',hair:'#5a5a5a',hs:'short',shirt:'#a83a2a',pants:'#3a3a4a',hat:'hat',hc:'#a83a2a',ex:['beard']},
  brasa:{skin:'#c88a5a',hair:'#e0602a',hs:'short',shirt:'#d84a1a',pants:'#3a2a2a',hat:'bandana',hc:'#ffb02e'},
  lava:{skin:'#f0c8a0',hair:'#c8281a',hs:'long',shirt:'#e8e0d0',pants:'#5a3a3a',ex:['glasses']},
};

const characters = {};
function generateChar(key){
  const s = 1;
  const cv = document.createElement('canvas'); 
  cv.width = 48*s;
  cv.height = 96*s; 
  const ctx = cv.getContext('2d');
  ['down','up','left','right'].forEach((dir,di) => { for(let f=0;f<3;f++){ ctx.save(); ctx.translate(f*16, di*24); drawChar(ctx, dir, f, PALS[key]); ctx.restore(); } });
  characters[key] = cv;
  return cv;
}


function mix(hex, amt){
  const n = parseInt(hex.slice(1),16); let r=n>>16, g=(n>>8)&255, b=n&255, t = amt<0?0:255, p = Math.abs(amt);
  r=Math.round((t-r)*p+r); g=Math.round((t-g)*p+g); b=Math.round((t-b)*p+b);
  return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
 
  
function drawChar(ctx, dir, f, p){
  const R = (x,y,w,h,c) => { ctx.fillStyle = c; ctx.fillRect(x,y,w,h); };
  const skin = p.skin, hair = p.hair, shirt = p.shirt, dsh = mix(shirt,-.25), pants = p.pants, ex = p.ex || [], shoe = '#2a2230';
  const side = dir === 'left' || dir === 'right', back = dir === 'up', fl = dir === 'left';
  ctx.globalAlpha = .25; R(3,21,10,2,'#000'); ctx.globalAlpha = 1;
  const l1 = f===1?1:0, l2 = f===2?1:0;
  if(side){ R(6,17-l1,3,3,pants); R(6,20-l1,3,1,shoe); R(8,17-l2,3,3,mix(pants,-.2)); R(8,20-l2,3,1,shoe); }
  else { R(5,17-l1,3,3,pants); R(5,20-l1,3,1,shoe); R(8,17-l2,3,3,pants); R(8,20-l2,3,1,shoe); }
  if(ex.includes('cape') && back) R(3,10,10,9,p.exc||'#7a5aa8');
  R(4,10,8,7,shirt); R(4,15,8,2,dsh);
  if(side){ R(7,11,3,5,dsh); R(7,15,3,1,skin); } else { R(3,11,1,5,shirt); R(12,11,1,5,shirt); R(3,15,1,1,skin); R(12,15,1,1,skin); }
  if(ex.includes('coat')) { R(3,10,10,8,'#f4f6f8'); R(4,10,8,1,'#d4dae0'); if(!back && !side) R(7,10,2,8,shirt); }
  if(ex.includes('apron') && !back){ if(side) R(fl?5:9,11,2,6,'#f4f1e8'); else { R(5,11,6,6,'#f4f1e8'); R(5,16,6,1,'#d8d0c0'); } }
  if(ex.includes('scarf')) R(4,9,8,2,p.exc||'#d84a3a');
  if(ex.includes('cape') && !back) { R(3,10,1,7,p.exc||'#7a5aa8'); R(12,10,1,7,p.exc||'#7a5aa8'); }
  R(4,2,8,8,skin); ctx.clearRect(4,2,1,1); ctx.clearRect(11,2,1,1); ctx.clearRect(4,9,1,1); ctx.clearRect(11,9,1,1);
  const hs = p.hs; const noHair = p.hat==='hood';
  if(!noHair){
    if(back){ R(3,1,10,9,hair); if(hs==='long') R(3,9,10,4,hair); if(hs==='bun') R(6,0,4,2,hair); }
    else if(side){ R(3,1,10,3,hair); const bx = dir==='left'?8:3; if(hs!=='bald') R(bx,3,5,6,hair); if(hs==='long') R(bx,9,5,4,hair); if(hs==='bun') R(6,0,4,2,hair); R(dir==='left'?3:12,3,1,2,hair); }
    else { if(hs!=='bald'){ R(3,1,10,3,hair); R(3,3,1,3,hair); R(12,3,1,3,hair); R(4,3,8,1,hair); } else { R(3,3,1,3,hair); R(12,3,1,3,hair); } if(hs==='long'){ R(3,3,2,8,hair); R(11,3,2,8,hair); } if(hs==='bun') R(6,0,4,2,hair); }
  }
  if(!back){
    const ey = '#18181c';
    if(side){ R(dir==='left'?5:10,6,1,2,ey); } else { R(6,6,1,2,ey); R(9,6,1,2,ey); R(7,8,2,1,'#b5705a'); }
    if(ex.includes('glasses')){ if(side) R(dir==='left'?4:9,5,3,3,'#cfe8ff'), R(dir==='left'?5:10,6,1,2,ey); else { R(5,5,6,1,'#333'); R(5,6,2,2,'#cfe8ff'); R(9,6,2,2,'#cfe8ff'); R(6,6,1,2,ey); R(9,6,1,2,ey); } }
    if(ex.includes('beard')){ if(side) R(dir==='left'?4:8,8,4,3,hair==='#3a2a1a'?'#5a4a3a':'#e8e8e8'); else R(5,8,6,3,hair==='#3a2a1a'||hair==='#3a2a1a'?'#5a4a3a':'#e8e8e8'); }
  }
  const hc = p.hc;
  if(p.hat === 'cap'){ R(3,0,10,3,hc); R(3,3,10,1,mix(hc,-.3)); if(side) R(dir==='left'?1:9,3,6,1,mix(hc,-.3)); }
  if(p.hat === 'hat'){ R(5,0,6,3,hc); R(2,3,12,1,mix(hc,-.25)); R(5,2,6,1,mix(hc,-.4)); }
  if(p.hat === 'bandana'){ R(3,1,10,2,hc); if(!side) R(12,2,2,2,hc); else R(dir==='left'?11:3,2,2,2,hc); }
  if(p.hat === 'helmet'){ R(3,0,10,4,hc); R(5,1,2,1,mix(hc,.5)); R(3,4,10,1,mix(hc,-.3)); }
  if(p.hat === 'hood'){ R(3,1,10,3,hc); R(3,3,1,7,hc); R(12,3,1,7,hc); if(back) R(3,1,10,10,hc); R(4,3,8,1,mix(hc,-.3)); }
}

export function getCharacter(key){
    if(!characters[key]) generateChar(key);
    return characters[key];
}