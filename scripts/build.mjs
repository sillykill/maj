import {mkdir,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist');
for (const file of ['index.html','src','docs','validation']) await cp(file,`dist/${file}`,{recursive:true});
console.log('Static build ready: dist');
