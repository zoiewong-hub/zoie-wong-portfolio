/* Seven original miniature gulls. One shared scene clock; no extra RAF. */
(() => {
  function build(c){const T=window.THREE,{world,ball,mesh,mat}=c,ivory=mat('#f8f3dd'),ink=mat('#304f53'),gulls=[];let clock=0;
    for(let i=0;i<7;i++){const root=new T.Group();world.add(root);root.name='island seabird';root.scale.setScalar(.7);
      ball(.1,ivory,0,0,0,root,[.65,.6,1.4]);ball(.064,ivory,0,.045,.115,root);const beak=mesh(new T.ConeGeometry(.022,.09,10),ink,root,'gull beak');beak.position.set(0,.045,.21);beak.rotation.x=Math.PI/2;
      const wings=[];for(const side of[-1,1]){const hinge=new T.Group();root.add(hinge);hinge.position.set(side*.045,.02,0);ball(.17,ivory,side*.18,0,0,hinge,[1.6,.11,.62]);ball(.09,ink,side*.39,-.015,-.045,hinge,[1.05,.1,.5]);wings.push(hinge);ball(.07,ivory,side*.033,-.012,-.15,root,[.45,.14,1.4]);}gulls.push({root,wings,phase:i*1.07});
    }
    function position(i,t){const a=t*(.065+i*.002)+i*.85,r=12.2+(i%3)*1.15,x=Math.cos(a)*r,z=Math.sin(a)*r*.76,y=Math.max(4.2+Math.sin(a*2+i)*.8,ISLAND_LANDSCAPE.rangeHeight(x,z)+1.2);return new T.Vector3(x,y,z);}
    function update(dt,still){if(!still)clock+=dt;for(const [i,g]of gulls.entries()){const p=position(i,clock),next=position(i,clock+.1);g.root.position.copy(p);g.root.lookAt(next);const flap=still?.12:Math.sin(clock*(4.2+i*.11)+g.phase)*.37;g.wings.forEach((w,j)=>w.rotation.z=(j?1:-1)*(.12+flap));}}
    update(0,true);return{update,debug:()=>({count:gulls.length,time:clock,positions:gulls.map(g=>g.root.position.toArray())})};
  }
  window.ISLAND_BIRDS={build};
})();
