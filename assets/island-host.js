/* The pearl-and-jade greeter hands over a little folio before the reading invitation. */
(() => {
  const T=window.THREE;
  function build(c){
    const rig=ROBOT_CAST.make(c,'host'),{root,body,head,arms,hands,eyes}=rig;root.position.set(...ISLAND_PHYSICS.layout.robot);root.rotation.y=-.2;c.tag(root,'robot');
    const paper=c.mat('#efe9d8',.65,.32),clip=c.mat('#c2af7d',.35,.7),folio=new T.Group();hands[1].add(folio);folio.position.set(0,-.1,.06);folio.rotation.x=Math.PI+.1;
    c.box(.31,.012,.4,paper,0,0,0,folio,'handed project folio');c.box(.29,.008,.38,paper,.008,-.012,.008,folio,'folio underside');c.box(.015,.015,.07,clip,-.1,.012,-.13,folio,'folio brass clip');for(let i=0;i<4;i++)c.box(.19-i%2*.04,.002,.003,clip,0,.009,-.04+i*.036,folio,'printed note line');folio.visible=false;
    c.animated.eyes=eyes;c.animated.eyeMat=rig.eyeMat;c.animated.arm=arms[0];c.animated.smile=new T.Group();
    let time=5,round=0,pending=false;const ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
    function pose(){const reach=ease((time-.6)/1.25),settle=ease((time-3.3)/1.5);body.position.y=.35-Math.sin(Math.min(1,time/1.1)*Math.PI)*.025;head.rotation.z=round?-.14*reach+.04*settle:-.08;head.rotation.x=round?-.08*reach:0;arms[1].rotation.x=round?-1.43*reach+.12*settle:-.1;arms[1].rotation.z=round?.12*reach:0;arms[0].rotation.z=round?-.8*reach+Math.sin(time*7)*.12*(1-settle):-.05;eyes.forEach(e=>e.scale.y=time>.3&&time<.46?.12:1);folio.visible=round>0;}
    pose();return{robot:root,update(dt,still){if(time<4.8){time=still?4.8:Math.min(4.8,time+dt);pose();}if(pending&&(time>=2.3||still)){pending=false;c.onDiscovery?.({project:'zerith-site',format:'note',source:'robot'});}},greet(still){if(pending)return;round++;pending=true;time=still?4.8:0;pose();if(still){pending=false;c.onDiscovery?.({project:'zerith-site',format:'note',source:'robot'});}},cancel(){pending=false;time=4.8;pose();},busy:()=>time<4.8,pending:()=>pending,debug:()=>({style:'pearl-jade-bell',round,time,pending,headTilt:head.rotation.z,noteVisible:folio.visible,position:root.position.toArray()})};
  }
  window.ISLAND_ROBOT={build};
})();
