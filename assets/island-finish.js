/* V16: locally generated, derivative-filtered satin metallic microflakes. */
(() => {
  const seen=new WeakSet();
  function apply(m){
    if(!m?.isMeshStandardMaterial||seen.has(m))return;seen.add(m);
    // Dielectrics keep their own roughness and albedo. Only actual metal gets flakes.
    if(m.metalness<.45){m.envMapIntensity=m.isMeshPhysicalMaterial?.7:.3;return;}
    m.metalness=Math.min(1,m.metalness);m.roughness=Math.max(.27,Math.min(.64,m.roughness));m.envMapIntensity=.8;
    m.onBeforeCompile=shader=>{
      shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vFinishPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nvFinishPosition=position;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
        varying vec3 vFinishPosition;
        float finishHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}`)
        .replace('#include <color_fragment>',`#include <color_fragment>
          vec3 finishCell=floor(vFinishPosition*260.);
          float finishNoise=finishHash(finishCell);
          float finishAA=1.-smoothstep(.4,2.1,length(fwidth(vFinishPosition*260.)));
          float finishFlake=smoothstep(.975,.998,finishNoise)*finishAA;
          diffuseColor.rgb*=1.+(finishNoise-.5)*.018*finishAA;`)
        .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
          roughnessFactor=clamp(roughnessFactor*(1.+(finishNoise-.5)*.3*finishAA)-finishFlake*.13,.14,.8);`)
        .replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>
          metalnessFactor=clamp(metalnessFactor+finishFlake*.2,0.,1.);`)
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
          normal=normalize(normal+vec3(finishNoise-.5,finishHash(finishCell+7.)-.5,0.)*.006*finishAA);`);
    };
    m.customProgramCacheKey=()=> 'crafted-satin-metal-v2';m.needsUpdate=true;
  }
  window.ISLAND_FINISH={apply};
})();
