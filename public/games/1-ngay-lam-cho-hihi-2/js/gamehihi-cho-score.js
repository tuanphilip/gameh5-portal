/* Một Ngày Làm Chó HiHi: chốt Điểm Quậy sau khi kết thúc ngày. */
(function(){
  'use strict';
  var cfg=window.GameHiHiDirectEventScoreConfig||null;
  var runId='',startedAt=0,ended=false,pending=null,sending=false;
  function newId(){
    var a=new Uint8Array(16);
    try{crypto.getRandomValues(a);}catch(e){for(var i=0;i<16;i++)a[i]=Math.floor(Math.random()*256);}
    return Array.from(a,function(x){return x.toString(16).padStart(2,'0');}).join('');
  }
  function num(x,max){return Math.min(max,Math.max(0,Math.floor(Number(x)||0)));}
  function notice(s,retry){
    var el=document.getElementById('gamehihiChoScoreStatus');if(!el)return;
    el.textContent=s;
    if(retry&&pending){
      var b=document.createElement('button');b.type='button';b.textContent='THỬ GỬI LẠI';
      b.style.cssText='display:inline-block;margin-left:8px;padding:6px 10px;border:0;border-radius:8px;background:#e63946;color:#fff;cursor:pointer';
      b.addEventListener('click',function(){send(pending);});el.appendChild(b);
    }
  }
  function send(p){
    if(!cfg||!cfg.enabled||!cfg.gameId||typeof window.GameHiHiEndGame!=='function')return;
    if(sending)return;
    sending=true;notice('Đang lưu Điểm Quậy lên BXH...',false);
    var key=p.meta.run_id;
    Promise.resolve().then(function(){return window.GameHiHiEndGame(p);}).then(function(r){
      if(key!==runId)return;
      pending=null;
      notice((r&&r.duplicate?'Lượt này đã được ghi':'Đã lưu Điểm Quậy')+': '+num(r&&r.score!=null?r.score:p.score,10000000).toLocaleString('vi-VN'),false);
    }).catch(function(err){
      if(key!==runId)return;
      var reason='Lỗi kết nối';
      try{reason=String((err&&err.data&&err.data.message)||err.message||reason).slice(0,130);}catch(e){}
      notice('Chưa lưu được điểm ('+reason+').',true);
    }).finally(function(){sending=false;});
  }
  window.GameHiHiChoHooks={
    start:function(){
      startedAt=Date.now();runId=newId();ended=false;pending=null;notice('',false);
      try{window.dispatchEvent(new Event('gamehihi:game-start'));}catch(e){}
    },
    finish:function(stats){
      if(ended)return;ended=true;stats=stats||{};
      var sc=num(stats.score,10000000);
      pending={score:sc,mode:'dog_mischief',result:'run_complete',meta:{
        run_id:runId||newId(),day:1,md_score:sc,breed:'beagle',
        end_reason:String(stats.reason||'time').slice(0,24),
        grade:String(stats.grade||'').slice(0,60),
        quests_done:num(stats.quests_done,1000),quests_total:num(stats.quests_total,1000),
        stealth:num(stats.stealth,1000),chaos:num(stats.chaos,1000),
        marks:num(stats.marks,10000),knocks:num(stats.knocks,10000),
        play_time_seconds:num(stats.elapsed_seconds||(startedAt?(Date.now()-startedAt)/1000:0),72000),
        score_rule:'completed_life_mischief_points'
      }};
      if(!runId)runId=pending.meta.run_id;
      send(pending);
    }
  };
})();
