/* A narrow terrain-following trail. No platforms, piles, rails or stairs. */
(() => {
  const T=window.THREE;
  function build(c){
    const {world,mesh,mat}=c;world.updateMatrixWorld(true);const terrain=[];
    world.traverse(o=>{if(o.isMesh&&(/continuous alpine massif|alpine massif|alpine snow cap|alpine ridge|rounded snowy summit|expanded grass terrace/.test(o.name)||o.parent?.name==='snowy mountain'))terrain.push(o);});
    const ray=new T.Raycaster(),down=new T.Vector3(0,-1,0);function ground(x,z){return ISLAND_LANDSCAPE.walkHeight(x,z);}
    const anchors=[[-3.5,-5.8],[-2.9,-6.4],[-2.2,-6.2],[-1.6,-5.8],[-1.2,-5.2]].map(([x,z])=>new T.Vector3(x,0,z)),curve=new T.CatmullRomCurve3(anchors,false,'centripetal');
    const n=180,vertices=[],indices=[],walk=[],surface=[];
    for(let i=0;i<=n;i++){const t=i/n,p=curve.getPointAt(t),d=curve.getTangentAt(t),r=new T.Vector3(d.z,0,-d.x).normalize(),y=ground(p.x,p.z);surface.push([p.x,y,p.z]);const eye=1.34-.76*T.MathUtils.smoothstep(t,.82,1);walk.push([p.x,y+eye+.06,p.z]);for(const side of[-1,1]){const x=p.x+r.x*.09*side,z=p.z+r.z*.09*side;vertices.push(x,ground(x,z)+.025,z);}if(i<n){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const gravel=mat('#c9d6d5',.85,.2);gravel.side=T.DoubleSide;mesh(geo,gravel,world,'terrain mountain footpath');
    return{walk,surface,ground,debug:()=>({samples:walk.length,width:.18,woodenParts:0,ascent:surface.at(-1)[1]-surface[0][1]})};
  }
  window.ISLAND_TRAIL={build};
})();
