/* Dusk-only fireflies, spatially anchored to the woodland and depth tested. */
(() => {
  function build(c){const T=window.THREE,count=c.animated.trees.length*4,positions=new Float32Array(count*3),seeds=[];for(let i=0;i<count;i++){const tree=c.animated.trees[Math.floor(i/4)],a=i*2.39996,r=.3+(i%7)*.08;seeds.push({x:tree.position.x+Math.cos(a)*r,z:tree.position.z+Math.sin(a)*r,y:.95+(i%9)*.17,a});}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('aSeed',new T.Float32BufferAttribute(seeds.map(s=>s.a),1));c.geometries.push(geo);
    const material=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{uNight:c.animated.nightHalo.uniforms.uPower,uTime:{value:0}},vertexShader:'attribute float aSeed;varying float vSeed;void main(){vSeed=aSeed;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(105./max(1.,-p.z),1.6,9.);}',fragmentShader:'uniform float uNight;uniform float uTime;varying float vSeed;void main(){float r=length(gl_PointCoord-.5)*2.;float pulse=.3+.7*pow(.5+.5*sin(uTime*1.1+vSeed),2.);float a=exp(-r*r*4.)*(1.-smoothstep(.5,1.,r))*uNight*pulse;if(a<.005)discard;gl_FragColor=vec4(1.,.94,.48,a);}'});c.materials.push(material);const flies=new T.Points(geo,material);flies.name='woodland fireflies';flies.frustumCulled=false;c.world.add(flies);let clock=0;
    function update(dt,still){if(!still)clock+=dt;material.uniforms.uTime.value=clock;seeds.forEach((s,i)=>positions.set([s.x+Math.sin(clock*.37+s.a)*.2,s.y+Math.sin(clock*.54+s.a)*.13,s.z+Math.cos(clock*.29+s.a)*.2],i*3));geo.attributes.position.needsUpdate=true;flies.visible=material.uniforms.uNight.value>.01;}
    update(0,true);return{update,debug:()=>({trees:c.animated.trees.length,fireflies:count,nightOnly:true,visible:flies.visible,time:clock})};
  }
  window.ISLAND_FOREST={build};
})();
