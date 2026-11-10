/* Original small companion. Articulated parts and a finite flower greeting. */
(() => {
  const T=window.THREE;
  function build(c){
    const {world,ball,cyl,rod,ring,path,mat,tag,animated}=c;
    const pearl=mat('#e9e8d7',.52,.42),mint=mat('#819d94',.48,.48),dark=mat('#173941',.33,.5),rose=mat('#d4a49a',.48,.46),gold=mat('#c6b181',.35,.68),leaf=mat('#658b78',.54,.35);
    const eye=mat('#b8eee0',.28,.32);eye.emissive=new T.Color('#62d4c1');eye.emissiveIntensity=.6;
    const robot=new T.Group();world.add(robot);robot.name='small flower companion';robot.scale.setScalar(.5);robot.position.set(...window.ISLAND_PHYSICS.layout.robot);robot.rotation.y=.5;tag(robot,'robot');
    for(const side of[-1,1]){ball(.145,mint,side*.18,.085,.07,robot,[1,.57,1.55],'rounded grounded robot boot');cyl(.085,.095,.2,gold,side*.18,.21,0,robot,'short ankle');const rim=ring(.087,.012,pearl,side*.18,.22,0,robot);rim.rotation.x=Math.PI/2;}
    const body=new T.Group();robot.add(body);body.position.y=.22;
    ball(.34,pearl,0,.3,0,body,[1,1.12,.8],'pearl pear-shaped body');ball(.24,mint,0,.14,-.025,body,[1,.8,.9],'lower shell');
    const badge=cyl(.085,.085,.027,gold,0,.37,.271,body,'brushed chest medallion');badge.rotation.x=Math.PI/2;const center=ball(.04,rose,0,.37,.292,body,[1,1,.35]);
    for(const x of[-.1,0,.1])ball(.014,gold,x,.24,.244,body,[1,1,.4],'status pin');
    cyl(.11,.14,.12,gold,0,.68,0,body,'neck pivot');
    const head=new T.Group();body.add(head);head.position.y=.78;
    ball(.49,pearl,0,.1,0,head,[1,.84,.78],'rounded oversized head shell');ball(.37,dark,0,.09,.305,head,[1,.6,.29],'inset dark face glass');
    const eyes=[];for(const x of[-.135,.135])eyes.push(ball(.058,eye,x,.115,.406,head,[.8,1,.35],'luminous oval eye'));
    const smile=path([[-.082,.006,.405],[0,-.024,.417],[.082,.006,.405]],.011,eye,head,'small smile');
    for(const side of[-1,1]){ball(.087,mint,side*.477,.12,0,head,[.35,1,1],'ear disc');ball(.037,rose,side*.288,.033,.314,head,[1,.67,.35],'warm cheek lens');ball(.017,gold,side*.479,.12,.079,head);}
    rod([0,.49,-.04],[0,.61,-.04],.018,gold,head);ball(.053,rose,0,.635,-.04,head,[1,.9,1],'antenna bud');
    const arms=[];for(const side of[-1,1]){const a=new T.Group();body.add(a);a.position.set(side*.33,.47,0);ball(.1,gold,0,0,0,a);rod([0,-.02,0],[side*.035,-.24,.025],.077,pearl,a);ball(.1,pearl,side*.035,-.3,.025,a,[.9,1,.9],'mitten palm');arms.push(a);}
    const flower=new T.Group();arms[1].add(flower);flower.position.set(.035,-.3,.07);rod([0,0,0],[0,-.25,0],.013,leaf,flower);const blade=ball(.056,leaf,.036,-.1,0,flower,[1.1,.48,.3]);blade.rotation.z=-.5;
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const p=ball(.058,rose,Math.sin(a)*.065,-.27+Math.cos(a)*.065,0,flower,[.8,1,.45],'gift flower petal');p.rotation.z=-a;}
    ball(.04,gold,0,-.27,.027,flower,[1,1,.45],'gift flower center');
    animated.eyes=eyes;animated.eyeMat=eye;animated.smile=smile;animated.arm=arms[0];
    let time=5,round=0,offered=false;
    const ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
    function pose(){
      const t=Math.min(time,4.8),reach=ease((t-.7)/1.1),settle=ease((t-3.4)/1.4),bounce=Math.sin(Math.min(1,t/1.2)*Math.PI)*.065;
      body.position.y=.22-bounce*.4+Math.sin(Math.min(1,Math.max(0,t-1.1)/1.3)*Math.PI)*.045;
      head.rotation.z=round?-.14*reach+.05*settle:-.045;head.rotation.y=round?.18*reach:0;
      head.rotation.x=round?-.12*reach:0;
      arms[1].rotation.x=offered?-1.38*reach+.14*settle:-.18;
      arms[1].rotation.z=offered?.12*reach:0;
      const wave=t>1.2&&t<3.2?Math.sin((t-1.2)*9)*.18:0;
      arms[0].rotation.z=round?-.9*reach+wave+.42*settle:-.08;arms[0].rotation.x=round?-.35*reach:0;
      const blink=t>.38&&t<.6?.12:1;eyes.forEach((e,i)=>{e.scale.y=blink*(round%3===2&&i===1?.25:1);});
      smile.visible=true;
    }
    pose();return{robot,update(dt,still){if(time<4.8){time=still?4.8:Math.min(4.8,time+dt);pose();}},greet(still){round++;offered=true;time=still?4.8:0;pose();},busy:()=>time<4.8,debug:()=>({height:1.67,round,offered,time,headTilt:head.rotation.z,flower:flower.getWorldPosition(new T.Vector3()).toArray(),position:robot.position.toArray()})};
  }
  window.ISLAND_ROBOT={build};
})();
