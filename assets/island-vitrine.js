/* Original museum joinery. Every enclosure and its downlight share one profile. */
(() => {
  const T=window.THREE;
  const D={radiusX:1.48,radiusZ:1.43,back:-.54,bottom:1.57,top:4.43,thickness:.014,frontX:4.15-(1.43-.54+.045)};
  function profile(a,y=0,inset=0){return new T.Vector3(Math.sin(a)*(D.radiusX-inset),y,D.back+Math.cos(a)*(D.radiusZ-inset));}
  function outline(rx,rz,back){const s=new T.Shape();s.moveTo(-rx,-back);for(let i=1;i<=96;i++){const a=-Math.PI/2+i/96*Math.PI;s.lineTo(Math.sin(a)*rx,-back-Math.cos(a)*rz);}s.closePath();return s;}
  function verticalExtrusion(s,height,y,bevel=0){const g=new T.ExtrudeGeometry(s,{depth:height,steps:1,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:48});g.rotateX(-Math.PI/2);g.translate(0,y,0);return g;}
  function glassGeometry(){const s=new T.Shape(),a=profile(-Math.PI/2);s.moveTo(a.x,-a.z);for(let i=1;i<=96;i++){const p=profile(-Math.PI/2+i/96*Math.PI);s.lineTo(p.x,-p.z);}for(let i=96;i>=0;i--){const p=profile(-Math.PI/2+i/96*Math.PI,0,D.thickness);s.lineTo(p.x,-p.z);}s.closePath();return verticalExtrusion(s,D.top-D.bottom,D.bottom);}
  function environment(c){const previous=c.scene.environment,images=[];for(let i=0;i<6;i++){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const q=canvas.getContext('2d'),wash=q.createLinearGradient(0,0,0,256);wash.addColorStop(0,'#657266');wash.addColorStop(.32,'#394a3d');wash.addColorStop(.7,'#23372c');wash.addColorStop(1,'#17271e');q.fillStyle=wash;q.fillRect(0,0,256,256);if(i!==3){
      // Soft luminous cards produce a continuous reflection rolloff on the curved glazing.
      const a=q.createLinearGradient(18,0,68,0);a.addColorStop(0,'rgba(239,225,191,0)');a.addColorStop(.38,'rgba(239,225,191,.04)');a.addColorStop(.5,'rgba(239,225,191,.8)');a.addColorStop(.63,'rgba(239,225,191,.13)');a.addColorStop(1,'rgba(239,225,191,0)');q.fillStyle=a;q.fillRect(18,21,50,216);
      const b=q.createLinearGradient(162,0,197,0);b.addColorStop(0,'rgba(235,242,222,0)');b.addColorStop(.5,'rgba(235,242,222,.6)');b.addColorStop(1,'rgba(235,242,222,0)');q.fillStyle=b;q.fillRect(162,31,35,178);
      const ceiling=q.createLinearGradient(0,0,0,55);ceiling.addColorStop(0,'rgba(255,237,197,.55)');ceiling.addColorStop(1,'rgba(255,237,197,0)');q.fillStyle=ceiling;q.fillRect(0,0,256,55);
    }images.push(canvas);}
    const texture=new T.CubeTexture(images);texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;c.scene.environment=texture;return{dispose(){if(c.scene.environment===texture)c.scene.environment=previous;texture.dispose();}};
  }
  function build(c,g,{oak,dark,gold,felt,index}){
    const {mesh,mat,cyl,path,rod,materials}=c;
    const satin=mat('#b5a17b',.38,.78),reveal=mat('#332b24',.78),lining=mat('#35443a',.93),edge=new T.MeshBasicMaterial({color:'#d9e8d8',transparent:true,opacity:.27,depthWrite:false});materials.push(edge);
    function plate(rx,rz,back,height,y,m,name,bevel=0,hole=false){const s=outline(rx,rz,back);if(hole){const h=new T.Path();h.absarc(0,0,.16,0,Math.PI*2,true);s.holes.push(h);}return mesh(verticalExtrusion(s,height,y,bevel),m,g,name);}
    function sweep(y,m,r=.007,rx=D.radiusX,rz=D.radiusZ,back=D.back,name='museum cabinet fine curved inlay'){const pts=Array.from({length:97},(_,i)=>{const a=-Math.PI/2+i/96*Math.PI;return[Math.sin(a)*rx,y,back+Math.cos(a)*rz];});return path(pts,r,m,g,name);}
    plate(1.4,1.34,-.54,.16,.015,dark,'museum cabinet recessed foot',.025);
    plate(1.49,1.44,-.54,1.28,.21,oak,'museum curved walnut cabinet plinth',.035);
    sweep(.255,satin,.008,1.493,1.443,-.54);sweep(1.44,reveal,.007,1.493,1.443,-.54);
    for(const a of[-Math.PI/3,0,Math.PI/3]){const p=new T.Vector3(Math.sin(a)*1.4925,0,-.54+Math.cos(a)*1.4425);rod([p.x,.29,p.z],[p.x,1.405,p.z],.0035,reveal,g).name='museum cabinet matched veneer joint';}
    plate(1.5,1.46,-.55,.07,1.495,satin,'museum curved cabinet deck');
    plate(1.423,1.382,-.535,.008,1.566,lining,'museum cabinet inset woven display bed');
    sweep(1.573,satin,.006,1.436,1.396,-.54,'museum cabinet display bed welt');
    const glass=new T.MeshPhysicalMaterial({color:'#eaf5ed',transparent:true,opacity:.085,roughness:.055,metalness:0,ior:1.47,clearcoat:1,clearcoatRoughness:.065,envMapIntensity:1.35,side:T.DoubleSide,depthWrite:false});materials.push(glass);
    const shell=mesh(glassGeometry(),glass,g,'museum curved cabinet glass');shell.castShadow=shell.receiveShadow=false;shell.renderOrder=3;
    // The sweep returns to a recessed backing; there are no front corner posts.
    const back=mesh(new T.PlaneGeometry(2.93,D.top-D.bottom),felt,g,'felt museum cabinet backing');back.position.set(0,(D.top+D.bottom)/2,D.back-.02);
    for(const x of[-1.462,1.462]){rod([x,D.bottom,D.back-.006],[x,D.top,D.back-.006],.007,satin,g).name='museum cabinet recessed back edge';const xx=x+Math.sign(x)*.008,cut=rod([xx,D.bottom+.025,D.back+.006],[xx,D.top-.025,D.back+.006],.0035,edge,g);cut.name='museum cabinet polished glass return';cut.castShadow=cut.receiveShadow=false;}
    plate(1.51,1.46,-.55,.045,D.top,dark,'museum curved cabinet canopy',.012,true);
    for(const y of[D.bottom+.006,D.top-.006])sweep(y,satin,.008);
    sweep(D.top+.024,satin,.004,1.515,1.465,-.55,'museum cabinet canopy fine rim');
    cyl(.153,.153,.022,satin,0,4.412,0,g,'museum cabinet downlight bezel');
    cyl(.13,.13,.085,dark,0,4.385,0,g,'museum cabinet recessed downlight');
    cyl(.112,.112,.014,satin,0,4.338,0,g,'museum cabinet downlight inner rim');
    const luminous=mat('#fff5df',.28);luminous.emissive=new T.Color('#ffe3ad');luminous.emissiveIntensity=2.1;
    const lens=cyl(.102,.102,.008,luminous,0,4.327,0,g,'museum cabinet light lens');lens.castShadow=false;
    const spot=new T.SpotLight('#fff0d6',21,5,.43,.68,2);spot.name='museum exhibit top light '+index;spot.position.set(0,4.315,0);spot.target.position.set(0,2.65,0);spot.castShadow=false;g.add(spot,spot.target);
    const beamMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{uColor:{value:new T.Color('#ffe9c5')}},vertexShader:'varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorld;void main(){vUv=uv;vNormal=normalize(mat3(modelMatrix)*normal);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}',fragmentShader:'uniform vec3 uColor;varying vec2 vUv;varying vec3 vNormal;varying vec3 vWorld;void main(){float facing=abs(dot(normalize(cameraPosition-vWorld),normalize(vNormal)));float fade=pow(max(0.,sin(vUv.y*3.14159265)),.8);float a=.042*pow(facing,1.5)*fade;gl_FragColor=vec4(uColor,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});materials.push(beamMaterial);
    const beam=mesh(new T.CylinderGeometry(.022,.64,2.72,64,1,true),beamMaterial,g,'museum cabinet soft light beam');beam.position.y=2.955;beam.castShadow=beam.receiveShadow=false;beam.renderOrder=2;
    // A finite radial footprint makes the downlight land on the display deck.
    const poolMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uColor:{value:new T.Color('#ffe4ae')}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform vec3 uColor;void main(){float r=length(vUv-.5)*2.;float a=exp(-r*r*3.)*(1.-smoothstep(.7,1.,r))*.12;gl_FragColor=vec4(uColor,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});materials.push(poolMaterial);
    const pool=mesh(new T.PlaneGeometry(1.55,1.55),poolMaterial,g,'museum cabinet light pool');pool.rotation.x=-Math.PI/2;pool.position.y=1.58;pool.castShadow=pool.receiveShadow=false;
    return{spot,beam,shell,debug:()=>({index,curved:true,glassHeight:D.top-D.bottom,glassWidth:D.radiusX*2,glassDepth:D.radiusZ,light:spot.getWorldPosition(new T.Vector3()).toArray(),target:spot.target.getWorldPosition(new T.Vector3()).toArray(),beam:true,matchedVeneer:true,layeredDeck:true,glassOpacity:glass.opacity,shadowedSpot:false})};
  }
  window.ISLAND_VITRINE={dimensions:D,profile,glassGeometry,environment,build};
})();
