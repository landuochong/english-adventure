"""Check imported asset integrity and dependency completeness; does not assert visual quality."""
from pathlib import Path
import base64,hashlib,json,struct,urllib.parse
ROOT=Path(__file__).resolve().parents[1]
catalog=json.loads((ROOT/'resources/quaternius/catalog.json').read_text())
for pack in catalog['packs']:
 archive=ROOT/pack['archive']
 if archive.exists():assert hashlib.sha256(archive.read_bytes()).hexdigest()==pack['archive_sha256'],archive
 for license_path in pack['license_files']:assert (ROOT/license_path).is_file(),license_path
for asset in catalog['assets']:
 path=ROOT/asset['file'];raw=path.read_bytes();assert hashlib.sha256(raw).hexdigest()==asset['sha256'],path
 if path.suffix=='.glb':
  magic,version,length=struct.unpack_from('<III',raw);assert magic==0x46546C67 and version==2 and length==len(raw),path
  size=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+size]);bin_size=struct.unpack_from('<I',raw,20+size)[0] if len(raw)>20+size else 0
 else:doc=json.loads(raw);bin_size=0
 assert doc['asset']['version']=='2.0',path
 for kind in ['buffers','images']:
  for entry in doc.get(kind,[]):
   uri=entry.get('uri')
   if uri and uri.startswith('data:'):data=base64.b64decode(uri.split(',',1)[1])
   elif uri:
    assert not urllib.parse.urlsplit(uri).scheme,(path,uri)
    dependency=(path.parent/urllib.parse.unquote(uri)).resolve();assert dependency.is_relative_to(ROOT),dependency;data=dependency.read_bytes()
   elif kind=='buffers':assert bin_size>=entry['byteLength'];continue
   else:continue
   if kind=='buffers':assert len(data)>=entry['byteLength'],path
 for name,expected in asset.get('dependency_sha256',{}).items():assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==expected,name
 assert len(doc.get('animations',[]))==len(asset['animations']),path
print(f"Verified {len(catalog['packs'])} source packages and {len(catalog['assets'])} asset entries: hashes, GLB headers, buffers, textures, animation counts.")
