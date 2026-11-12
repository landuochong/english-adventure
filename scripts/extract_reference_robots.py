"""Rebuild the local reference bundle from the user-supplied, single-file demo.
Retains original geometry/material/motion code, omits HUD and game startup.
Usage: python3 scripts/extract_reference_robots.py /path/to/reference.html
"""
from pathlib import Path
import hashlib
import sys

source = Path(sys.argv[1])
data = source.read_bytes()
expected = '9e55b5200b088adaf8e1152da04efc0d3b25e236e6baf2dee96f81e23e084966'
if hashlib.sha256(data).hexdigest() != expected:
    raise SystemExit('Reference changed: inspect its boundaries before extracting.')
script = data.decode().split('<script>', 1)[1].split('</script>', 1)[0]
script = script[:script.index('var tx=4,nx=-90')]
# The campus companion uses the original rig and gait, without weapon geometry.
script = script.replace('function Z_(){', 'function Z_(companion=false){', 1)
script = script.replace('let t=(n,s,o,r,a)=>e.add(n,s,o,r,a);', 'let t=(n,s,o,r,a)=>{if(!companion||(s!=="gun"&&s!=="turret"))e.add(n,s,o,r,a)};', 1)
script += '''
function campusHound(G){
 const T=lt;
 const ctx={G,rng:il(4207),list:[],t:0,mergeSimple:g=>sa(g,false),
 think:m=>{m.los=false;m.mode="patrol";},releaseToken:()=>{},provoke:()=>{}};
 const mats={shell:new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.65}),
 metal:new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.4,metalness:.65}),
 glow:new T.MeshBasicMaterial({vertexColors:true}),lensBase:new T.MeshBasicMaterial({color:0x65d9e9})};
 const dog=iM(ctx,Z_(true),mats,0);ctx.list.push(dog);G.scene.add(dog.rig.group);
 dog._activate(new T.Vector3(-.5,0,17),{passive:true,yaw:Math.PI,patrolRadius:0});
 return {dog,update(dt){ctx.t+=dt;dog._update(dt);}};
}
'''
script += 'window.CampusReference={THREE:lt,materials:Gg,physics:d3,events:Dy,rng:il,showcase:VC,companion:campusHound};})();\n'
output = Path(__file__).resolve().parents[1] / 'dist/reference/robots-runtime.js'
output.write_text('// Local reference extracted from user-provided 几猫 HTML. Original model and motion routines retained. No game boot.\n' + script)
print(output)
