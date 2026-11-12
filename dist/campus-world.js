// World definitions are independent of story progression. Other worlds can supply their own layout.
export const campusWorld={id:'campus',name:'青岚校园',bounds:{minX:-45,maxX:75,minZ:-42,maxZ:70},regions:[
 {id:'science',name:'科学中心',x:0,z:-10},
 {id:'courtyard',name:'中央庭院',x:0,z:15},
 {id:'cafe',name:'咖啡馆',x:0,z:49},
 {id:'library',name:'图书馆',x:45,z:16},
 {id:'transit',name:'校车站',x:60,z:37},
 {id:'garden',name:'探索草坪',x:-25,z:51},
 {id:'sports',name:'运动区',x:-24,z:25},
 {id:'shop',name:'校园商店',x:24,z:45}
]};
export const worlds={campus:campusWorld};
export function requireWorld(id){if(!worlds[id])throw new Error('地图尚未实现：'+id);return worlds[id];}
