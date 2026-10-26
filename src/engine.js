export const VERSION='0.2.0';
export const LABELS=Array.from({length:34},(_,i)=>i<27?`${i%9+1}${['万','筒','条'][Math.floor(i/9)]}`:['东','南','西','北','中','发','白'][i-27]);
export const DEMO=[0,1,2,3,4,5,15,16,17,19,19,21,22,27];
export function counts(tiles){const c=Array(34).fill(0);for(const t of tiles){if(!Number.isInteger(t)||t<0||t>33)throw Error('无效牌');c[t]++;}return c;}
function meldable(c){let i=c.findIndex(x=>x>0);if(i<0)return true;if(c[i]>=3){c[i]-=3;const ok=meldable(c);c[i]+=3;if(ok)return true;}if(i<27&&i%9<7&&c[i+1]&&c[i+2]){c[i]--;c[i+1]--;c[i+2]--;const ok=meldable(c);c[i]++;c[i+1]++;c[i+2]++;if(ok)return true;}return false;}
export function isWinning(tiles,open=0,rules={sevenPairs:true,orphans:true,ghost:true,chicken:true}){if(tiles.length!==14-3*open)return false;const c=counts(tiles);if(c.some(n=>n>4))return false;
 const wild=rules.ghost?c[33]:0;if(rules.ghost)c[33]=0;
 if(open===0&&rules.sevenPairs){const odd=c.filter(n=>n%2).length;if(odd<=wild&&(wild-odd)%2===0)return true;}
 const terminals=[0,8,9,17,18,26,27,28,29,30,31,32,33];
 if(open===0&&rules.orphans&&c.every((n,i)=>!n||terminals.includes(i))){const missing=terminals.filter(i=>!c[i]).length;if(missing<=wild&&c.reduce((a,b)=>a+b,0)+wild===14)return true;}
 const memo=new Map();
 function solve(w,pair,m){const key=c.join('')+':'+w+':'+pair+':'+m;if(memo.has(key))return memo.get(key);let i=c.findIndex(n=>n);if(i<0)return w===3*m+(pair?0:2);
 let ok=false;const run=(ids,need,np,nm)=>{if(ok||need>w)return;for(const t of ids)c[t]--;ok=solve(w-need,np,nm);for(const t of ids)c[t]++;};
 if(!pair){if(c[i]>=2)run([i,i],0,true,m);if(w)run([i],1,true,m);if(w>=2)run([],2,true,m);}
 if(m>0){for(let n=Math.min(3,c[i]);n>=1&&!ok;n--)run(Array(n).fill(i),3-n,pair,m-1);
 if(i<27){for(let start=Math.max(9*Math.floor(i/9),i-2);start<=Math.min(i,9*Math.floor(i/9)+6)&&!ok;start++){const ids=[i];function seq(j,need){if(j===3){run(ids,need,pair,m-1);return;}const t=start+j;if(t===i){seq(j+1,need);return;}if(c[t]){ids.push(t);seq(j+1,need);ids.pop();}if(need<w)seq(j+1,need+1);}seq(0,0);}}}
 memo.set(key,ok);return ok;}
 const standard=solve(wild,false,4-open);if(!standard)return false;
 if(rules.chicken!==false)return true;
 // Non-chicken mode accepts these explicitly supported one-fan patterns.
 const suits=new Set([...tiles,...(rules.openMelds||[]).flatMap(m=>m.tiles)].filter(t=>t<27&&!(rules.ghost&&t===33)).map(t=>Math.floor(t/9)));
 if(suits.size<=1)return true;
 function pungs(w,pair,m){const i=c.findIndex(n=>n);if(i<0)return w===m*3+(pair?0:2);if(!pair){for(let n=Math.min(2,c[i]);n>=1;n--)if(2-n<=w){c[i]-=n;const ok=pungs(w-(2-n),true,m);c[i]+=n;if(ok)return true;}if(w>=2&&pungs(w-2,true,m))return true;}if(m){const n=Math.min(3,c[i]);if(3-n<=w){c[i]-=n;const ok=pungs(w-(3-n),pair,m-1);c[i]+=n;if(ok)return true;}}return false;}
 return !(rules.openMelds||[]).some(m=>m.type==='chow')&&pungs(wild,false,4-open);
}
// Standard hand shanten, -1 complete, 0 ready. Honors cannot form sequences.
export function shanten(tiles,open=0,sevenPairs=true){const c=counts(tiles);let best=8;
 function walk(start,m,p,t){if(m+open>4)return;let i=start;while(i<34&&!c[i])i++;if(i===34){best=Math.min(best,8-2*(m+open)-Math.min(t,4-m-open)-p);return;}
  if(c[i]>=3){c[i]-=3;walk(i,m+1,p,t);c[i]+=3;}
  if(i<27&&i%9<7&&c[i+1]&&c[i+2]){c[i]--;c[i+1]--;c[i+2]--;walk(i,m+1,p,t);c[i]++;c[i+1]++;c[i+2]++;}
  if(c[i]>=2){c[i]-=2;if(!p)walk(i,m,1,t);walk(i,m,p,t+1);c[i]+=2;}
  if(i<27&&i%9<8&&c[i+1]){c[i]--;c[i+1]--;walk(i,m,p,t+1);c[i]++;c[i+1]++;}
  if(i<27&&i%9<7&&c[i+2]){c[i]--;c[i+2]--;walk(i,m,p,t+1);c[i]++;c[i+2]++;}
  c[i]--;walk(i,m,p,t);c[i]++;
 }walk(0,0,0,0);
 if(open===0&&sevenPairs){const pairs=c.filter(n=>n>=2).length,unique=c.filter(n=>n>0).length;best=Math.min(best,6-pairs+Math.max(0,7-unique));}return best;}
export function seenCounts(s){return counts([...s.hand,...s.rivers.flat().filter(x=>!x.claimed).map(x=>x.tile),...s.melds.flat().flatMap(x=>x.tiles)]);}
export function atLeastOne(N,K,k){if(N<=0||K<=0||k<=0)return 0;k=Math.min(k,N);let miss=1;for(let j=0;j<k;j++)miss*=Math.max(0,N-K-j)/(N-j);return 1-miss;}
// With ghosts this is a ranking heuristic, not an exact shanten distance.
export function structure(hand,open,rules){const w=rules.ghost?hand.filter(t=>t===33).length:0;let v=shanten(rules.ghost?hand.filter(t=>t!==33):hand,open,rules.sevenPairs)-w;
 if(open===0&&rules.orphans){const ts=[0,8,9,17,18,26,27,28,29,30,31,32,33],c=counts(hand.filter(t=>!(rules.ghost&&t===33)));v=Math.min(v,13-ts.filter(t=>c[t]).length-(ts.some(t=>c[t]>=2)?1:0)-w);}return Math.max(-1,v);}
export function evaluate(hand,seen,open=0,rules={sevenPairs:true,orphans:true,ghost:true,chicken:true},k=4){const N=136-seen.reduce((a,b)=>a+b,0),base=structure(hand,open,rules);const waits=[],improves=[];
 for(let t=0;t<34;t++){const left=4-seen[t];if(left<=0)continue;const next=[...hand,t];if(isWinning(next,open,rules))waits.push({tile:t,left});if(structure(next,open,rules)<base)improves.push({tile:t,left});}
 const K=waits.reduce((s,x)=>s+x.left,0),I=improves.reduce((s,x)=>s+x.left,0);return {N,K,I,waits,improves,shanten:base,p:N?K/N:0,improveP:N?I/N:0,horizon:atLeastOne(N,K,k)};}
export function advice(s,k=4){const seen=seenCounts(s),open=s.melds[0].length;const activeRules={...s.rules,openMelds:s.melds[0]};if(s.phase==='discard'&&s.turn===0){return [...new Set(s.hand)].map(tile=>{const h=[...s.hand];h.splice(h.indexOf(tile),1);return {discard:tile,...evaluate(h,seen,open,activeRules,k)};}).sort((a,b)=>b.p-a.p||a.shanten-b.shanten||b.I-a.I||a.discard-b.discard);}return [{discard:null,...evaluate(s.hand,seen,open,activeRules,k)}];}
export function createGame(hand,rules={chow:true,sevenPairs:true,orphans:true,ghost:true,chicken:true}){if(hand.length!==14||counts(hand).some(n=>n>4))throw Error('起手需要14张牌，每种最多4张');return {version:VERSION,rules:{...rules},hand:[...hand].sort((a,b)=>a-b),hidden:[0,13,13,13],rivers:[[],[],[],[]],melds:[[],[],[],[]],turn:0,phase:'discard',wall:83,last:null,events:[]};}
export function applyEvent(state,event){const s=structuredClone(state);if(['kong','concealedKong','addedKong'].includes(event.type)&&s.wall===0)throw Error('牌墙已空，不能杠后补牌');if(s.phase==='ended')throw Error('牌局已结束');const {type,actor}=event;if(!Number.isInteger(actor)||actor<0||actor>3)throw Error('请选择牌手');
 const remove=(tiles)=>{if(actor===0){for(const t of tiles){const i=s.hand.indexOf(t);if(i<0)throw Error('手牌中没有所选牌');s.hand.splice(i,1);}}else{s.hidden[actor]-=tiles.length;if(s.hidden[actor]<0)throw Error('对手暗牌张数不足');}};
 const validTiles=tiles=>{counts(tiles);};
 if(type==='draw'){if(actor!==s.turn||s.phase!=='draw')throw Error('当前不能摸牌，请按轮次操作');if(s.wall<=0)throw Error('牌墙已空，请记录流局');s.wall--;if(actor===0){validTiles([event.tile]);s.hand.push(event.tile);}else s.hidden[actor]++;s.phase='discard';s.last=null;
 }else if(type==='discard'){if(actor!==s.turn||s.phase!=='discard')throw Error('当前不能舍牌');validTiles([event.tile]);remove([event.tile]);s.rivers[actor].push({tile:event.tile,claimed:false});s.last={actor,tile:event.tile,index:s.rivers[actor].length-1};s.turn=(actor+1)%4;s.phase='draw';
 }else if(type==='pong'||type==='chow'||type==='kong'){if(s.phase!=='draw'||!s.last||actor===s.last.actor)throw Error('只能鸣取刚舍出的牌');const need=type==='kong'?3:2,tiles=event.tiles||[];validTiles(tiles);if(tiles.length!==need)throw Error(`请选择自己拿出的${need}张牌`);const all=[...tiles,s.last.tile].sort((a,b)=>a-b);if(type==='chow'){if(!s.rules.chow)throw Error('当前规则禁止吃牌');if(actor!==(s.last.actor+1)%4||all[0]>=27||Math.floor(all[0]/9)!==Math.floor(all[2]/9)||all[1]!==all[0]+1||all[2]!==all[1]+1)throw Error('吃牌只限上家舍牌，且必须组成同花顺子');}else if(!all.every(t=>t===s.last.tile))throw Error('碰杠必须同一种牌');remove(tiles);s.rivers[s.last.actor][s.last.index].claimed=true;s.melds[actor].push({type,tiles:all});s.turn=actor;s.phase=type==='kong'?'draw':'discard';s.last=null;
 }else if(type==='concealedKong'){if(actor!==s.turn||s.phase!=='discard')throw Error('只能在自己摸牌后暗杠');validTiles([event.tile]);remove(Array(4).fill(event.tile));s.melds[actor].push({type,tiles:Array(4).fill(event.tile)});s.phase='draw';s.last=null;
 }else if(type==='addedKong'){if(actor!==s.turn||s.phase!=='discard')throw Error('只能在自己摸牌后补杠');validTiles([event.tile]);const m=s.melds[actor].find(x=>x.type==='pong'&&x.tiles[0]===event.tile);if(!m)throw Error('没有可升级的碰牌');remove([event.tile]);m.type='kong';m.tiles.push(event.tile);s.phase='draw';s.last=null;
 }else if(type==='win'){if(actor===0){const h=event.fromDiscard&&s.last?[...s.hand,s.last.tile]:s.hand;if(event.fromDiscard){if(!s.last||s.phase!=='draw'||s.last.actor===0)throw Error('没有可胡的舍牌');}else if(s.turn!==0||s.phase!=='discard')throw Error('当前不能自摸');if(!isWinning(h,s.melds[0].length,{...s.rules,openMelds:s.melds[0]})||(!s.rules.chicken&&s.melds[0].some(m=>m.type==='chow')&&new Set([...h,...s.melds[0].flatMap(m=>m.tiles)].filter(t=>t<27).map(t=>Math.floor(t/9))).size>1))throw Error('自己的手牌不符合当前胡牌规则');}else if(event.fromDiscard?(!s.last||s.last.actor===actor):!(actor===s.turn&&s.phase==='discard'))throw Error('当前不能记录该胡牌');s.phase='ended';
 }else if(type==='drawGame'){if(s.wall!==0||s.phase!=='draw')throw Error('牌墙未空或仍需舍牌');s.phase='ended';}else throw Error('未知操作');
 s.hand.sort((a,b)=>a-b);if(s.melds.some(ms=>ms.length>4))throw Error('副露不能超过四组');if(seenCounts(s).some(n=>n>4))throw Error('这张牌已超过4张，请核对记录');s.events.push(structuredClone(event));return s;}
export function replay(initial,events,rules){let s=createGame(initial,rules);for(const e of events)s=applyEvent(s,e);return s;}
export function seeded(seed=1){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function wilson(hits,n,z=1.959963984540054){if(!n)return [0,1];const p=hits/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,r=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [c-r,c+r];}
