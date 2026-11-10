/* A floating star marks the archive. The mountain silhouette stays intact. */
(() => {
  const T=window.THREE;
  function build(c){
    const {world,mesh,mat,materials}=c,door=new T.Group();world.add(door);door.position.set(-.7,6.8,-6.5);door.scale.setScalar(1.4);door.rotation.y=.45;c.tag(door,'archive-portal');door.userData.hotspot=new T.Vector3(0,0,.09);
    const shape=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.225:.5,x=Math.cos(a)*r,y=Math.sin(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();
    const pearl=mat('#ffe6a0',.28,.45);pearl.emissive=new T.Color('#ffd787');pearl.emissiveIntensity=.45;
    const edge=mat('#e9a529',.3,.5);edge.emissive=new T.Color('#ecac30');edge.emissiveIntensity=.22;const outlineGeo=new T.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,steps:1});outlineGeo.scale(1.15,1.15,1);const outline=mesh(outlineGeo,edge,door,'golden five-point portal outline');outline.position.z=-.15;
    const star=mesh(new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:4,steps:1}),pearl,door,'floating luminous five-point archive star');star.position.z=-.06;
    const glow=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{},vertexShader:'varying vec2 vUv;void main(){vUv=uv;vec4 p=modelViewMatrix*vec4(0.,0.,0.,1.);p.xy+=position.xy;gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec2 vUv;void main(){float r=length(vUv-.5)*2.;float a=exp(-r*r*4.)*.34*(1.-smoothstep(.65,1.,r));gl_FragColor=vec4(1.,.85,.53,a);}'});materials.push(glow);const halo=mesh(new T.PlaneGeometry(3.1,3.1),glow,door,'soft local starlight halo');halo.castShadow=halo.receiveShadow=false;
    const light=new T.PointLight('#ffe4aa',1.1,4,2);door.add(light);
    return{notes:[],door,dispose(){},debug:()=>({notes:0,portal:'floating-five-point-star',door:door.position.toArray(),roundSummit:false,softHalo:true})};
  }
  window.ISLAND_DISCOVERIES={build};
})();
