/* ═══════════════════ ALÉA ═══════════════════
   Une seule source de hasard pour tout le jeu. Sans graine, elle vaut
   Math.random — rien ne change. Avec une graine, la même graine produit le
   même monde, les mêmes tirages, les mêmes matchs : c'est ce qui rend
   possible le défi hebdomadaire, où tout le monde joue la même carrière.

   Générateur : mulberry32 — court, rapide, distribution honnête, largement
   suffisant pour un jeu (pas pour de la cryptographie, et ce n'est pas le sujet). */
const Alea = (() => {
  let src = Math.random;
  let graineActive = null;

  function mulberry32(a){
    return function(){
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  /* Une chaîne devient un entier de graine (FNV-1a). */
  function hache(s){
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h;
  }
  function semer(graine){
    if (graine == null || graine === ''){ src = Math.random; graineActive = null; return; }
    graineActive = String(graine);
    src = mulberry32(hache(graineActive));
  }
  return {
    R: () => src(),
    semer,
    get graine(){ return graineActive; }
  };
})();
window.Alea = Alea;
