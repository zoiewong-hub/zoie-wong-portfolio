/* Six original silhouettes. Inspired by the user's mechanical proportions. */
(() => {
  const T=window.THREE;
  function make(c,style='host',parent=c.world){
    const {mesh,box,rod,ring,mat}=c,root=new T.Group();root.name='robot '+style;root.scale.setScalar(.5);parent.add(root);
    const colors={host:'#f3efdc',tennisA:'#e6dfc7',tennisB:'#6a9986',gardener:'#bc865a',snow:'#ce7038',cleaner:'#b3a17a'};
    const paint=new T.MeshPhysicalMaterial({color:colors[style],roughness:.4,metalness:.1,clearcoat:.45,clearcoatRoughness:.25});c.materials.push(paint);const silver=mat('#bac6c4',.35,.7),dark=mat('#172c34',.24,.08),rubber=mat('#344a4d',.9,0),light=mat('#bde9de',.3,.25);light.emissive=new T.Color('#61cbb8');light.emissiveIntensity=.3;
    const sphere=(r,m,x,y,z,p=root,s=[1,1,1],name='robot joint')=>{const o=mesh(new T.SphereGeometry(r,20,14),m,p,name);o.position.set(x,y,z);o.scale.set(...s);return o;};
    const cylinder=(r1,r2,h,m,x,y,z,p=root)=>{const o=mesh(new T.CylinderGeometry(r1,r2,h,24),m,p,'mechanical shell');o.position.set(x,y,z);return o;};
    const jade=mat('#a4d5bf',.35,.4),short=style==='gardener',body=new T.Group();root.add(body);body.position.y=short?.16:.35;
    if(short){for(const x of[-.22,.22]){box(.17,.18,.49,rubber,x,.1,0,root,'gardener track');for(const z of[-.16,0,.16])cylinder(.065,.065,.18,silver,x,.1,z,root).rotation.z=Math.PI/2;}}
    else for(const x of[-.17,.17]){sphere(.13,paint,x,.085,.05,root,[1,.62,1.4],'robot boot');rod([x,.14,0],[x,.28,0],.027,silver,root);sphere(.055,silver,x,.29,0);rod([x,.3,0],[x,.46,0],.035,silver,root);}
    if(style==='host'){cylinder(.26,.28,.31,paint,0,.22,0,body);cylinder(.264,.264,.055,jade,0,.36,0,body);sphere(.24,paint,0,.07,0,body,[1,.6,1]);}
    else if(style==='snow'){box(.42,.36,.28,paint,0,.24,0,body,'angular snowboard chassis');for(const side of[-1,1])sphere(.13,paint,side*.18,.33,0,body,[.8,1,1]);box(.19,.28,.13,dark,0,.25,-.19,body,'compact robot backpack');}
    else if(style==='tennisA'){box(.4,.34,.27,paint,0,.22,0,body,'square club chassis');box(.12,.16,.025,silver,0,.25,.15,body,'front vent');}
    else if(style==='tennisB'){sphere(.25,paint,0,.22,0,body,[.73,1.25,.75],'tall ovoid chassis');for(const y of[.1,.19,.28])ring(.12,.009,silver,0,y,.04,body).rotation.x=Math.PI/2;}
    else if(short){sphere(.34,paint,0,.24,0,body,[1,.75,.82],'rounded garden chassis');box(.4,.19,.22,silver,0,.27,-.24,body,'tool basket');}
    else{cylinder(.17,.2,.39,paint,0,.24,0,body);for(const y of[.13,.22,.31])ring(.18,.012,silver,0,y,0,body).rotation.x=Math.PI/2;}
    cylinder(.055,.075,.14,silver,0,.48,0,body);const head=new T.Group();body.add(head);head.position.y=.59;const eyes=[];
    if(style==='host'){
      const pts=[[.32,0],[.37,.035],[.4,.25],[.37,.46],[.26,.6],[.09,.66],[0,.67]].map(p=>new T.Vector2(...p));mesh(new T.LatheGeometry(pts,56),paint,head,'pearl ivory bell dome');ring(.323,.019,jade,0,.015,0,head).rotation.x=Math.PI/2;for(const x of[-.25,.25])sphere(.014,silver,x,.065,.23,head,[1,1,.5],'head rim screw');
      for(const x of[-.13,.13])eyes.push(sphere(.054,dark,x,.2,.363,head,[1,1,.48],'black round eye'));
      const wire=[[-.01,.66,0],[-.01,.74,0],[-.12,.87,0],[-.1,.96,0],[0,.9,0],[.1,.96,0],[.12,.87,0],[0,.75,0]].map(p=>new T.Vector3(...p));mesh(new T.TubeGeometry(new T.CatmullRomCurve3(wire),40,.009,5,false),silver,head,'heart-shaped antenna');
    }else if(style==='tennisA'){
      box(.55,.34,.36,paint,0,.17,0,head,'square tennis robot head');box(.42,.17,.035,dark,0,.16,.2,head,'square face inset');for(const x of[-.11,.11])eyes.push(sphere(.04,light,x,.17,.225,head));box(.63,.03,.43,silver,0,.36,.015,head,'club visor');for(const y of[.09,.15,.21])box(.27,.015,.012,silver,0,y,-.187,head,'rear head cooling vent');
    }else if(style==='tennisB'){
      cylinder(.19,.24,.28,paint,0,.15,0,head);for(const x of[-.14,.14]){cylinder(.11,.11,.13,silver,x,.22,.16,head).rotation.x=Math.PI/2;eyes.push(sphere(.065,dark,x,.22,.245,head));rod([x,.31,0],[x*.9,.5,0],.012,silver,head);sphere(.025,paint,x*.9,.51,0,head);}
    }else if(style==='snow'){
      const hull=mesh(new T.DodecahedronGeometry(.3,0),paint,head,'faceted snowboard robot head');hull.position.y=.18;hull.scale.set(1.12,.9,.85);box(.45,.115,.055,dark,0,.2,.25,head,'sports face panel');for(const x of[-.1,.1])eyes.push(sphere(.037,light,x,.2,.285,head,[1,.6,.35]));for(const side of[-1,1])cylinder(.08,.08,.06,silver,side*.29,.18,0,head).rotation.z=Math.PI/2;
    }else if(short){sphere(.25,paint,0,.15,0,head,[1,.75,.8]);for(const x of[-.09,.09])eyes.push(sphere(.04,dark,x,.15,.19,head));cylinder(.35,.32,.035,silver,0,.28,0,head);sphere(.065,paint,0,.37,0,head,[.7,1.4,.7]);}
    else{cylinder(.18,.2,.39,paint,0,.2,0,head);for(const x of[-.08,.08])eyes.push(sphere(.04,dark,x,.25,.178,head));sphere(.045,silver,-.19,.2,0,head);rod([.06,.4,0],[.06,.59,0],.009,silver,head);}
    const arms=[],hands=[];for(const side of[-1,1]){const arm=new T.Group();body.add(arm);arm.position.set(side*(short?.31:.27),.36,0);sphere(.06,silver,0,0,0,arm);rod([0,-.02,0],[side*.035,-.17,.01],.025,silver,arm);sphere(.043,silver,side*.035,-.17,.01,arm);rod([side*.035,-.17,.01],[side*.07,-.32,.04],.022,silver,arm);const hand=new T.Group();arm.add(hand);hand.position.set(side*.07,-.32,.04);cylinder(.075,.075,.08,style==='host'?jade:paint,0,0,0,hand);for(const x of[-.04,0,.04]){rod([x,-.04,0],[x,-.1,.02],.009,silver,hand);rod([x,-.1,.02],[x,-.1,.06],.009,silver,hand);}arms.push(arm);hands.push(hand);}
    // Fitted collars and a recessed, batched cooling grille keep each robot legible in close-up.
    for(const y of[.425,.485])ring(.066,.009,rubber,0,y,0,body).rotation.x=Math.PI/2;
    const grilleGeo=new T.BoxGeometry(.13,.007,.009),grille=new T.InstancedMesh(grilleGeo,dark,5),part=new T.Object3D();c.geometries.push(grilleGeo);grille.name='recessed robot cooling grille';body.add(grille);const faceZ=style==='host'?.273:short?.285:style==='tennisB'?.19:.145;for(let i=0;i<5;i++){part.position.set(0,.17+i*.026,faceZ);part.updateMatrix();grille.setMatrixAt(i,part.matrix);}grille.instanceMatrix.needsUpdate=true;grille.computeBoundingSphere();
        return{root,body,head,arms,hands,eyes,eyeMat:light,materials:[paint,silver,dark,rubber,light,jade],sphere};
  }
  window.ROBOT_CAST={make};
})();
