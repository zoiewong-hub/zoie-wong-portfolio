/* Conservative static joinery batches. No source objects or owned buffers are removed. */
(() => {
  'use strict';
  const T=window.THREE,applied=new WeakMap();
  const attributes=new Set(['position','normal','uv','uv1','uv2','color','tangent']);
  const cabinet=/^(?:museum (?:cabinet (?:recessed foot|fine curved inlay|matched veneer joint|inset woven display bed|display bed welt|recessed back edge|canopy fine rim|downlight bezel|recessed downlight|downlight inner rim|light lens)|curved (?:walnut cabinet plinth|cabinet deck|cabinet canopy))|felt museum cabinet backing|cabinet trophy card (?:spacer|fixing))$/;
  const architecture=/^(?:supported rod|gallery (?:plaster wall|recessed walnut skirting|fine skirting cap|fine inset panel bead|far wall inset panel|far wall fine molding)|inset painted wall panel|classical wall molding|stepped plaster cornice|ivory plaster ceiling|single recessed plaster ceiling|quiet ceiling perimeter|ceiling recessed plaster shoulder|ceiling fine brass reveal|rounded gallery joinery|cleaner ladder tread|sconce (?:brass backplate|mounting screw|recessed backplate panel|warm shade lining|shade fitter)|frosted sconce bulb|greenhouse structural column|column base shoe|greenhouse eave rail|greenhouse kick plate|end wall lintel|door jamb|door frame|raised cotton planter|cotton planter soil|cinema linen screen frame|cinema screen footing|cinema projector housing|camp chair arm cap|camp chair rubber foot|court coping inlay|club perimeter post|net post|doubles sideline|baseline|singles sideline|service line|center service line|center baseline mark|spectator inset edging|motto sign foot|dock guide light|grounded pier pile)$/;
  const movingBranch=/robot|racket|boat|tennis|skier|planet|cloud|flag|kinetic|flower|cabinet gap planting/i;
  const protectedMesh=/eye|hand|forearm|cloth|petal|leaf|paper|photo|planet|boat|sail|skier|tennis|racket|beam|halo|pool|arrival|floor|parquet|paving|garden path|massif|snow apron|sand shore|grass terrace|court foundation|court runoff|playing rectangle|dock plank|teak spectator|spectator limestone/i;
  const defaultCompile=T.Material.prototype.onBeforeCompile;

  function staticAncestry(mesh,world){
    for(let node=mesh.parent;node;node=node.parent){
      if(!node.visible||movingBranch.test(node.name||''))return false;
      const kind=node.userData?.kind;
      // Cabinet frames follow their award group; chair feet follow their seat.
      // Other tagged branches are conservatively reserved for their controllers.
      if(kind&&!(kind==='award'&&cabinet.test(mesh.name))&&!(kind==='cinema-seat'&&/^camp chair (?:arm cap|rubber foot)$/.test(mesh.name)))return false;
      if(node===world)break;
    }
    return true;
  }

  function eligible(mesh,world){
    if(mesh.type!=='Mesh'||mesh.isInstancedMesh||mesh.isSkinnedMesh||mesh.children.length||!mesh.visible||mesh.layers.mask===0)return null;
    if(Object.keys(mesh.userData||{}).length||protectedMesh.test(mesh.name||'')||!(cabinet.test(mesh.name)||architecture.test(mesh.name)))return null;
    if(!staticAncestry(mesh,world)||mesh.renderOrder!==0||mesh.customDepthMaterial||mesh.customDistanceMaterial)return null;
    if(mesh.raycast!==T.Mesh.prototype.raycast)return null;
    for(const name of['onBeforeRender','onAfterRender','onBeforeShadow','onAfterShadow'])if(mesh[name]!==T.Object3D.prototype[name])return null;
    const material=mesh.material;
    if(!material||Array.isArray(material)||!(material.isMeshStandardMaterial||material.isMeshBasicMaterial))return null;
    if(material.transparent||material.opacity!==1||material.transmission>0||material.alphaTest>0||material.alphaHash||!material.depthWrite||!material.depthTest||material.stencilWrite||material.wireframe)return null;
    if(material.blending!==T.NormalBlending||material.displacementMap||material.normalMap&&material.normalMapType===T.ObjectSpaceNormalMap)return null;
    // Object-local shader coordinates cannot be baked without changing their look.
    // This also excludes ISLAND_FINISH's object-space metallic microflakes.
    if(material.onBeforeCompile!==defaultCompile||material.clippingPlanes?.length)return null;
    const geometry=mesh.geometry,position=geometry?.attributes?.position;
    if(!geometry?.isBufferGeometry||!position||position.itemSize!==3||position.count<3||position.normalized)return null;
    if(Object.values(geometry.morphAttributes).some(list=>list.length)||mesh.morphTargetInfluences?.length)return null;
    const names=Object.keys(geometry.attributes).sort(),layout=[];
    for(const name of names){
      const attr=geometry.attributes[name];
      if(!attributes.has(name)||attr.isInterleavedBufferAttribute||attr.count!==position.count||attr.usage!==T.StaticDrawUsage||!attr.array?.constructor)return null;
      const size=name==='color'?[3,4]:name==='tangent'?[4]:name==='position'||name==='normal'?[3]:[2];
      if(!size.includes(attr.itemSize))return null;
      if((name==='position'||name==='normal'||name==='tangent')&&!['Float32Array','Float64Array'].includes(attr.array.constructor.name))return null;
      for(const n of attr.array)if(!Number.isFinite(n))return null;
      layout.push([name,attr.itemSize,attr.normalized,attr.array.constructor.name,attr.gpuType,attr.usage].join(':'));
    }
    if(material.isMeshStandardMaterial&&!geometry.attributes.normal)return null;
    const index=geometry.index,total=index?index.count:position.count,start=geometry.drawRange.start,count=Math.min(total-start,geometry.drawRange.count);
    if(!Number.isInteger(start)||start<0||!Number.isInteger(count)||count<3||start%3||count%3)return null;
    if(index){
      if(index.itemSize!==1||index.isInterleavedBufferAttribute||index.normalized||index.usage!==T.StaticDrawUsage)return null;
      for(let i=start;i<start+count;i++){const v=index.getX(i);if(!Number.isInteger(v)||v<0||v>=position.count)return null;}
    }
    if(mesh.matrixAutoUpdate)mesh.updateMatrix();
    if(mesh.matrix.elements.some(n=>!Number.isFinite(n))||Math.abs(mesh.matrix.determinant())<1e-12)return null;
    return{mesh,names,start,count,vertices:position.count,layout:layout.join('|')};
  }

  function merge(parts){
    const names=parts[0].names,vertexCount=parts.reduce((n,p)=>n+p.vertices,0),indexCount=parts.reduce((n,p)=>n+p.count,0),geometry=new T.BufferGeometry(),index=new Uint32Array(indexCount);
    for(const name of names){const source=parts[0].mesh.geometry.attributes[name];const attr=new T.BufferAttribute(new source.array.constructor(vertexCount*source.itemSize),source.itemSize,source.normalized);attr.gpuType=source.gpuType;attr.setUsage(source.usage);geometry.setAttribute(name,attr);}
    let vertexOffset=0,indexOffset=0;
    for(const part of parts){
      const source=part.mesh,copy=source.geometry.clone().applyMatrix4(source.matrix),mirrored=source.matrix.determinant()<0;
      for(const name of names)geometry.attributes[name].array.set(copy.attributes[name].array,vertexOffset*copy.attributes[name].itemSize);
      for(let i=part.start;i<part.start+part.count;i+=3){
        const a=copy.index?copy.index.getX(i):i,b=copy.index?copy.index.getX(i+1):i+1,c=copy.index?copy.index.getX(i+2):i+2;
        index[indexOffset++]=vertexOffset+a;index[indexOffset++]=vertexOffset+(mirrored?c:b);index[indexOffset++]=vertexOffset+(mirrored?b:c);
      }
      vertexOffset+=part.vertices;copy.dispose();
    }
    geometry.setIndex(new T.BufferAttribute(index,1));geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
  }

  function apply(world,geometries){
    if(applied.has(world))return applied.get(world);
    const parents=[];world.traverse(o=>{if(o.children?.length)parents.push(o);});
    const entries=[],stats={batches:0,sources:0,drawCallsSaved:0,triangles:0,eligible:0};
    for(const parent of parents){
      const banks=new Map();
      for(const child of parent.children.slice()){
        const part=eligible(child,world);if(!part)continue;stats.eligible++;
        const key=[child.material.uuid,child.castShadow,child.receiveShadow,child.frustumCulled,child.layers.mask,part.layout].join('/');
        if(!banks.has(key))banks.set(key,[]);banks.get(key).push(part);
      }
      for(const parts of banks.values()){
        // Bound CPU preparation and buffer size; a broad group is never required.
        if(parts.length<2||parts.reduce((n,p)=>n+p.vertices,0)>200000)continue;
        const first=parts[0].mesh,geometry=merge(parts),batch=new T.Mesh(geometry,first.material);
        // The trophy inspector hides cabinetry by name after moving its award
        // group; preserve that existing predicate on the combined drawable.
        batch.name=parts.some(p=>cabinet.test(p.mesh.name))?'static cabinet sibling joinery batch':'static sibling joinery batch';batch.userData.spatialBatch=true;
        batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;batch.frustumCulled=first.frustumCulled;batch.layers.mask=first.layers.mask;batch.matrixAutoUpdate=false;
        const sources=parts.map(({mesh})=>({mesh,mask:mesh.layers.mask}));
        // Delegate to the real source geometry, preserving object identity,
        // faceIndex, UVs, normals, draw ranges and the original tagged ancestry.
        // Mesh.raycast does not test layers; recursive Raycaster traversal does.
        batch.raycast=function(raycaster,hits){for(const {mesh}of sources)T.Mesh.prototype.raycast.call(mesh,raycaster,hits);};
        geometries.push(geometry);parent.add(batch);
        for(const {mesh}of sources)mesh.layers.mask=0;
        entries.push({parent,batch,sources});stats.batches++;stats.sources+=parts.length;stats.drawCallsSaved+=parts.length-1;stats.triangles+=geometry.index.count/3;
      }
    }
    let restored=false;
    const result={...stats,debug:()=>({...stats}),restore(){
      if(restored)return;restored=true;
      for(const {parent,batch,sources}of entries){parent.remove(batch);for(const {mesh,mask}of sources)mesh.layers.mask=mask;}
      // Newly owned geometry stays in the caller's disposal list, just like the
      // originals. Neither applying nor restoring disposes caller-owned buffers.
      applied.delete(world);
    }};
    applied.set(world,result);return result;
  }
  window.SPATIAL_BATCHES={apply};
})();
