from pathlib import Path,PurePosixPath
import zipfile,json,hashlib,struct,posixpath,urllib.parse,shutil,os
os.chdir(Path(__file__).resolve().parents[1])
root=Path('resources/quaternius');runtime=Path('dist/assets/quaternius');runtime.mkdir(parents=True,exist_ok=True)
selection={
'sci-fi-essentials-kit':['Enemy_EyeDrone','Enemy_QuadShell','Prop_Chair','Prop_Desk_Medium','Prop_Desk_Small','Prop_HealthPack','Prop_HealthPack_Tube','Prop_KeyCard','Prop_Locker','Prop_Mug','Prop_Chest','Prop_Crate','Prop_SatelliteDish','Prop_Shelves_ThinShort'],
'modular-sci-fi-megakit':['Prop_AccessPoint','Prop_Computer','Prop_ItemHolder','Prop_Light_Small','Prop_Light_Wide','Column_Simple','Door_Frame_Square','Door_Simple','Door_Metal','WallWindow_Straight','WallAstra_Straight_Window','TopWindow_Straight'],
'universal-animation-library':['UAL1_Standard','UAL1_Standard_RM']}
records=[];packs=[]
for slug,chosen in selection.items():
 archive=root/slug/'standard.zip';z=zipfile.ZipFile(archive);names=z.namelist();packdir=root/slug
 licenses=[]
 for n in names:
  if Path(n).name.lower().startswith(('license','readme')) and n.endswith('.txt'):
   out=packdir/Path(n).name;out.write_bytes(z.read(n));licenses.append(str(out))
 packs.append({'id':slug,'source':'https://quaternius.itch.io/'+slug,'edition':'Standard free','archive':str(archive),'archive_bytes':archive.stat().st_size,'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'license':'CC0-1.0 (bundled license)','license_files':licenses})
 for name in chosen:
  n=next(n for n in names if Path(n).stem==name and n.endswith(('.gltf','.glb')))
  prefix=n.split('/glTF/')[0]+'/glTF/' if '/glTF/' in n else 'glTF/' if n.startswith('glTF/') else str(PurePosixPath(n).parent)+'/'
  rel=n[len(prefix):];dest=runtime/slug/rel;dest.parent.mkdir(parents=True,exist_ok=True);data=z.read(n);dest.write_bytes(data)
  j=json.loads(data[20:20+struct.unpack_from('<I',data,12)[0]]) if n.endswith('.glb') else json.loads(data)
  dependencies=[]
  for item in j.get('buffers',[])+j.get('images',[]):
   uri=item.get('uri','')
   if not uri or uri.startswith('data:'):continue
   assert not urllib.parse.urlsplit(uri).scheme
   source=posixpath.normpath(posixpath.join(posixpath.dirname(n),urllib.parse.unquote(uri)));target=dest.parent/urllib.parse.unquote(uri)
   if source not in names:
    matches=[entry for entry in names if Path(entry).name==Path(source).name];assert len(matches)==1,(source,matches);source=matches[0]
   assert target.resolve().is_relative_to(runtime.resolve());target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(source));dependencies.append(str(target))
  clips=[{'name':a.get('name','unnamed'),'channels':len(a.get('channels',[]))} for a in j.get('animations',[])]
  records.append({'id':slug+'/'+name,'pack':slug,'file':str(dest),'archive_entry':n,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'dependencies':dependencies,'animations':clips,'status':'downloaded; JSON/GLB and external dependencies checked; not placed in scene; visual review pending'})
# Existing player: reference the active file, avoiding a duplicate model.
p=Path('dist/assets/characters/school-robot.glb');b=p.read_bytes();j=json.loads(b[20:20+struct.unpack_from('<I',b,12)[0]])
records.append({'id':'robot-expressive','pack':'robot-expressive','file':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'dependencies':[],'animations':[{'name':a['name']} for a in j['animations']],'status':'integrated as user-controlled student; browser verified in prior iteration','source':'https://github.com/mrdoob/three.js/tree/r180/examples/models/gltf/RobotExpressive','license':'CC0-1.0'})
manifest={'date':'2026-11-12','purpose':'Future-school reusable assets; inclusion does not imply automatic scene loading','packs':packs,'assets':records}
previous=json.loads((root/'catalog.json').read_text()) if (root/'catalog.json').exists() else {}
manifest['pending']=previous.get('pending',[])
for asset in records:
 asset['dependency_sha256']={p:hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in asset['dependencies']}
(root/'catalog.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Selected assets',len(records),'animation library clips',[(a['id'],len(a['animations'])) for a in records if 'UAL1_' in a['id']]);print('Runtime bytes',sum(p.stat().st_size for p in runtime.rglob('*') if p.is_file()))
