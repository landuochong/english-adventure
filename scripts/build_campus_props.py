import bpy,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'dist/assets/campus-props';out.mkdir(exist_ok=True)
items={'computer':'modular-sci-fi-megakit/Props/Prop_Computer.gltf','access':'modular-sci-fi-megakit/Props/Prop_AccessPoint.gltf','desk':'sci-fi-essentials-kit/Prop_Desk_Medium.gltf','chair':'sci-fi-essentials-kit/Prop_Chair.gltf','locker':'sci-fi-essentials-kit/Prop_Locker.gltf','drone':'sci-fi-essentials-kit/Enemy_EyeDrone.gltf'}
records=[]
for name,source in items.items():
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=str(root/'dist/assets/quaternius'/source))
 for im in bpy.data.images:
  if im.size[0]>1024 or im.size[1]>1024:
   ratio=1024/max(im.size);im.scale(round(im.size[0]*ratio),round(im.size[1]*ratio));im.pack()
 bpy.ops.export_scene.gltf(filepath=str(out/(name+'.glb')),export_format='GLB',export_animations=name=='drone')
 records.append({'name':name,'source':source,'file':name+'.glb','bytes':(out/(name+'.glb')).stat().st_size})
(out/'sources.json').write_text(json.dumps(records,indent=2))
