// Grid pathfinding shared by mouse movement and its tests. No task-state access.
export function findCampusPath(start,target,valid,{step=.65,limit=12000,bounds={minX:-45,maxX:45,minZ:-42,maxZ:70}}={}){
 const key=(x,z)=>`${x},${z}`,world=n=>({x:n.x*step,z:n.z*step});
 const clear=(a,b)=>{const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.05);for(let i=1;i<=n;i++){const x=a.x+(b.x-a.x)*i/n,z=a.z+(b.z-a.z)*i/n;if(!valid(x,z)||!valid(x-.04,z)||!valid(x+.04,z)||!valid(x,z-.04)||!valid(x,z+.04))return false;}return true;};
 if(!valid(target.x,target.z))return [];
 if(clear(start,target))return [target];
 const nearest=p=>{const x=Math.round(p.x/step),z=Math.round(p.z/step);let best=null,d=Infinity;for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const n={x:x+dx,z:z+dz},w=world(n),distance=Math.hypot(w.x-p.x,w.z-p.z);if(distance<d&&valid(w.x,w.z)&&clear(p,w)){best=n;d=distance;}}return best;};
 const first=nearest(start),end=nearest(target);if(!first||!end)return [];
 const heuristic=n=>Math.hypot(n.x-end.x,n.z-end.z),open=[{...first,g:0,f:heuristic(first)}],cost=new Map([[key(first.x,first.z),0]]),came=new Map(),closed=new Set();
 for(let count=0;open.length&&count<limit;count++){
   let best=0;for(let i=1;i<open.length;i++)if(open[i].f<open[best].f)best=i;
   const node=open.splice(best,1)[0],id=key(node.x,node.z);if(closed.has(id))continue;closed.add(id);
   if(node.x===end.x&&node.z===end.z){const points=[target];let current=node;while(current){points.push(world(current));current=came.get(key(current.x,current.z));}points.reverse();
     const result=[];let from=start,i=0;while(i<points.length){let next=i;while(next+1<points.length&&clear(from,points[next+1]))next++;result.push(points[next]);from=points[next];i=next+1;}return result;}
   for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){
     if(!dx&&!dz)continue;const next={x:node.x+dx,z:node.z+dz},w=world(next),nid=key(next.x,next.z),g=node.g+Math.hypot(dx,dz);
     if(w.x<bounds.minX||w.x>bounds.maxX||w.z<bounds.minZ||w.z>bounds.maxZ||closed.has(nid)||!valid(w.x,w.z)||!clear(world(node),w)||g>=(cost.get(nid)??Infinity))continue;
     cost.set(nid,g);came.set(nid,node);open.push({...next,g,f:g+heuristic(next)});
   }
 }
 return [];
}
