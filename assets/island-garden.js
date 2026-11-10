/* Rooted planting: attached botanical parts, shared buffers and quiet local variation. */
(() => {
  const T=window.THREE;
  function build(c){
    const {world,geometries,mat,box,cyl,ball,ring,rod}=c;
    const sage=mat('#4c8e50',.8),leafSage=mat('#4c8e50',.8),leaf=mat('#245f3d',.82),cream=mat('#eee5d1',.7),petalCream=mat('#eee5d1',.7),rose=mat('#cfb1bb',.72),lilac=mat('#a7a5be',.72),pollen=mat('#b39a63',.65,.12),wood=mat('#a58963'),ink=mat('#254e48');
    const dummy=new T.Object3D(),up=new T.Vector3(0,1,0),batches=[];let rootedShoots=0,fernCrowns=0;
    function batch(geo,m,max,name){if(!geometries.includes(geo))geometries.push(geo);const o=new T.InstancedMesh(geo,m,max);o.name=name;o.castShadow=o.receiveShadow=true;o.count=0;world.add(o);batches.push(o);return o;}
    function petalGeometry(){
      const v=[],ix=[],colors=[],uv=[],rows=5;
      for(let i=0;i<=rows;i++){const t=i/rows,w=.004+.37*Math.pow(Math.sin(Math.PI*t),.58);for(let j=0;j<3;j++){const f=j-1;v.push(f*w*(1+.055*Math.sin(t*9)),.11*t*t+.09*Math.sin(Math.PI*t)+.08*f*f*Math.sin(Math.PI*t),t);const tone=.79+.19*t+.025*Math.abs(f);colors.push(tone,tone,tone);uv.push(j/2,t);}if(i<rows)for(let j=0;j<2;j++){const a=i*3+j,b=a+3;ix.push(a,b,a+1,a+1,b,b+1);}}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
    }
    // Raised individual disc florets are baked into the seed head's one geometry.
    function seedGeometry(){
      const v=[],ix=[],uv=[];
      function append(g,m){const p=g.attributes.position,u=g.attributes.uv,n=v.length/3;for(let i=0;i<p.count;i++){const q=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m);v.push(q.x,q.y,q.z);uv.push(u?u.getX(i):0,u?u.getY(i):0);}const index=g.index?g.index.array:Array.from({length:p.count},(_,i)=>i);for(const i of index)ix.push(n+i);g.dispose();}
      append(new T.SphereGeometry(1,8,4),new T.Matrix4().makeScale(1,.44,1));
      for(let j=0;j<7;j++){const a=j*2.39996,r=.8*Math.sqrt((j+.5)/7),m=new T.Matrix4().compose(new T.Vector3(Math.cos(a)*r,.39*Math.sqrt(1-r*r),Math.sin(a)*r),new T.Quaternion(),new T.Vector3(.23,.17,.23));append(new T.IcosahedronGeometry(1,0),m);}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
    }
    for(const material of[leafSage,petalCream,rose]){material.side=T.DoubleSide;material.vertexColors=true;}
    const stemGeo=new T.CylinderGeometry(.006,.013,1,5),foldedLeaf=ISLAND_BOTANY.leafGeometry(),petalGeo=petalGeometry();
    const stems=batch(stemGeo,leaf,12000,'rooted flower stems and attached shrub shoots'),leaves=batch(foldedLeaf,leafSage,6000,'garden folded leaves and calyxes'),petals=batch(petalGeo,petalCream,1600,'ivory spoon-shaped flower petals'),pink=batch(petalGeo,rose,3600,'rose hydrangea floret petals'),purple=batch(new T.LatheGeometry([new T.Vector2(.5,0),new T.Vector2(.9,.24),new T.Vector2(1,.55),new T.Vector2(.7,.88),new T.Vector2(.13,1.05)],6),lilac,2500,'lavender paired flower buds'),centers=batch(seedGeometry(),pollen,180,'raised flower disc florets'),floretEyes=batch(new T.OctahedronGeometry(1,0),pollen,700,'hydrangea tiny fertile florets');
    function put(o,x,y,z,sx,sy,sz,rz=0,ry=0){dummy.position.set(x,y,z);dummy.rotation.set(0,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();o.setMatrixAt(o.count++,dummy.matrix);}
    function shoot(a,b,width=1){const d=b.clone().sub(a);if(d.lengthSq()<1e-9)return;dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,d.clone().normalize());dummy.scale.set(width,d.length(),width);dummy.updateMatrix();stems.setMatrixAt(stems.count++,dummy.matrix);rootedShoots++;}
    function foliage(o,p,d,length,width=1,twist=0){dummy.position.copy(p);dummy.quaternion.setFromUnitVectors(up,d.clone().normalize());dummy.rotateY(twist);dummy.scale.set(length*width,length,length);dummy.updateMatrix();o.setMatrixAt(o.count++,dummy.matrix);}
    let seed=43;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const local=(x,z,k)=>{const n=Math.sin(x*17.31+z*31.17+k*47.2)*12783.143;return n-Math.floor(n);};
    function flower(x,z,type,h){
      const base=ISLAND_LANDSCAPE.renderHeight(x,z),a=local(x,z,1)*Math.PI*2,bend=.018+local(x,z,2)*.018,root=new T.Vector3(x,base+.004,z),joint=root.clone().add(new T.Vector3(Math.cos(a)*bend,h*.53,Math.sin(a)*bend)),head=root.clone().add(new T.Vector3(Math.cos(a)*bend*.6,h,Math.sin(a)*bend*.6));
      shoot(root,joint,.75);shoot(joint,head,.58);
      for(let j=0;j<3;j++){const side=j%2?1:-1,angle=a+side*1.4,p=root.clone().lerp(joint,.5+j*.2);foliage(leaves,p,new T.Vector3(Math.cos(angle),.36,Math.sin(angle)),type==='lavender'?.115:.15,type==='lavender'?.46:.85,side*.2);}
      if(type==='lavender'){
        for(let j=0;j<5;j++){const y=head.y+j*.034;for(let k=0;k<3;k++){const angle=k*Math.PI*2/3+j*.72+a;put(purple,head.x+Math.cos(angle)*.017,y,head.z+Math.sin(angle)*.017,.014,.033,.014,Math.cos(angle)*.18,angle);foliage(leaves,new T.Vector3(head.x,y-.006,head.z),new T.Vector3(Math.cos(angle),.25,Math.sin(angle)),.029,.7);}}
        shoot(head,head.clone().add(new T.Vector3(0,.15,0)),.35);
      }else if(type==='hydrangea'){
        for(let j=0;j<7;j++){
          const angle=j*2.39996+a,r=.095*Math.sqrt(j/7),p=head.clone().add(new T.Vector3(Math.cos(angle)*r,Math.sqrt(Math.max(0,.011-r*r)),Math.sin(angle)*r));shoot(head.clone().add(new T.Vector3(0,-.025,0)),p,.28);
          for(let k=0;k<4;k++)put(pink,p.x,p.y,p.z,.052,.07,.044,0,angle+k*Math.PI/2);
          put(floretEyes,p.x,p.y+.007,p.z,.009,.012,.009);
        }
      }else{
        for(let j=0;j<8;j++){const angle=j*Math.PI/4+a;put(petals,head.x,head.y,head.z,.073,.09,.09,Math.sin(j*2.1)*.08,angle);}
        put(centers,head.x,head.y+.014,head.z,.029,.035,.029);
      }
      if(type!=='lavender')for(let j=0;j<3;j++){const angle=j*Math.PI*2/3+a;foliage(leaves,head,new T.Vector3(Math.cos(angle),-.5,Math.sin(angle)),.044,.75);}
    }
    const beds=[[-7.55,-.1,.85,.38,'hydrangea'],[-7.55,1.6,.85,.38,'lavender'],[-8.35,.75,.32,.72,'daisy'],[-6.2,7.85,.8,.27,'hydrangea'],[-4.2,7.75,.8,.25,'lavender'],[-2.7,7.65,.55,.25,'daisy'],[3.55,-.05,.6,.35,'hydrangea'],[6.85,-.05,.6,.35,'daisy']];
    for(const [x,z,rx,rz,type]of beds)for(let j=0;j<26;j++){
      const a=j*2.39996,r=Math.sqrt((j+.5)/26),xx=x+Math.cos(a)*rx*r,zz=z+Math.sin(a)*rz*r,base=ISLAND_LANDSCAPE.renderHeight(xx,zz);
      for(let k=0;k<3;k++){const angle=a+k*Math.PI*2/3;foliage(leaves,new T.Vector3(xx,base+.006,zz),new T.Vector3(Math.cos(angle),.28,Math.sin(angle)),.17,.95);}
      flower(xx,zz,type,.2+rand()*.2);
    }
    const shrubMat=mat('#286b43',.78),fernMat=mat('#408a50',.78);for(const material of[shrubMat,fernMat]){material.side=T.DoubleSide;material.vertexColors=true;}
    const shrubs=batch(foldedLeaf,shrubMat,16000,'folded evergreen shrub leaves'),fern=batch(ISLAND_BOTANY.fernGeometry(),fernMat,2400,'paired fern leaflets and pinnules'),tufts=batch(ISLAND_BOTANY.bladeGeometry(),leafSage,10000,'curved rooted meadow blades');
    const curlCurve=new T.CatmullRomCurve3([[0,0,0],[0,.1,.02],[.025,.17,.04],[.07,.17,.05],[.09,.13,.06],[.06,.11,.065],[.045,.135,.065]].map(p=>new T.Vector3(...p)));
    const curlGeometry=new T.TubeGeometry(curlCurve,12,.01,4,false);curlGeometry.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(curlGeometry.attributes.position.count*3).fill(.9),3));
    const curls=batch(curlGeometry,fernMat,700,'young unfurling fern croziers');
    function shrub(x,z,h,spread=.12,shoots=6){
      const base=ISLAND_LANDSCAPE.renderHeight(x,z)+.006,root=new T.Vector3(x,base,z);
      for(let j=0;j<shoots;j++){
        const angle=j*2.39996,tip=root.clone().add(new T.Vector3(Math.cos(angle)*spread,h*(.43+rand()*.15),Math.sin(angle)*spread));shoot(root,tip,.47);
        for(let k=0;k<3;k++){const a=angle+(k%2?.85:-.85),p=root.clone().lerp(tip,.3+k*.28),d=new T.Vector3(Math.cos(a)*.75,.5+rand()*.25,Math.sin(a)*.75);foliage(shrubs,p,d,h*(.56+rand()*.2),1.05,(rand()-.5)*.7);}
      }
    }
    function fernPlant(x,z,h,scale=.85,fronds=6){
      const base=ISLAND_LANDSCAPE.renderHeight(x,z)+.006,a=local(x,z,5)*Math.PI*2;fernCrowns++;
      for(let j=0;j<fronds;j++)put(fern,x,base,z,scale,h,scale,0,j*Math.PI*2/fronds+a);
      put(curls,x,base,z,scale,h*1.7,scale,0,a);
    }
    function meadow(x,z,h,count=5){for(let j=0;j<count;j++){const xx=x+(j-(count-1)/2)*.028;put(tufts,xx,ISLAND_LANDSCAPE.renderHeight(xx,z)+.005,z,.6,h,.65,0,j*1.7);}}
    const plantingBeds=[[-9,-3.4,2.6,4.3],[2.6,-7.1,5,1.6],[-4.5,4.95,2.4,.48],[-4,-1.15,3.7,.4],[10,-.2,1.5,4],[6.8,7.3,3.5,1],[-5.4,7.3,3.8,1.2],[-9,3,2.1,2.0],[-7,6.6,2.8,1.1],[-1.6,7.5,1.7,.9],[9.3,2.8,1.6,2.1],[8,-3.7,1.4,2.2]];
    let shrubCount=0;
    for(let x=-12.8;x<=12.8;x+=.3677)for(let z=-9.8;z<=9.8;z+=.3677){
      const xx=x+(rand()-.5)*.28,zz=z+(rand()-.5)*.28;if(xx>4.8&&xx<8.7&&zz>1.8&&zz<5.8||!ISLAND_LANDSCAPE.greenAt(xx,zz,.4))continue;
      const bed=plantingBeds.some(([bx,bz,rx,rz])=>((xx-bx)/rx)**2+((zz-bz)/rz)**2<1);
      if(bed){shrubCount++;const fernPlanting=rand()<.42,h=.32+rand()*.2;if(fernPlanting)fernPlant(xx,zz,h*1.3,.8+rand()*.3);else shrub(xx,zz,h);}
      else if(rand()<.22)meadow(xx,zz,.2+rand()*.18);
    }
    let pathBorderPlants=0,pathFlowers=0;
    for(const coordinates of ISLAND_LANDSCAPE.paths){
      const curve=new T.CatmullRomCurve3(coordinates.map(([x,z])=>new T.Vector3(x,0,z))),length=curve.getLength(),steps=Math.ceil(length/.16);
      for(let i=1;i<steps;i++){
        const t=i/steps,p=curve.getPointAt(t),d=curve.getTangentAt(t),r=new T.Vector3(d.z,0,-d.x).normalize();
        for(const side of[-1,1]){
          const q=p.clone().addScaledVector(r,side*(.56+rand()*.1));
          if((q.x>4.8&&q.x<8.7&&q.z>1.8&&q.z<5.8)||!ISLAND_LANDSCAPE.greenAt(q.x,q.z)||Math.hypot(q.x-5.2,q.z+1)<.9||Math.hypot(q.x-.5,q.z-2.5)<.6||Math.hypot(q.x+7.55,q.z-.75)<.9)continue;
          pathBorderPlants++;
          if(i%9===0){flower(q.x,q.z,i%18?'lavender':'daisy',.23+rand()*.08);pathFlowers++;}
          else if(i%3===0)fernPlant(q.x,q.z,.35+rand()*.1,.44,4);
          else{shrub(q.x,q.z,.26+rand()*.08,.055,3);meadow(q.x,q.z,.23,3);}
        }
      }
    }
    let bufferPlants=0;
    for(let x=-5.1;x<2.3;x+=.27){const z=-.22+Math.sin(x*.8)*.025,y=ISLAND_LANDSCAPE.walkHeight(x,z);if(y>1.12||!ISLAND_LANDSCAPE.greenAt(x,z)||Math.abs(x+7.55)<.9)continue;bufferPlants++;shrub(x,z,.3+rand()*.1,.08,3);if(bufferPlants%4===0)flower(x,z+.14,'lavender',.24);}
    for(let i=0;i<95;i++){
      const s=ISLAND_PHYSICS.apron(.24+i/94*.87);
      for(const side of[-1,1]){
        const q=s.p.clone().addScaledVector(s.right,side*(s.width+.3+rand()*.4)),y=ISLAND_LANDSCAPE.renderHeight(q.x,q.z);
        if(y>1.6||!ISLAND_LANDSCAPE.greenAt(q.x,q.z,.35)||ISLAND_LANDSCAPE.snowClearance(q.x,q.z)<.15)continue;
        meadow(q.x,q.z,.2+rand()*.2);if(i%3===0)fernPlant(q.x,q.z,.35,.55,4);
      }
    }
    for(const o of batches){o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere();}
    // Tennis club: inset coping, a curved-end table, linen piping and scalloped canopy.
    const patio=cyl(.48,.52,.07,cream,.95,.79,5.5,world,'club side-table paving');
    const table=new T.Group();world.add(table);table.position.set(.95,.83,5.5);table.scale.setScalar(.65);cyl(.26,.28,.055,wood,0,.5,0,table,'side table top');for(const a of[0,2.094,4.189])rod([Math.cos(a)*.18,0,Math.sin(a)*.18],[Math.cos(a)*.13,.48,Math.sin(a)*.13],.022,ink,table);
    cyl(.105,.105,.015,pollen,0,.537,0,table,'brass tea tray');cyl(.045,.035,.07,cream,0,.58,0,table,'porcelain cup');const handle=ring(.023,.006,pollen,.055,.59,0,table);handle.rotation.y=Math.PI/2;
    for(const x of[-7.19,.39])box(.035,.06,4.35,wood,x,1.083,4,world,'court coping inlay');for(const z of[1.83,6.17])box(7.57,.06,.035,wood,-3.4,1.083,z,world,'court coping inlay');
    // A taut textile back-screen with its frame; no decorative text or logo.
    const screenMat=mat('#31594e',.7,.28);for(const z of[1.91]){box(7.15,.53,.025,screenMat,-3.4,1.34,z,world,'club textile windscreen');for(let i=0;i<15;i++){const x=-6.96+i*.51;const g=ring(.013,.004,pollen,x,1.57,z+.02);rod([x,1.58,z],[x,1.63,z],.006,ink);}}
    for(let i=0;i<12;i++){const a=i*Math.PI/6,b=(i+1)*Math.PI/6;const p1=[1.5+Math.cos(a)*1.18,3.41,5.95+Math.sin(a)*1.18],p2=[1.5+Math.cos((a+b)/2)*1.18,3.33,5.95+Math.sin((a+b)/2)*1.18],p3=[1.5+Math.cos(b)*1.18,3.41,5.95+Math.sin(b)*1.18];c.path([p1,p2,p3],.012,i%2?sage:cream,world,'scalloped canopy piping');}
    return{debug:()=>({bufferPlants,flowers:beds.length*26,groundcoverClumps:shrubCount,pathBorderPlants,pathFlowers,botanical:true,rootedShoots,fernCrowns,botanicalBatches:batches.length,plantedParts:batches.reduce((n,o)=>n+o.count,0)})};
  }
  window.ISLAND_GARDEN={build};
})();


