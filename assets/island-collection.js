/* Eight real records in three wings. Display models are symbolic, never scans. */
(() => {
  const T=window.THREE;
  function build(c){
    const {scene,world,mesh,box:hardBox,ball,cyl,ring,rod,path,mat,star,tag,animated,targets,materials,geometries}=c,records=SPATIAL_CONTENT.awards;
    const oak=mat('#96765d',.57,.04),dark=mat('#3c3830'),wall=mat('#31483c'),gold=mat('#c5ab72',.35,.7),silver=mat('#becbc7',.32,.75),paper=mat('#e8ddbd'),rug=mat('#703948',.97),textures=[],card=mat('#c5ab72',.3,.75),ivory=mat('#d9c9a6'),panel=mat('#3a5344'),coffer=mat('#c9bd9e');card.emissive=new T.Color('#d1a14d');card.emissiveIntensity=.22;
    const paleGold=mat('#d6c59f',.3,.78),bronze=mat('#817153',.47,.65),frameMat=mat('#685442',.49,.15),shadeInside=mat('#ddd1ae',.88);
    // Reusable rounded solids keep true volume and soften both face and depth edges.
    const rounded=new Map();
    function box(w,h,d,m,x=0,y=0,z=0,parent=world,name='rounded gallery joinery'){
      const r=Math.min(.09,w*.22,h*.22),b=Math.min(r*.5,d*.24),key=[w,h,d,r,b].join('/');
      let geo=rounded.get(key);if(!geo){const hw=w/2-b,hh=h/2-b,cr=Math.max(.001,r-b),s=new T.Shape();
        s.moveTo(-hw+cr,-hh);s.lineTo(hw-cr,-hh);s.quadraticCurveTo(hw,-hh,hw,-hh+cr);s.lineTo(hw,hh-cr);s.quadraticCurveTo(hw,hh,hw-cr,hh);s.lineTo(-hw+cr,hh);s.quadraticCurveTo(-hw,hh,-hw,hh-cr);s.lineTo(-hw,-hh+cr);s.quadraticCurveTo(-hw,-hh,-hw+cr,-hh);
        geo=new T.ExtrudeGeometry(s,{depth:d-2*b,steps:1,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:5});geo.translate(0,0,-d/2+b);rounded.set(key,geo);
      }const o=mesh(geo,m,parent,name);o.position.set(x,y,z);return o;
    }
    box(10.7,.2,21.3,oak,0,-.12,1.35,world,'gallery parquet floor');for(let i=0;i<25;i++)box(.018,.015,17.9,dark,-5+i*.42,0,-.3);
    box(.2,6.2,18,wall,-5.3,3,-.3,world,'gallery plaster wall');box(.2,6.2,18,wall,5.3,3,-.3,world,'gallery plaster wall');box(10.7,6.2,.2,wall,0,3,-9.2,world,'gallery plaster wall');box(6.4,.025,21.2,rug,0,.022,1.4,world,'burgundy velvet runner');
    for(const x of[-3.17,3.17])box(.025,.025,21.2,gold,x,.04,1.4);for(const x of[-5.12,5.12]){for(const y of[.2,1.2,5.7])box(.12,.07,18,gold,x,y,-.3);for(const z of[-8,-5,-2,1,4,7])box(.13,5.6,.17,oak,x,2.9,z);}
    for(const x of[-5.13,5.13]){box(.16,.16,18,dark,x,.08,-.3,world,'gallery recessed walnut skirting');box(.175,.025,18,paleGold,x,.174,-.3,world,'gallery fine skirting cap');}
    const linen=mat('#e9dfbf',.93);linen.side=T.DoubleSide;
    for(const z of[-8,-4,0,4,8])for(const x of[-5.12,5.12]){
      const lamp=new T.Group();world.add(lamp);lamp.position.set(x,3.16,z);lamp.rotation.y=x<0?Math.PI/2:-Math.PI/2;
      box(.15,.47,.035,gold,0,.08,0,lamp,'sconce brass backplate');for(const y of[-.1,.26])ball(.014,silver,0,y,.023,lamp,[1,1,.4],'sconce mounting screw');
      box(.112,.415,.008,bronze,0,.08,.023,lamp,'sconce recessed backplate panel');
      rod([0,-.08,.025],[0,-.15,.2],.022,gold,lamp);rod([0,-.15,.2],[0,.12,.29],.022,gold,lamp);
      const glow=mat('#fff2ce');glow.emissive=new T.Color('#ffd293');glow.emissiveIntensity=.75;ball(.067,glow,0,.3,.29,lamp,[1,1.25,1],'frosted sconce bulb');
      mesh(new T.CylinderGeometry(.1,.19,.3,40,1,true),linen,lamp,'linen sconce shade').position.set(0,.32,.29);
      mesh(new T.CylinderGeometry(.095,.184,.292,40,1,true),shadeInside,lamp,'sconce warm shade lining').position.set(0,.32,.29);
      for(const [y,r]of[[.17,.19],[.47,.1]])ring(r,.008,gold,0,y,.29,lamp).rotation.x=Math.PI/2;
      for(let j=0;j<16;j++){const t=j*Math.PI/8;rod([Math.cos(t)*.187,.175,.29+Math.sin(t)*.187],[Math.cos(t)*.098,.465,.29+Math.sin(t)*.098],.0018,linen,lamp);}ball(.023,gold,0,.51,.29,lamp);
      cyl(.058,.058,.025,bronze,0,.155,.29,lamp,'sconce shade fitter');for(const side of[-1,1])rod([0,.155,.29],[side*.13,.178,.29],.006,bronze,lamp);
      const light=new T.PointLight('#ffd7a0',2.2,7,2);light.position.set(x*.94,3.5,z);world.add(light);
    }
    // Paneled walls and a warm, stepped coffered ceiling; no ornament blocks the view.
    for(const x of[-5.16,5.16]){for(const z of[-6.95,-3.45,.05,3.55,7.05]){
      box(.035,3.72,2.92,panel,x,3.03,z,world,'inset painted wall panel');
      for(const zz of[z-1.47,z+1.47])box(.065,3.88,.044,oak,x*.995,3.03,zz,world,'classical wall molding');
      for(const y of[1.09,4.97])box(.066,.045,2.98,oak,x*.995,y,z,world,'classical wall molding');
      for(const zz of[z-1.402,z+1.402])box(.02,3.72,.017,bronze,x*.995,3.03,zz,world,'gallery fine inset panel bead');
      for(const y of[1.17,4.89])box(.02,.017,2.82,bronze,x*.995,y,z,world,'gallery fine inset panel bead');
    }for(const [y,w]of[[5.77,.18],[5.92,.3]])box(w,.09,18,ivory,x, y,-.3,world,'stepped plaster cornice');}
    box(10.7,.14,18,ivory,0,6.17,-.3,world,'ivory plaster ceiling');
    box(9.05,.035,16.3,coffer,0,6.076,-.3,world,'single recessed plaster ceiling');
    for(const x of[-4.55,4.55])box(.055,.04,16.4,ivory,x,6.04,-.3,world,'quiet ceiling perimeter');
    for(const z of[-8.5,7.9])box(9.15,.04,.055,ivory,0,6.04,z,world,'quiet ceiling perimeter');
    for(const x of[-4.64,4.64]){box(.11,.055,16.62,ivory,x,6.085,-.3,world,'ceiling recessed plaster shoulder');box(.014,.018,16.45,paleGold,x*.976,6.018,-.3,world,'ceiling fine brass reveal');}
    for(const z of[-8.59,7.99]){box(9.38,.055,.11,ivory,0,6.085,z,world,'ceiling recessed plaster shoulder');box(9.07,.018,.014,paleGold,0,6.018,z<0?z+.113:z-.113,world,'ceiling fine brass reveal');}
    // The distant wall frames the glass flower without adding another display or sign.
    for(const x of[-3.65,3.65]){box(1.58,4.22,.025,panel,x,3.14,-9.08,world,'gallery far wall inset panel');for(const xx of[x-.81,x+.81])box(.028,4.3,.04,oak,xx,3.14,-9.057,world,'gallery far wall fine molding');for(const y of[.99,5.29])box(1.64,.028,.04,oak,x,y,-9.057,world,'gallery far wall fine molding');}
    for(const z of[-4,4]){const cove=new T.PointLight('#ffe6bc',4,9,2);cove.position.set(0,5.6,z);world.add(cove);}
    const foliage=mat('#245d3b'),pot=mat('#84735a'),soil=mat('#342c24');foliage.side=T.DoubleSide;
    const plantLeaf=ISLAND_BOTANY.leafGeometry();
    for(const [x,z]of[[-4.35,3.35],[4.35,3.35],[-4.35,-.35],[4.35,-.35],[-4.35,-4.05],[4.35,-4.05],[-4.95,7.5],[4.95,7.5]]){
      const g=new T.Group();world.add(g);g.position.set(x<0?x+.35:x-.35,0,z);g.name='cabinet gap planting';
      cyl(.24,.2,.38,pot,0,.23,0,g,'turned ceramic planter');cyl(.255,.255,.03,gold,0,.43,0,g,'planter rim');cyl(.215,.215,.015,soil,0,.44,0,g,'planter soil');cyl(.25,.26,.025,gold,0,.025,0,g,'brass plant tray');
      for(let j=0;j<9;j++){const a=j*2.39996,h=1.05+(j%3)*.23,r=.13+(j%2)*.04;rod([0,.44,0],[Math.cos(a)*r,.44+h,Math.sin(a)*r],.008,foliage,g);const o=mesh(plantLeaf,foliage,g,'folded indoor plant leaf');o.position.set(Math.cos(a)*r,.44+h-.15,Math.sin(a)*r);o.rotation.set(.2,a,(j%2?1:-1)*.35);o.scale.set(.95,.7,.95);}
    }
    const museumEnvironment=ISLAND_VITRINE.environment(c),vitrines=[];
    const glass=new T.MeshPhysicalMaterial({color:'#e3eee4',transparent:true,opacity:.065,roughness:.055,metalness:0,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.1,side:T.DoubleSide,depthWrite:false});materials.push(glass);
    const felt=mat('#1c322b');
    const positions=[[-4.15,5.2],[4.15,5.2],[-4.15,1.5],[4.15,1.5],[-4.15,-2.2],[4.15,-2.2],[-4.15,-5.9],[4.15,-5.9]];
    records.forEach((a,i)=>{const [oldX,z]=positions[i],x=-oldX,g=new T.Group();world.add(g);g.position.set(x,0,z);g.rotation.y=x<0?Math.PI/2:-Math.PI/2;tag(g,'award',i);animated.awards.push(g);
      vitrines.push(ISLAND_VITRINE.build(c,g,{oak,dark,gold,felt,index:i}));
      box(.42,.14,.024,card,0,.95,.925,g,'small luminous metal trophy card');for(const xx of[-.14,.14]){rod([xx,.95,.891],[xx,.95,.915],.014,bronze,g).name='cabinet trophy card spacer';ball(.012,silver,xx,.95,.9415,g,[1,1,.4],'cabinet trophy card fixing');}
      targets.push(new T.Vector3(0,.95,.955).applyEuler(g.rotation).add(g.position));
      const m=a.type==='cup'?silver:gold;
      cyl(.38,.44,.13,dark,0,1.639,0,g,'trophy turned dark foot');
      cyl(.382,.382,.012,bronze,0,1.71,0,g,'trophy foot fine metal reveal');
      cyl(.3,.35,.1,m,0,1.766,0,g,'trophy satin metal foot');
      ring(.301,.008,paleGold,0,1.809,0,g).rotation.x=Math.PI/2;
      if(a.type==='certificate'||a.type==='language'){
        for(const x of[-.22,.22])rod([x,1.816,-.16],[x,2.21,-.085],.021,bronze,g).name='certificate easel support';
        rod([-.32,1.888,.018],[.32,1.888,.018],.018,bronze,g).name='certificate frame lower cradle';
        box(1.12,1.48,.12,frameMat,0,2.62,0,g,'framed professional record');box(1.02,1.38,.035,gold,0,2.62,.08,g);box(.91,1.26,.015,paper,0,2.62,.109,g);
        for(const x of[-.493,.493])box(.012,1.34,.012,paleGold,x,2.62,.102,g,'certificate frame inner bead');
        for(const y of[1.955,3.285])box(.986,.012,.012,paleGold,0,y,.102,g,'certificate frame inner bead');
        const canvas=document.createElement('canvas');canvas.width=512;canvas.height=700;const q=canvas.getContext('2d'),wash=q.createLinearGradient(0,0,512,700);wash.addColorStop(0,'#f0e8d3');wash.addColorStop(1,'#e5dac0');q.fillStyle=wash;q.fillRect(0,0,512,700);
        q.strokeStyle='#b3a178';q.lineWidth=1.5;q.strokeRect(25,25,462,650);q.lineWidth=.7;q.strokeRect(34,34,444,632);
        q.strokeStyle='#ccbfa0';for(let j=0;j<7;j++){q.beginPath();q.moveTo(210+j*7,96);q.lineTo(256,74+j*4);q.lineTo(302-j*7,96);q.stroke();}
        q.fillStyle='#385447';q.textAlign='center';q.font='45px Georgia';q.fillText(a.id==='pmp'?'PMP':a.id==='cet4'?'CET-4':'BRAND',256,220);q.font='18px Segoe UI';q.fillText(a.id==='cet4'?'EVERYDAY BUSINESS':a.id==='pmp'?'PROJECT MANAGEMENT':'JUNIOR ENGINEER',256,278);
        q.fillStyle='#b9ad91';q.fillRect(221,323,70,1);for(let j=0;j<4;j++){q.fillStyle='#c2b69a';const w=324-(j%2)*48;q.fillRect((512-w)/2,380+j*35,w,2);}q.fillStyle='#748575';q.font='15px Segoe UI';q.fillText('SYMBOLIC DISPLAY',256,610);
        const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const face=mat('#ffffff',.8,.1);face.map=tex;const plane=mesh(new T.PlaneGeometry(.9,1.25),face,g,'symbolic record printed face');plane.position.set(0,2.62,.119);
      }else if(a.type==='milestone'){
        // Three connected levels rest on a continuous shallow metal tray.
        box(1.13,.055,.49,bronze,0,1.844,0,g,'promotion milestone supporting tray');
        for(let j=0;j<3;j++){const h=.25+j*.23,x=-.36+j*.36;box(.35,h,.4,j%2?silver:gold,x,1.8715+h/2,0,g,'promotion milestone step');box(.325,.016,.375,paleGold,x,1.8715+h+.008,0,g,'promotion milestone fine cap');}
        cyl(.045,.055,.22,gold,.36,2.7075,0,g,'promotion milestone emblem mount');const emblem=star(.32,gold,g);emblem.position.set(.36,3.045,-.06);
        const inset=star(.235,paleGold,g);inset.position.set(.36,3.045,.096);inset.scale.z=.12;
      }
      else{
        cyl(.09,.16,.568,m,0,2.1,0,g,'trophy tapered stem');
        for(const y of[1.837,2.35])cyl(.105,.105,.024,paleGold,0,y,0,g,'trophy stem turned collar');
        if(a.type==='ring'){
          ring(.59,.075,m,0,2.9,0,g);ring(.517,.011,paleGold,0,2.9,.025,g);
          const gem=mesh(new T.OctahedronGeometry(.31),silver,g,'faceted connector centre');gem.position.set(0,2.9,.015);
          for(let j=0;j<4;j++){const a=j*Math.PI/2;rod([Math.cos(a)*.52,2.9+Math.sin(a)*.52,.01],[Math.cos(a)*.285,2.9+Math.sin(a)*.285,.015],.013,paleGold,g).name='connector centre slender setting';}
        }
        else if(a.type==='star'){
          const emblem=star(.63,m,g);emblem.position.set(0,2.87,-.04);
          const inset=star(.5,paleGold,g);inset.position.set(0,2.87,.116);inset.scale.z=.1;
        }
        else if(a.type==='medal'){
          const disc=cyl(.46,.46,.09,m,0,2.84,0,g,'project medal satin disc');disc.rotation.x=Math.PI/2;
          ring(.448,.015,paleGold,0,2.84,.052,g);ring(.383,.006,bronze,0,2.84,.054,g);
          const emblem=star(.25,paper,g);emblem.position.set(0,2.84,.056);emblem.scale.z=.3;
          for(const side of[-1,1]){
            path([[side*.08,2.38,0],[side*.49,2.5,0],[side*.59,2.87,0],[side*.45,3.22,0]],.014,m,g,'medal supported laurel branch');
            for(let j=0;j<5;j++){const leaf=ball(.069,m,side*(.45+Math.sin(j*.55)*.11),2.52+j*.14,.008,g,[.55,1.45,.35],'medal sculpted laurel leaf');leaf.rotation.z=side*-.55;}
          }
        }
        else{
          cyl(.136,.105,.04,m,0,2.393,0,g,'cup bowl lower ferrule');
          const points=[[.11,0],[.145,.05],[.2,.13],[.31,.3],[.43,.54],[.49,.73],[.47,.78],[.435,.77],[.447,.71],[.4,.53],[.285,.29],[.177,.14],[.11,.1]].map(p=>new T.Vector2(...p));
          const cup=mesh(new T.LatheGeometry(points,64),m,g,'silver cup double wall bowl');cup.position.y=2.413;
          ring(.468,.013,paleGold,0,3.187,0,g).rotation.x=Math.PI/2;
          for(const side of[-1,1])path([[side*.4,3.005,0],[side*.68,3.06,0],[side*.79,2.86,0],[side*.63,2.63,0],[side*.26,2.615,0]],.032,m,g,'silver cup attached scroll handle');
        }
      }

    });
    // Far-end glass flower, an original decorative portal to the sticker studio.
    const flower=new T.Group();world.add(flower);flower.position.set(0,0,-7.5);tag(flower,'gallery-flower');flower.userData.hotspot=new T.Vector3(0,2.1,.3);
    cyl(.66,.72,.13,dark,0,.08,0,flower);cyl(.42,.52,1.03,oak,0,.66,0,flower);cyl(.61,.59,.11,gold,0,1.23,0,flower);cyl(.5,.53,.08,paper,0,1.32,0,flower);rod([0,1.36,0],[0,2.42,0],.028,gold,flower);
    ring(.519,.009,bronze,0,.16,0,flower).rotation.x=Math.PI/2;ring(.422,.009,paleGold,0,1.165,0,flower).rotation.x=Math.PI/2;
    const rose=mat('#e8b0a0',.38,.4),leaf=mat('#5e9278',.5,.3);const leafGeo=ISLAND_BOTANY.leafGeometry(),petals=[];
    for(const side of[-1,1]){const o=mesh(leafGeo,leaf,flower,'sculpted flower leaf');o.position.set(0,1.67,0);o.scale.set(.75,.55,.75);o.rotation.z=side*.85;}
    for(let i=0;i<7;i++){const hinge=new T.Group();flower.add(hinge);hinge.position.set(0,2.34,0);hinge.rotation.y=i*Math.PI*2/7;const petal=ball(.22,rose,0,.17,.12,hinge,[.75,1.55,.45],'kinetic flower petal');petals.push(hinge);}
    ball(.13,gold,0,2.4,0,flower);const dome=mesh(new T.LatheGeometry([[.53,0],[.53,.6],[.5,1.1],[.4,1.4],[.2,1.57],[0,1.62]].map(p=>new T.Vector2(...p)),48),glass,flower,'flower bell jar');dome.position.y=1.38;ring(.53,.02,gold,0,1.38,0,flower).rotation.x=Math.PI/2;
    const accent=new T.SpotLight('#ffe2ac',24,9,.35,.7,1.8);accent.position.set(0,5.7,-6.8);accent.target.position.set(0,2,-7.5);world.add(accent,accent.target);
    const cleaner=ROBOT_CAST.make(c,'cleaner');cleaner.root.position.set(1.05,.84,-7.5);cleaner.root.rotation.y=-Math.PI/2;cleaner.arms[1].visible=false;for(let i=1;i<=3;i++)box(.46,.055,.23,oak,1.05,i*.28,-7.5+(3-i)*.22,world,'cleaner ladder tread');for(const x of[.85,1.25])rod([x,0,-6.96],[x,.87,-7.5],.025,oak);for(const x of[.85,1.25])rod([x,0,-7.66],[x,.87,-7.5],.025,oak);
    const elbow=rod([1.05,.9,-7.2],[.8,1.15,-7.4],.0125,silver),forearm=rod([.8,1.15,-7.4],[.54,1.6,-7.5],.0115,silver),hand=ball(.03,gold,.54,1.6,-7.5),pad=box(.025,.1,.2,paper,.53,1.6,-7.5,world,'glass wiping cloth');
    for(const o of[elbow,forearm,hand,pad])o.userData.dynamic=true;
    let clock=0,opening=-1,arrived=false;function link(o,a,b){const d=b.clone().sub(a);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());o.scale.y=d.length()/o.geometry.parameters.height;}
    return{open(still){if(opening>=0)return;opening=still?1.4:0;if(still&&!arrived){arrived=true;c.onPortrait?.();}},update(dt,still){if(!still)clock+=dt;const y=1.55+Math.sin(clock*1.2)*.15,z=-7.5+Math.cos(clock*1.2)*.15,target=new T.Vector3(.54,y,z),joint=new T.Vector3(.78,1.38,z+.06);world.updateMatrixWorld(true);const shoulder=cleaner.arms[1].getWorldPosition(new T.Vector3());link(elbow,shoulder,joint);link(forearm,joint,target);hand.position.copy(target);pad.position.set(.53,y,z);cleaner.head.rotation.z=Math.sin(clock*.7)*.045;
      if(opening>=0){opening=Math.min(1.4,opening+(still?1.4:dt));const t=T.MathUtils.smoothstep(opening,0,1.1);petals.forEach(p=>p.rotation.x=t*.9);cleaner.arms[0].rotation.x=-t*.7;if(opening===1.4&&!arrived){arrived=true;c.onPortrait?.();}}
    },busy:()=>true,debug:()=>({records:records.length,cabinetRows:2,cabinetCount:8,ceilingSpots:9,exhibitTopLights:vitrines.length,curvedGlassCases:vitrines.length,museumDisplays:vitrines.map(v=>v.debug()),aisleWidth:ISLAND_VITRINE.dimensions.frontX*2,drawers:0,divided:false,rug:'burgundy',rugWidth:6.4,roundedJoinery:true,cabinetFrontX:ISLAND_VITRINE.dimensions.frontX,plants:8,ceilingRecesses:1,cofferedCeiling:false,plaquesOnCabinetFront:true,refinedSconces:10,hoverPlaques:true,rowsSwapped:true,flower:{position:flower.position.toArray(),opening},cleaner:{style:'slender-brass',time:clock,position:cleaner.root.position.toArray(),pad:pad.position.toArray()}}),dispose(){museumEnvironment.dispose();textures.forEach(t=>t.dispose());}};
  }
  window.ISLAND_COLLECTION={build};
})();
