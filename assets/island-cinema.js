/* A finite, original project-stills projection, not licensed movie footage. */
(() => {
  function build(c){
    const T=window.THREE,{world,mesh,box,cyl,ball,rod,mat,tag,materials}=c;
    const root=new T.Group();root.name='garden open air cinema';root.position.set(6.6,.77,3.8);root.rotation.y=-Math.PI/2;world.add(root);
    const wood=mat('#665641'),brass=mat('#bca577',.35,.7),velvet=mat('#c9c5a3',.95),stone=mat('#d5cdbb'),ink=mat('#253d38');
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const g=canvas.getContext('2d');
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    const screenMat=new T.MeshBasicMaterial({map:texture});materials.push(screenMat);
    box(3.43,1.98,.075,stone,0,1.28,-1.7,root,'cinema linen screen frame');
    for(const x of[-1.56,1.56]){box(.13,.1,.38,stone,x,.05,-1.7,root,'cinema screen footing');rod([x,.1,-1.7],[x,2.3,-1.7],.033,brass,root);}
    const screen=mesh(new T.PlaneGeometry(3.3,1.856),screenMat,root,'project stills projection screen');screen.position.set(0,1.28,-1.625);screen.castShadow=screen.receiveShadow=false;tag(screen,'cinema-seat');
    for(const [x,z]of[[-.9,0],[.9,0],[-.9,1.4],[0,1.4],[.9,1.4]]){
      const chair=new T.Group();chair.position.set(x,0,z);chair.scale.setScalar(.72);root.add(chair);tag(chair,'cinema-seat');chair.name='small folding camp chair';
      for(const xx of[-.27,.27]){rod([xx,.025,-.23],[xx,.55,.23],.019,brass,chair);rod([xx,.025,.23],[xx,.55,-.23],.019,brass,chair);ball(.032,wood,xx,.29,0,chair);rod([xx,.2,.16],[xx,.94,.33],.018,brass,chair);box(.065,.035,.56,wood,xx,.58,0,chair,'camp chair arm cap');}
      box(.5,.025,.46,velvet,0,.38,0,chair,'linen camping seat');const back=box(.5,.43,.024,velvet,0,.73,.285,chair,'linen camping back');back.rotation.x=.15;
      for(const xx of[-.3,.3])for(const zz of[-.23,.23])box(.065,.025,.07,ink,xx,.02,zz,chair,'camp chair rubber foot');
    }
    // A warm festoon follows the screen edge, supported by two timber uprights.
    for(const x of[-1.85,1.85])rod([x,0,-1.72],[x,2.57,-1.72],.025,wood,root);
    const festoon=mat('#ffdd9c');festoon.emissive=new T.Color('#ffcd7d');festoon.emissiveIntensity=.8;
    const wire=[];for(let i=0;i<=12;i++){const x=-1.85+i*3.7/12,y=2.57-.16*Math.sin(i/12*Math.PI);wire.push([x,y,-1.72]);if(i%2===0){rod([x,y,-1.72],[x,y-.065,-1.72],.005,ink,root);ball(.028,festoon,x,y-.09,-1.72,root);}}c.path(wire,.006,ink,root,'cinema festoon cable');
    // Two small lamps and a real projector beyond the rear seats.
    const lamp=mat('#ffe8ba');lamp.emissive=new T.Color('#ffcf87');lamp.emissiveIntensity=.7;
    for(const x of[-1.8,1.8]){cyl(.12,.14,.055,stone,x,.035,1.25,root);rod([x,.05,1.25],[x,1.1,1.25],.021,ink,root);ball(.09,lamp,x,1.18,1.25,root);}
    const projector=new T.Group();root.add(projector);projector.position.set(1.45,.0,1.6);projector.scale.setScalar(.65);tag(projector,'cinema-seat');
    for(const x of[-.17,.17])rod([x,.02,.15],[x,.7,.06],.016,brass,projector);box(.48,.25,.34,ink,0,.82,0,projector,'cinema projector housing');
    const lens=cyl(.08,.09,.17,brass,0,.82,-.23,projector,'cinema projector lens');lens.rotation.x=Math.PI/2;ball(.058,lamp,0,.82,-.32,projector,[1,1,.12]);
    let elapsed=-1,finished=false,plays=0;const loaded=true;
    function paint(t){if(t<0){g.fillStyle='#080e12';g.fillRect(0,0,1280,720);texture.needsUpdate=true;return;}ISLAND_CINEMA_FILM.draw(g,t,c.locale);texture.needsUpdate=true;}
    function deliver(){if(finished)return;finished=true;elapsed=-1;paint(-1);c.onDiscovery?.({source:'cinema',project:'chinese-doctors',format:'note'});}
    paint(-1);
    return{play(still){if(elapsed>=0)return;plays++;finished=false;elapsed=0;paint(0);if(still){paint(2.6);deliver();}},cancel(){elapsed=-1;paint(-1);},update(dt,still){if(elapsed<0)return;if(still){paint(2.6);deliver();return;}elapsed+=dt;paint(elapsed);if(elapsed>=3)deliver();},busy:()=>elapsed>=0,debug:()=>({position:root.position.toArray(),seats:5,chairScale:.72,screenFacing:'west',screenPosition:[8.225,2.05,3.8],screenWidth:3.3,playing:elapsed>=0,elapsed,plays,media:'original-cotton-and-care-film',actualVideo:true,duration:3,standby:'black',loaded}),dispose(){texture.dispose();}};
  }
  window.ISLAND_CINEMA={build};
})();
