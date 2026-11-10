/* V15: a guided walk through four distinct island atmospheres. */
(() => {
  'use strict';const T=window.THREE;
  const stops=[
    {id:'dock',zh:'从这里，上岛。',en:'A little way ashore.',hint:['沿着木码头，去见第一位岛民。','Follow the dock. Someone is waiting.'],cta:['向机器人走去','Meet the robot'],p:[2.35,1.615,12.05],at:[3.1722,1.2,7.9573],fov:60},
    {id:'robot',zh:'你好，小岛朋友。',en:'Hello, island friend.',hint:['打个招呼，收下一张它珍藏的笔记。','Say hello. A little note is waiting in its hand.'],cta:['和它打招呼','Say hello'],p:[2.755,1.615,10.015],at:[3.1722,1.2,7.9573],action:'robot',fov:58},
    {id:'court',zh:'好球，也好时光。',en:'A fine day for a rally.',hint:['在场边的小看台，看一场漂亮的来回。','A little courtside stand for a beautiful rally.'],cta:['看一轮对打','Watch a rally'],p:[2,2.0775,3.9],at:[-3.4,1.075,4],phoneP:[2,2.0775,3.9],phoneAt:[-3.4,1.075,4],action:'tennis',fov:90},
    {id:'cinema',zh:'留一场电影的时间。',en:'A story worth sitting with.',hint:['坐下来，看一段关于棉花与守护的原创短片。三秒之后，收下一页项目笔记。','Take a seat for an original three-second study of cotton and care. A project note follows.'],cta:['再看一遍','Watch again'],p:[5.2,1.49,3.8],at:[8.225,2.05,3.8],action:'cinema',fov:70},
    {id:'garden',zh:'一朵棉花，一个世界。',en:'A little cotton, a wider world.',hint:['玻璃温室里，园丁正在忙碌。轻触地球，让它亮起来。','The gardener is at work. Touch the globe and let it shine.'],cta:['点亮小地球','Light up the globe'],p:[5.2,1.74,-1.3],at:[5.2,1.76,-3.2],phoneP:[5.2,1.74,-1.3],phoneAt:[5.2,1.76,-3.2],action:'globe',fov:57},
    {id:'snow',zh:'顺着山势，向自由。',en:'Find your own line.',hint:['单板机器人沿雪坡而来。经过小路时，一页笔记随风落下。','A snowboarder is coming your way. A note drifts down as it passes the path.'],cta:['顺坡出发','Drop in'],p:[-6.45,ISLAND_LANDSCAPE.walkHeight(-6.45,.75)+.825,.75],at:[-5.9,3.2,-4.3],phoneP:[-6.45,ISLAND_LANDSCAPE.walkHeight(-6.45,.75)+.825,.75],phoneAt:[-5.9,3.2,-4.3],action:'ski',fov:82},
    {id:'summit',zh:'把时间，留给这片蓝。',en:'The hour between.',hint:['从山顶俯瞰小岛，等地平线后的余光与岛上灯火交接。','An island panorama. The sun slips behind the horizon; little lights take over.'],cta:['看一场蓝调日落','Stay for the blue hour'],p:[-1.3,ISLAND_LANDSCAPE.rangeHeight(-1.3,-4.7)+.825,-4.7],at:[3.2,2.5,5.2],action:'sunset',fov:86}
  ];
  function create(ctx){
    const {scene,world,camera,mesh,materials}=ctx,v=a=>new T.Vector3(...a),clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=t=>t*t*(3-2*t);
    const atmosphere=window.ISLAND_ATMOSPHERE.create(ctx),stairs=atmosphere.stairs;
    // Finite age/life splash rings adapted from ThreeUI Community 1.2.0,
    // landscape.html (Meng To, MIT). Real world-space water hits; no iframe.
    const splashes=[];let splashSlot=0,splashCount=0,lastSplash=null;
    for(let i=0;i<12;i++){const material=new T.MeshBasicMaterial({color:'#eff6d7',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});ctx.materials.push(material);const ring=mesh(new T.RingGeometry(.935,1,72),material,scene,'touch ripple');ring.rotation.x=-Math.PI/2;ring.castShadow=ring.receiveShadow=false;ring.visible=false;splashes.push({ring,age:3,life:2.1,base:1});}
    function splash(raycaster,still){
      const point=raycaster.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),-.055),new T.Vector3());if(!point)return false;
      for(let i=0;i<5;i++){const height=atmosphere.surfaceHeight(point.x,point.z);if(!raycaster.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),-height),point))return false;}
      const distance=camera.position.distanceTo(point);if(distance>180)return false;
      const solid=raycaster.intersectObjects(world.children,true).find(hit=>{if(hit.object.isPoints)return false;let o=hit.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});if(solid&&solid.distance<distance)return false;
      lastSplash=point.toArray();splashCount++;const slot=splashSlot++%4;
      for(let i=0;i<3;i++){const s=splashes[slot*3+i];s.ring.position.set(point.x,.055+i*.001,point.z);s.age=still?.3+i*.23:-i*.14;s.base=Math.max(.7,Math.min(4,distance*.027));s.ring.visible=true;}
      return true;
    }
    let step=-1,travel=null,viewTurn=null,starView=false,yaw=0,pitch=0,targetYaw=0,targetPitch=0,sunset=0,targetSunset=0,clock=0,desiredFov=44,skiTracking=false;
    const done=new Set(),at=v([0,1,0]);
    const pointFor=i=>camera.aspect<.8&&stops[i].phoneP?stops[i].phoneP:stops[i].p;const stationAt=()=>v(camera.aspect<.8&&stops[step]?.phoneAt?stops[step].phoneAt:stops[step]?.at||[0,1,0]);
    const overview=()=>{const narrow=camera.aspect<.8;return v(narrow?[35,33.5,53]:[21,18.5,30]);};
    function status(){return{active:step>=0,step,id:stops[step]?.id||'overview',moving:!!travel||!!viewTurn,lookingAtStar:starView,transport:viewTurn?'turn':travel?.kind||null,complete:[...done],sunset:targetSunset};}
    function notify(){ctx.onChange?.(status());}
    const up=new T.Vector3(0,1,0),lookQuat=(eye,aim)=>new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(eye,aim,up));
    const rideDirection=ISLAND_CABLE.end.clone().sub(ISLAND_CABLE.start);rideDirection.y=0;rideDirection.normalize();const scenicDirection=new T.Vector3(.45,-.22,1).normalize(),cabinUpQuat=lookQuat(new T.Vector3(),scenicDirection),cabinDownQuat=cabinUpQuat.clone();
    function walkCurve(points){const dense=[points[0]];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.ceil(a.distanceTo(b)/.16);for(let j=1;j<=n;j++)dense.push(a.clone().lerp(b,j/n));}return new T.CatmullRomCurve3(dense,false,'centripetal');}
    function go(next,instant=false){
      next=clamp(next,-1,stops.length-1);if(next===step||travel&&!instant&&next>=0)return;const prev=step;step=next;viewTurn=null;starView=false;skiTracking=false;targetYaw=yaw=0;targetPitch=pitch=0;targetSunset=0;
      const end=next<0?overview():v(pointFor(next)),toAt=next<0?v([0,1,0]):stationAt(),fromQuat=camera.quaternion.clone(),toQuat=lookQuat(end,toAt);
      if((prev===5&&next===6)||(prev===6&&next===5)){
        const ascending=next===6,entryU=ascending?0:1,exitU=ascending?1:0,entryEye=ISLAND_CABLE.point(entryU).add(ISLAND_CABLE.eyeOffset),exitEye=ISLAND_CABLE.point(exitU).add(ISLAND_CABLE.eyeOffset);
        const approach=ascending?[[-7.1,1.595,.75]]:[];
        const leave=ascending?[]:[[-7.1,1.595,.75]];
        travel={kind:'cable',ascending,rideQuat:ascending?cabinUpQuat:cabinDownQuat,time:0,duration:13,entry:walkCurve([camera.position.clone(),...approach.map(v),entryEye]),exit:walkCurve([exitEye,...leave.map(v),end]),end,toAt,fromQuat,toQuat,lookQuat:fromQuat.clone()};ctx.setCableProgress?.(entryU);
      }else{
        const points=[camera.position.clone()];
        if(next<0)points.push(v([9,12,15]),end);
        else if(prev<0){points.push(v([5,6.5,13]),v(pointFor(0)));if(next!==0)points.push(end);}
        else if((prev===0&&next===1)||(prev===1&&next===0)){let p=[[2.6,1.615,10.78]];if(next===0)p.reverse();points.push(...p.map(v),end);}
        else if((prev===1&&next===2)||(prev===2&&next===1)){let p=[[2.755,1.615,10.015],[2.75,1.615,9.1],[2.56,1.615,8.5],[2.5,1.595,7.65],[2.9,1.595,6.6],[2.9,1.595,3.9],[2.35,1.8,3.9]];if(next===1)p.reverse();points.push(...p.map(v),end);}
        else if((prev===2&&next===3)||(prev===3&&next===2)){let p=[[2.9,1.595,3.9],[2.9,1.595,3.8],[4.45,1.595,3.8]];if(next===2)p.reverse();points.push(...p.map(v),end);}
        else if((prev===3&&next===4)||(prev===4&&next===3)){let p=[[4.45,1.595,3.8],[4.45,1.595,.75],[5.2,1.595,.75],[5.2,1.74,-.5],[5.2,1.74,-1]];if(next===3)p.reverse();points.push(...p.map(v),end);}
        else if((prev===4&&next===5)||(prev===5&&next===4)){let p=[[5.2,1.74,-.5],[5.2,1.595,.75],[2.9,1.595,.75],[0,1.595,.75],[-3,1.595,.75]];if(next===4)p.reverse();points.push(...p.map(v),end);}
        else points.push(end);
        const dense=[points[0]];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.ceil(a.distanceTo(b)/.2);for(let j=1;j<=n;j++)dense.push(a.clone().lerp(b,j/n));}travel={kind:'walk',forwardLook:prev>=2&&next>=2,curve:new T.CatmullRomCurve3(dense,false,'centripetal'),time:0,duration:prev<0||next<0?3.4:prev>=2&&next>=2?8:prev===3||next===3?6.5:3.5,end,toAt,fromQuat,toQuat,lookQuat:fromQuat.clone()};
      }
      if(instant)finish();notify();
    }
    function finish(){if(!travel)return;camera.position.copy(travel.end);if(travel.kind==='cable')ctx.setCableProgress?.(travel.ascending?1:0);at.copy(travel.toAt);travel=null;notify();}
    function update(dt,mood,still,rotation,w,h){
      clock+=dt;sunset+=clamp(targetSunset-sunset,-dt/10,dt/10);if(still)sunset=targetSunset;if(Math.abs(sunset-targetSunset)<.001)sunset=targetSunset;
      const dusk=Math.max(mood,smooth(sunset));atmosphere.update(dt,dusk,still);
      for(const s of splashes){if(!s.ring.visible)continue;if(!still)s.age+=dt;const t=clamp(s.age/s.life,0,1);s.ring.visible=s.age<s.life;s.ring.scale.setScalar(s.base*(.2+t*2.7));s.ring.material.opacity=s.age<0?0:Math.pow(1-t,1.9)*.72;
        const pos=s.ring.geometry.attributes.position,r=s.ring.scale.x;for(let i=0;i<pos.count;i++){const x=s.ring.position.x+pos.getX(i)*r,z=s.ring.position.z-pos.getY(i)*r;pos.setZ(i,(atmosphere.surfaceHeight(x,z)+.026-s.ring.position.y)/r);}pos.needsUpdate=true;}
      if(travel){if(still)finish();else{
        travel.time=Math.min(1,travel.time+dt/travel.duration);const t=travel.time;
        if(travel.kind==='cable'){
          if(t<.22){const q=smooth(t/.22);camera.position.copy(travel.entry.getPointAt(q));camera.position.y=Math.max(camera.position.y,ISLAND_LANDSCAPE.walkHeight(camera.position.x,camera.position.z)+.4);travel.lookQuat.copy(travel.fromQuat).slerp(travel.rideQuat,q);}
          else if(t<.88){const q=smooth((t-.22)/.66),u=travel.ascending?q:1-q;ctx.setCableProgress?.(u);camera.position.copy(ISLAND_CABLE.point(u)).add(ISLAND_CABLE.eyeOffset);travel.lookQuat.copy(travel.rideQuat);}
          else{const q=smooth((t-.88)/.12);ctx.setCableProgress?.(travel.ascending?1:0);camera.position.copy(travel.exit.getPointAt(q));travel.lookQuat.copy(travel.rideQuat).slerp(travel.toQuat,q);}
        }else{const q=smooth(t);camera.position.copy(travel.curve.getPointAt(q));camera.position.y=Math.max(camera.position.y,ISLAND_LANDSCAPE.walkHeight(camera.position.x,camera.position.z)+.825);if(travel.forwardLook){const ahead=travel.curve.getPointAt(Math.min(1,q+Math.min(.12,.85/travel.curve.getLength())));ahead.y=camera.position.y-.03;const forward=lookQuat(camera.position,ahead);forward.slerp(travel.toQuat,smooth(clamp((q-.7)/.3,0,1)));travel.lookQuat.rotateTowards(forward,dt*1.8);}else travel.lookQuat.copy(travel.fromQuat).slerp(travel.toQuat,q);}
        at.copy(camera.position).addScaledVector(new T.Vector3(0,0,-1).applyQuaternion(travel.lookQuat),6);if(t===1&&(!travel.forwardLook||travel.lookQuat.angleTo(travel.toQuat)<.015))finish();
      }}
      else if(step<0){camera.position.copy(overview());at.set(0,1,0);}
      if(viewTurn){viewTurn.time=Math.min(1,viewTurn.time+(still?1:dt/2.8));const q=viewTurn.from.clone().slerp(viewTurn.to,smooth(viewTurn.time));at.copy(camera.position).addScaledVector(new T.Vector3(0,0,-1).applyQuaternion(q),6);if(viewTurn.time===1){viewTurn=null;notify();}}

      if(step===5&&!travel){const motion=ctx.motion?.();if(motion?.skiing)skiTracking=true;if(skiTracking&&motion?.skier){const target=v(motion.skier.position);target.y+=.4;target.lerp(stationAt(),.18);at.lerp(target,still?1:1-Math.exp(-dt*2.6));}}
      world.rotation.y=rotation;
      desiredFov=travel?.kind==='cable'?(w/h<.8?86:70):step>=0?(w/h<.8?(step===6?86:step===5?78:step===2?120:step===3?105:68):stops[step].fov||58):(w/h<.8?54:44);camera.fov+=(desiredFov-camera.fov)*(1-Math.exp(-dt*6));if(still||Math.abs(desiredFov-camera.fov)<.001)camera.fov=desiredFov;
      if(step>=0){yaw+=(targetYaw-yaw)*(1-Math.exp(-dt*10));pitch+=(targetPitch-pitch)*(1-Math.exp(-dt*10));if(still)yaw=targetYaw,pitch=targetPitch;camera.lookAt(at);const upright=new T.Euler().setFromQuaternion(camera.quaternion,'YXZ');upright.y+=yaw;upright.x=clamp(upright.x+pitch,-.8,.8);upright.z=0;camera.quaternion.setFromEuler(upright);}
      else camera.lookAt(at);
      if(step>=0&&w/h<.8)camera.setViewOffset(w,h,0,h*.08,w,h);else camera.clearViewOffset();camera.updateProjectionMatrix();
      return dusk;
    }
    function action(type,instant){
      if(type==='cinema-seat'){if(step===3&&!travel)ctx.interact('cinema');else go(3,instant);return true;}
      if(type==='cloud-lift'||type==='cable-car'){if(step===5)go(6,instant);else go(5,instant);return true;}
      if(type==='journey-note'){if(!travel)ctx.onRead?.(stops[step]?.id);return true;}
      if(type==='journey-archive'){if(step===6&&!travel)ctx.onPortal?.('archive');return true;}
      if(type==='journey-enter'){if(step<0)go(0,instant);return true;}
      if(type==='journey-next'){go(step+1,instant);return true;}
      if(type==='journey-back'){go(step-1,instant);return true;}
      if(type==='journey-overview'){go(-1,instant);return true;}
      if(type==='journey-act'){const s=stops[step];if(!s||travel||viewTurn)return true;if(step===0){go(1,instant);return true;}done.add(s.id);if(s.action==='sunset'){if(!targetSunset){targetSunset=1;}else if(!starView){starView=true;targetYaw=yaw=0;targetPitch=pitch=0;viewTurn={time:0,from:camera.quaternion.clone(),to:lookQuat(camera.position,v([-.7,6.8,-6.5]))};}else ctx.onPortal?.('archive');notify();return true;}if(s.action==='ski')skiTracking=true;ctx.interact(s.action);notify();return true;}
      if(type==='reset'&&step>=0){viewTurn=null;starView=false;targetYaw=targetPitch=0;skiTracking=false;at.copy(stationAt());notify();return true;}
      if(step>=0&&(type==='left'||type==='right')){targetYaw+=type==='left'?.24:-.24;return true;}
      return false;
    }
    return{update,action,splash,surfaceHeight:atmosphere.surfaceHeight,dispose:()=>atmosphere.dispose(),restore(n,blue){go(n,true);viewTurn=null;starView=false;yaw=targetYaw=pitch=targetPitch=0;targetSunset=sunset=blue?1:0;desiredFov=camera.fov=camera.aspect<.8?(n===6?86:n===5?78:n===2?120:n===3?105:68):(stops[n]?.fov||44);camera.quaternion.copy(lookQuat(camera.position,at));camera.updateProjectionMatrix();ctx.setCableProgress?.(n===6?1:0);notify();},look(dx,dy){targetYaw=clamp(targetYaw-dx*.004,-Math.PI,Math.PI);targetPitch=clamp(targetPitch-dy*.003,-.7,.65);},status,active:()=>step>=0,ambient:()=>true,busy:()=>splashes.some(s=>s.ring.visible&&s.age<s.life)||!!travel||!!viewTurn||Math.abs(camera.fov-desiredFov)>.001||Math.abs(yaw-targetYaw)>.001||Math.abs(pitch-targetPitch)>.001||Math.abs(sunset-targetSunset)>.001,debug:()=>({...status(),camera:camera.position.toArray(),orientation:camera.quaternion.toArray(),lookAt:at.toArray(),yaw,pitch,sunset,sun:atmosphere.debug().sun,atmosphere:atmosphere.debug(),perspective:camera.isPerspectiveCamera,travelTime:travel?.time,travelKind:travel?.kind,standingEyeHeight:step===6?camera.position.y-ISLAND_LANDSCAPE.rangeHeight(camera.position.x,camera.position.z):null,stairs:0,splashCount,lastSplash,ripples:splashes.filter(s=>s.ring.visible).map(s=>({radius:s.ring.scale.x,opacity:s.ring.material.opacity}))}),notify};
  }
  window.ISLAND_JOURNEY={create,stops};
})();




