/* HIHI Trap Run -> GameHiHi Event Score / GA4 Master (WordPress v2.0.77).
   Normal-mode level clears only; score = highest completed level (1..40).
   Daily and Speedrun remain playable and GA4-tracked, but don't create leaderboard score.
   Never send raw player data to GA4. */
(function(){
  'use strict';
  var previous=window.onHiHiEvent;
  var sent=new Set();
  function status(message){
    var el=document.getElementById('gamehihi-score-status');
    if(el)el.textContent=message||'';
  }
  function int(v,lo,hi){
    var n=Number(v);
    return Number.isFinite(n)?Math.max(lo,Math.min(hi,Math.floor(n))):lo;
  }
  function ga4(event,params){
    var api=window.GameHiHiGA4;
    if(api && typeof api.send==='function') api.send(event,params||{});
  }
  function onEvent(name,ev){
    ev=ev||{};
    var mode=String(ev.mode||'normal').slice(0,16);
    var level=int(ev.level_id,0,40);
    var deaths=int(ev.death_count,0,100000);
    var duration=Number(ev.completion_time||ev.play_time)||0;
    duration=Number.isFinite(duration)?Math.max(0,Math.min(36000,duration)):0;
    var details={level_id:level,mode:mode,death_count:deaths,completion_time_seconds:Number(duration.toFixed(2))};

    if(name==='game_start'){
      if(window.GameHiHiGA4 && window.GameHiHiGA4.start)window.GameHiHiGA4.start('native_game_start');
      // The plugin already emits game_start once per session. Don't duplicate it.
      return;
    }
    if(name==='level_start'){
      ga4('level_start',{level_id:level,mode:mode});
      status('');
      return;
    }
    if(name==='player_death' || name==='level_retry'){
      ga4(name,{level_id:level,mode:mode,death_count:deaths});
      return;
    }
    if(name==='game_over'){
      ga4('trap_run_game_over',{level_id:level,mode:mode,reason:String(ev.reason||'').slice(0,30),death_count:deaths});
      if(ev.reason==='speedrun_complete'||ev.reason==='quit'){
        ga4('game_end',{mode:mode,result:String(ev.reason).slice(0,30),score:0,play_time_seconds:int(ev.play_time,0,36000)});
      }
      return;
    }
    if(name!=='level_complete')return;
    ga4('level_complete',details);
    if(mode!=='normal'||level<1||level>40)return;
    var key='normal:'+level;
    if(sent.has(key))return;
    var cfg=window.GameHiHiDirectEventScoreConfig||{};
    if(!cfg.enabled){status('Hoàn thành màn '+level+' · BXH sự kiện chưa bật');return;}
    if(typeof window.GameHiHiEndGame!=='function'){
      status('Chưa kết nối được hệ thống điểm.');return;
    }
    sent.add(key);
    var par=null;
    try{
      var defs=window.HH&&window.HH.LEVELS;
      par=defs&&defs.find(function(o){return o.id===level;});
    }catch(e){}
    var stars=1 + (par&&deaths<=par.par.d?1:0) + (par&&duration<=par.par.t?1:0);
    status('Đang lưu điểm màn '+level+'...');
    var payload={score:level,mode:'level_progress',result:'complete',meta:{
      level_id:level,death_count:deaths,completion_time_ms:int(Math.round(duration*1000),0,36000000),stars:stars
    }};
    Promise.resolve(window.GameHiHiEndGame(payload)).then(function(result){
      if(result && (result.saved || result.duplicate)) {
        status('✅ Điểm BXH: '+int(result.best_score,0,40)+'/40'+(result.duplicate?' · đã ghi nhận trước đó':''));
      } else {
        status('Không có điểm mới · Màn '+level);
      }
    }).catch(function(err){
      sent.delete(key);
      status('⚠️ Chưa lưu được điểm. Có thể chơi lại màn để thử lại.');
      if(window.console&&console.warn)console.warn('[HIHI Trap Run] point save failed',err);
    });
  }
  window.onHiHiEvent=function(name,ev){
    if(typeof previous==='function'){
      try{previous(name,ev);}catch(e){if(console&&console.warn)console.warn(e);}
    }
    try{onEvent(name,ev);}catch(e){if(console&&console.warn)console.warn('[HIHI Trap Run] bridge',e);}
  };
})();
