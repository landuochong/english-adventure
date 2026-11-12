import bpy
import sys
from pathlib import Path
bpy.ops.wm.read_factory_settings(use_empty=True)
source=Path(sys.argv[sys.argv.index('--')+1]).expanduser() if '--' in sys.argv else Path.home()/'Downloads'
project=Path(__file__).resolve().parents[1]
base=None
for name in ['Idle','Talking','Walking']:
 before=set(bpy.data.objects)
 bpy.ops.import_scene.fbx(filepath=str(source/(name+'.fbx')))
 imported=set(bpy.data.objects)-before
 arm=next(o for o in imported if o.type=='ARMATURE')
 action=arm.animation_data.action;action.name=name;action.use_fake_user=True
 if base is None:
  base=arm;base.animation_data.action=None
 else:
  for obj in imported:bpy.data.objects.remove(obj,do_unlink=True)
 track=base.animation_data.nla_tracks.new();track.name=name
 strip=track.strips.new(name,1,action);strip.name=name
for track in base.animation_data.nla_tracks:track.mute=True
base.animation_data.action=bpy.data.actions['Idle']
bpy.context.scene.frame_set(1)
base.animation_data.action=None
for track in base.animation_data.nla_tracks:track.mute=False
bpy.ops.export_scene.gltf(filepath=str(project/'dist/assets/characters/vanguard-mixamo.glb'),export_format='GLB',export_animation_mode='NLA_TRACKS',export_anim_slide_to_zero=True,export_anim_scene_split_object=False)
print('EXPORTED',[(a.name,tuple(a.frame_range)) for a in bpy.data.actions])
