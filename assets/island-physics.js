/* Toy-scale analytic motion. Distances share the scene's world coordinates. */
(() => {
  const T=window.THREE;
  const L={ground:{radius:16.5,depth:12.9},court:{x:-3.4,y:1.02,z:4.0,blue:'#0066ad',green:'#3c7449',floor:1.075,ballRadius:.0525,net:1.69},mountain:{x:-1.5,z:-5,base:.76,height:4.3,radius:4},robot:[3.1722,.79,7.9573],dock:[2.9,.745,9.3]};
  const gravity=8.4;
  const peaks=[[-1.5,-5,4.4,4.3],[-4.6,-5.5,3.6,3.7],[-7.3,-5.4,3.1,2.7],[-9.2,-4.6,2.65,1.6],[1.8,-6.5,3.4,2.7],[5.2,-8,3.1,1.4],[-7.5,-4.5,4.5,2.8]];
  // Independent terrain: the ski run samples this field and never raises it.
  function terrainHeight(x,z){let power=0;for(const [px,pz,r,h]of peaks){const d=Math.hypot(x-px,z-pz)/r;if(d<1)power+=Math.pow(h*Math.pow(1-d*d,1.65),4);}const flank=Math.max(0,1-Math.pow((x+9.65)/3.3,2)-Math.pow((z+2.3)/9.4,2)),foothill=2.4*flank*flank*(1-T.MathUtils.smoothstep(x,-8.9,-7.9));power+=Math.pow(foothill,4);let h=Math.pow(power,1/4);const crown=Math.hypot((x+1.5)/1.65,(z+5)/1.4),blend=1-T.MathUtils.smoothstep(crown,.36,.94);h=T.MathUtils.lerp(h,4.3,blend);const coast=Math.hypot(x,z/(L.ground.depth/L.ground.radius));h*=1-T.MathUtils.smoothstep(coast,L.ground.radius*.76,L.ground.radius*.92);return .77+h+(h?Math.sin(x*2.1+z*.5)*Math.sin(z*1.8)*.025*Math.min(1,h)*(1-blend):0);}
  const terrainGrid={nx:168,nz:168,x0:-13,x1:8.1,z0:-10.5,z1:10.5};
  function groundSurfaceHeight(x,z){const g=terrainGrid,fx=(x-g.x0)/(g.x1-g.x0)*g.nx,fz=(z-g.z0)/(g.z1-g.z0)*g.nz;if(fx<0||fz<0||fx>=g.nx||fz>=g.nz)return terrainHeight(x,z);const ix=Math.floor(fx),iz=Math.floor(fz),u=fx-ix,v=fz-iz,xx=g.x0+ix/g.nx*(g.x1-g.x0),zz=g.z0+iz/g.nz*(g.z1-g.z0),dx=(g.x1-g.x0)/g.nx,dz=(g.z1-g.z0)/g.nz,a=terrainHeight(xx,zz),b=terrainHeight(xx,zz+dz),c=terrainHeight(xx+dx,zz),d=terrainHeight(xx+dx,zz+dz);return u+v<=1?a+(c-a)*u+(b-a)*v:d+(b-d)*(1-u)+(c-d)*(1-v);}
  const near=[-.9825,1.56,4.48],farBounce=[-5.75,1.1275,3.55],farHit=[-6.1575,1.57,3.38],nearBounce=[-1.4,1.1275,4.45];
  const flights=[{a:near,b:farBounce,duration:.95,event:'serve'},{a:farBounce,b:farHit,duration:.25,event:'far-bounce'},{a:farHit,b:nearBounce,duration:1,event:'return'},{a:nearBounce,b:near,duration:.24,event:'near-bounce'}];
  const total=flights.reduce((s,f)=>s+f.duration,0);
  function tennis(t){let elapsed=Math.max(0,Math.min(total,t)),start=0;for(let i=0;i<flights.length;i++){const s=flights[i];if(elapsed<=s.duration||i===flights.length-1){const f=Math.min(1,elapsed/s.duration),vy=(s.b[1]-s.a[1]+.5*gravity*s.duration*s.duration)/s.duration;return{position:[s.a[0]+(s.b[0]-s.a[0])*f,s.a[1]+vy*elapsed-.5*gravity*elapsed*elapsed,s.a[2]+(s.b[2]-s.a[2])*f],velocity:[(s.b[0]-s.a[0])/s.duration,vy-gravity*elapsed,(s.b[2]-s.a[2])/s.duration],segment:i,event:s.event,time:t,duration:total};}elapsed-=s.duration;start+=s.duration;}}
  const skiKnots=[[-2.55,5.03,-5.25],[-4.6,4.6,-5.1],[-7,3.7,-4.55],[-8.9,2.9,-3.3],[-9.9,2.5,-1.35],[-10.15,2,.95],[-10.05,1.5,3.45],[-9.8,1,5.9]],skiCurve=new T.CatmullRomCurve3(skiKnots.map(p=>new T.Vector3(...p)),false,'centripetal');
  function snowPoint(u){const p=skiCurve.getPoint(T.MathUtils.clamp(u,0,1));p.y=groundSurfaceHeight(p.x,p.z)+.014;return p;}
  function snow(u){const p=snowPoint(u),t=snowPoint(Math.min(1,u+.0001)).sub(snowPoint(Math.max(0,u-.0001))).normalize(),right=new T.Vector3(t.z,0,-t.x).normalize(),normal=new T.Vector3().crossVectors(t,right).normalize();if(normal.y<0)normal.negate();return{p,t,right,normal};}
  const timeLut=[{u:0,t:0}];let clock=0,prev=snow(0).p;
  for(let i=1;i<=160;i++){const u=i/160,p=snow(u).p,speed=Math.sqrt(1.3*1.3+2*9.81*Math.max(0,snow(0).p.y-p.y)*.84);clock+=p.distanceTo(prev)/speed;timeLut.push({u,t:clock});prev=p;}
  timeLut.forEach(p=>p.t/=clock);
  function ski(progress){let i=1;while(i<timeLut.length-1&&timeLut[i].t<progress)i++;const a=timeLut[i-1],b=timeLut[i],u=a.u+(b.u-a.u)*Math.max(0,Math.min(1,(progress-a.t)/(b.t-a.t)));const s=snow(u),before=snow(Math.max(0,u-.015)).t,after=snow(Math.min(1,u+.015)).t,turn=Math.max(-.38,Math.min(.38,(after.x-before.x)*2.4));return{...s,u,turn,speed:Math.sqrt(1.69+2*9.81*Math.max(0,snow(0).p.y-s.p.y)*.84)};}
  function apron(u){const s=snow(Math.min(1,u));if(u>1){s.p.addScaledVector(new T.Vector3(s.t.x,0,s.t.z).normalize(),(u-1)*2);s.p.y=terrainHeight(s.p.x,s.p.z)+.014;}return{...s,width:u>1?.65*(1-T.MathUtils.smoothstep(u,1,1.18)):1.15+.25*Math.sin(Math.PI*u)-.5*u};}
  // Keep the complete hull outside the enlarged, irregular shoreline, including
  // the sand's wider submerged foot. The route follows the same coastal model.
  const coastalBoat=angle=>{const k=1+.025*Math.sin(angle*3)+.016*Math.cos(angle*5),r=(L.ground.radius+2.6)*k;return new T.Vector3(Math.cos(angle)*r,.12,Math.sin(angle)*r*L.ground.depth/L.ground.radius);};
  const boatRoute=new T.CatmullRomCurve3(Array.from({length:32},(_,i)=>coastalBoat(.83-i/32*Math.PI*2)),true,'centripetal');
  window.ISLAND_PHYSICS={peaks,terrainHeight,terrainGrid,groundSurfaceHeight,apron,layout:L,tennis,flights,tennisDuration:total,snow,ski,boatRoute};
})();

