/* Copy this file into the Cloudflare R2 game ZIP. No API secrets required. */
(function(root){
  'use strict';
  function randomId(){
    var a=new Uint8Array(10),s='';
    if(root.crypto&&root.crypto.getRandomValues)root.crypto.getRandomValues(a);
    else for(var i=0;i<a.length;i++)a[i]=Math.floor(Math.random()*256);
    for(var j=0;j<a.length;j++)s+=('0'+a[j].toString(16)).slice(-2);
    return 'ghapi_'+s;
  }
  function GameHiHiAPI(options){
    options=options||{};
    if(!options.parentOrigin||!/^https:\/\//i.test(options.parentOrigin)){
      throw new Error('GameHiHiAPI requires an explicit HTTPS parentOrigin, e.g. https://gamehihi.com');
    }
    this.origin=new URL(options.parentOrigin).origin;
    this.pending={};this.connected=false;this.config=null;
    var self=this;
    root.addEventListener('message',function(e){
      if(e.source!==root.parent||e.origin!==self.origin||!e.data)return;
      var d=e.data;
      if(d.type==='gamehihi:api:init'){
        self.connected=true;self.config=d.payload;
        root.dispatchEvent(new CustomEvent('gamehihi:api-ready',{detail:d.payload}));return;
      }
      if(d.type!=='gamehihi:api:response')return;
      var item=self.pending[d.requestId];if(!item)return;
      delete self.pending[d.requestId];
      if(d.payload&&d.payload.ok)item.resolve(d.payload.data);
      else item.reject(new Error(d.payload&&d.payload.error?d.payload.error.message:'API error'));
    });
    if(root.parent!==root){
      function ready(){root.parent.postMessage({type:'gamehihi:api:ready',requestId:randomId()},self.origin);}
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
      root.addEventListener('load',ready,{once:true});
    }
  }
  GameHiHiAPI.prototype.send=function(action,payload){
    if(root.parent===root)return Promise.reject(new Error('Game phải chạy trong iframe WordPress.'));
    var self=this,requestId=randomId();
    return new Promise(function(resolve,reject){
      var timeout=setTimeout(function(){delete self.pending[requestId];reject(new Error('GameHiHi API không phản hồi trong 20 giây.'));},20000);
      self.pending[requestId]={resolve:function(r){clearTimeout(timeout);resolve(r);},reject:function(e){clearTimeout(timeout);reject(e);}};
      root.parent.postMessage({type:'gamehihi:api:'+action,requestId:requestId,payload:payload||{}},self.origin);
      // Retry the same runId after network errors to avoid creating duplicate attempts.
    });
  };
  GameHiHiAPI.prototype.endGame=function(input){return this.send('end-game',input||{});};
  GameHiHiAPI.prototype.score=function(score,mode,meta){return this.send('score',{score:score,mode:mode||'',meta:meta||{}});};
  GameHiHiAPI.prototype.track=function(eventName,meta,score){return this.send('event',{eventName:eventName,meta:meta||{},score:score||0});};
  GameHiHiAPI.prototype.myScore=function(period){return this.send('me',{period:period||'all'});};
  GameHiHiAPI.prototype.leaderboard=function(){return this.send('leaderboard',{});};
  root.GameHiHiAPI=GameHiHiAPI;
})(window);
