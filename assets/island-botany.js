/* Rooted botanical surfaces. Fine parts are built once and batched, never sprites. */
(() => {
  const T=window.THREE;
  function surface(vertices,indices,colors,uv){
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    if(colors)geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    if(uv)geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
  }
  // The narrow petiole, raised midrib and cupped blade share one continuous surface.
  // UV orientation also serves the cotton and indoor collection callers.
  function leafGeometry(){
    const vertices=[],indices=[],colors=[],uv=[],rows=[0,.07,.18,.33,.5,.67,.82,.94,1];
    rows.forEach((t,i)=>{
      const blade=Math.max(0,(t-.075)/.925),width=t<.075?.009:.23*Math.pow(Math.sin(Math.PI*blade),.76)*(.86+.14*blade)+.001;
      for(let j=0;j<3;j++){
        const f=j-1,asymmetry=1+f*.07*Math.sin(t*5),rib=(1-Math.abs(f))*.014*Math.sin(t*Math.PI);
        vertices.push(f*width*asymmetry+.025*Math.sin(t*Math.PI),t,.14*Math.sin(t*Math.PI)-.06*t*t-Math.pow(Math.abs(f),1.35)*width*.3+rib);
        const tone=.7+t*.23+(1-Math.abs(f))*.065;colors.push(tone*.98,tone,tone*.97);uv.push(j/2,t);
      }
      if(i<rows.length-1)for(let j=0;j<2;j++){const a=i*3+j,b=a+3;indices.push(a,b,a+1,a+1,b,b+1);}
    });
    return surface(vertices,indices,colors,uv);
  }
  function bladeGeometry(){
    const vertices=[],indices=[],colors=[],uv=[],rows=6;
    for(let i=0;i<=rows;i++){
      const t=i/rows,width=.035*Math.pow(1-t,.72)+.0003;
      for(let j=0;j<3;j++){
        const f=j-1;vertices.push(f*width+.035*Math.sin(t*2.6),.9*t-.16*t*t,.4*t*t-Math.abs(f)*width*.65);
        const tone=.67+.3*t+(j===1?.07:0);colors.push(tone,tone,tone);uv.push(j/2,t);
      }
      if(i<rows)for(let j=0;j<2;j++){const a=i*3+j,b=a+3;indices.push(a,b,a+1,a+1,b,b+1);}
    }
    return surface(vertices,indices,colors,uv);
  }
  function fernGeometry(){
    const vertices=[],indices=[],colors=[],uv=[];
    const add=(p,tone,u=0,v=0)=>{vertices.push(p.x,p.y,p.z);colors.push(tone*.94,tone,tone*.93);uv.push(u,v);};
    function ribbon(a,b,width,tone){
      const side=new T.Vector3().crossVectors(b.clone().sub(a),new T.Vector3(0,0,1)).normalize().multiplyScalar(width),n=vertices.length/3;
      add(a.clone().sub(side),tone,0,0);add(a.clone().add(side),tone,1,0);add(b.clone().sub(side).lerp(b,.25),tone+.06,0,1);add(b.clone().add(side).lerp(b,.25),tone+.06,1,1);
      indices.push(n,n+2,n+1,n+1,n+2,n+3);
    }
    const stem=t=>new T.Vector3(.018*Math.sin(t*3),t*.75,.6*t*t);
    for(let i=0;i<12;i++)ribbon(stem(i/12),stem((i+1)/12),.008*(1-i/15),.57+i*.02);
    for(let i=1;i<=10;i++){
      const t=i/12,p=stem(t),span=.31*Math.sin(Math.PI*t)*(.94+.06*Math.sin(i));
      for(const side of[-1,1]){
        const tip=p.clone().add(new T.Vector3(side*span,.105,.11)),direction=tip.clone().sub(p),across=new T.Vector3().crossVectors(direction,new T.Vector3(0,0,1)).normalize().multiplyScalar(.026+.015*Math.sin(Math.PI*t)),n=vertices.length/3;
        // The notched pinna outline and raised midrib survive tour distances;
        // subpixel secondary pinnules would only add geometry and shimmer.
        const outline=[p,p.clone().lerp(tip,.22).addScaledVector(across,.65),p.clone().lerp(tip,.43).addScaledVector(across,.48),p.clone().lerp(tip,.72).addScaledVector(across,.8),tip,p.clone().lerp(tip,.72).addScaledVector(across,-.75),p.clone().lerp(tip,.43).addScaledVector(across,-.42),p.clone().lerp(tip,.22).addScaledVector(across,-.6)];
        outline.forEach((point,j)=>add(point,.73+t*.17,j/7,t));add(p.clone().lerp(tip,.5).add(new T.Vector3(0,0,.012)),.92,.5,t);
        for(let j=0;j<8;j++)indices.push(n+j,n+(j+1)%8,n+8);
      }
    }
    return surface(vertices,indices,colors,uv);
  }
  function tree(c,x,z,s=1,slender=false){
    const {world,mesh,mat,palette,animated,tag,geometries}=c,g=new T.Group();world.add(g);
    g.position.set(x,ISLAND_LANDSCAPE.rangeHeight(x,z),z);g.scale.setScalar(s);tag(g,'breeze');animated.trees.push(g);g.name=slender?'botanical cypress':'branched broadleaf tree';
    if(!c.botanicalLeafGeometry){c.botanicalLeafGeometry=leafGeometry();geometries.push(c.botanicalLeafGeometry);}
    if(!c.botanicalBark)c.botanicalBark=mat('#886640',.86);
    if(!c.botanicalContact){
      c.botanicalContact=new T.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;void main(){float r=length(vUv-.5)*2.;float a=exp(-r*r*4.)*(1.-smoothstep(.6,1.,r))*.13;gl_FragColor=vec4(.08,.14,.10,a);}'});
      c.materials.push(c.botanicalContact);c.botanicalContactGeometry=new T.PlaneGeometry(1.6,1.6);geometries.push(c.botanicalContactGeometry);
    }
    const contact=new T.Mesh(c.botanicalContactGeometry,c.botanicalContact);g.add(contact);contact.name='soft rooted tree contact';contact.rotation.x=-Math.PI/2;contact.position.y=.008;contact.castShadow=contact.receiveShadow=false;
    const mats=[palette.leaf,palette.leaf2];mats.forEach(m=>{m.side=T.DoubleSide;m.vertexColors=true;});
    const banks=mats.map((m,i)=>{const o=new T.InstancedMesh(c.botanicalLeafGeometry,m,700);o.count=0;o.castShadow=o.receiveShadow=true;g.add(o);o.name=i?'sunlit botanical leaves':'deep botanical leaves';return o;});
    const dummy=new T.Object3D(),up=new T.Vector3(0,1,0),wood=[],woodIndices=[],woodUV=[];let seed=Math.round((x+20)*141+(z+20)*731),leaves=0,branchCount=0;
    const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    // One buffer holds the whole woody skeleton. Rings follow branch tangents,
    // retaining round forks without stacks of separately shaded cylinder collars.
    function tube(points,radii,sides=6,rootFlare=false){
      const start=wood.length/3;let previousSide=null;
      points.forEach((p,i)=>{
        const tangent=points[Math.min(i+1,points.length-1)].clone().sub(points[Math.max(0,i-1)]).normalize(),axis=Math.abs(tangent.y)>.94?new T.Vector3(1,0,0):up;
        const u=previousSide?previousSide.clone().addScaledVector(tangent,-previousSide.dot(tangent)).normalize():new T.Vector3().crossVectors(tangent,axis).normalize(),v=new T.Vector3().crossVectors(tangent,u).normalize();previousSide=u;
        for(let j=0;j<=sides;j++){
          const a=j/sides*Math.PI*2,flare=rootFlare?1+Math.cos(a*5+.3)*.19*Math.exp(-p.y*13):1,r=radii[i]*flare;
          const q=p.clone().addScaledVector(u,Math.cos(a)*r).addScaledVector(v,Math.sin(a)*r);wood.push(q.x,q.y,q.z);woodUV.push(j/sides,p.y*.8+i*.08);
          if(i<points.length-1&&j<sides){const n=start+i*(sides+1)+j,b=n+sides+1;woodIndices.push(n,n+1,b,n+1,b+1,b);}
        }
      });
      const end=points[points.length-1],cap=wood.length/3,last=start+(points.length-1)*(sides+1);wood.push(end.x,end.y,end.z);woodUV.push(.5,1);
      for(let j=0;j<sides;j++)woodIndices.push(last+j,last+j+1,cap);
      branchCount++;
    }
    function branch(a,b,r,bend=.045){
      const points=[],radii=[];for(let j=0;j<=3;j++){const t=j/3;points.push(a.clone().lerp(b,t).add(new T.Vector3(0,Math.sin(t*Math.PI)*bend,0)));radii.push(r*Math.pow(1-t,.8)*.86+r*.14);}tube(points,radii);
    }
    const height=slender?2.75:1.65,trunk=[],radii=[];
    for(let i=0;i<=12;i++){const t=i/12;trunk.push(new T.Vector3(Math.sin(t*2.1)*.038,height*t,Math.sin(t*2.8)*.026));radii.push(.014+.12*Math.pow(1-t,1.15)+.025*Math.exp(-t*25));}tube(trunk,radii,12,true);
    // Buttresses stay inside the tree's existing path and snow clearance footprint.
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5+.22,points=[];for(let k=0;k<=4;k++){const t=k/4;points.push(new T.Vector3(Math.cos(a)*(.055+t*.17),.11*Math.pow(1-t,1.8)+.01,Math.sin(a)*(.055+t*.17)));}tube(points,[.045,.035,.024,.014,.003],6);}
    for(let i=0;i<(slender?18:12);i++){
      const angle=i*2.39996,y=slender?.65+i*.11:.9+(i%4)*.28,length=slender?.42*(1-i/24):.48+(i%3)*.16;
      const origin=new T.Vector3(Math.sin(y/height*2.1)*.038,y,Math.sin(y/height*2.8)*.026),tip=new T.Vector3(Math.cos(angle)*length,y+.38,Math.sin(angle)*length);branch(origin,tip,slender?.027:.041,.055);
      for(let k=0;k<4;k++){
        const a=angle+(k-1.5)*.65,node=tip.clone().add(new T.Vector3(Math.cos(a)*.16,.08+rand()*.18,Math.sin(a)*.16));branch(tip,node,.012,.018);
        for(let j=0;j<(slender?6:8);j++){
          const b=j*2.39996+rand()*.3,out=new T.Vector3(Math.cos(b)*.65,.22+rand()*.55,Math.sin(b)*.65).normalize(),along=.25+rand()*.75,p=tip.clone().lerp(node,along);p.y+=Math.sin(along*Math.PI)*.018;
          const bank=banks[(j+i)%2];dummy.position.copy(p);dummy.quaternion.setFromUnitVectors(up,out);dummy.rotateY(rand()*6.28);const len=slender?.2+rand()*.12:.32+rand()*.19;dummy.scale.set(slender?.5:.68,len,.62);dummy.updateMatrix();bank.setMatrixAt(bank.count++,dummy.matrix);leaves++;
        }
      }
    }
    mesh(surface(wood,woodIndices,null,woodUV),c.botanicalBark,g,'tapered rooted trunk and curved branch forks');
    for(const bank of banks){bank.instanceMatrix.needsUpdate=true;bank.computeBoundingSphere();}
    g.userData.botanicalLeaves=leaves;g.userData.botanicalBranches=branchCount;g.userData.rootFootprint=.23;return g;
  }
  window.ISLAND_BOTANY={leafGeometry,bladeGeometry,fernGeometry,tree};
})();
