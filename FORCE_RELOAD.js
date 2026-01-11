// ============================================================================
// FORCE RELOAD - À exécuter en console F12 AVANT les tests
// ============================================================================

console.log('%c🔄 FORÇAGE DU RECHARGEMENT DE LA PAGE', 'font-size: 18px; font-weight: bold; color: #FF6B6B; background: #f0f0f0; padding: 10px;');

console.log(`
ÉTAPES:
1. Exécute ce script en console F12
2. Appuie sur ENTRÉE
3. Attends le rechargement automatique (3-5 sec)
4. Ouvre F12 à nouveau
5. Relance: TEST_PROMPT5_VALIDATION.js
`);

// Option 1: Hard reload avec délai
console.log('\n⏳ Hard reload dans 2 secondes...');

setTimeout(() => {
  console.log('🔄 Reloading page with cache bypass...');
  
  // Méthode 1: Hard reload
  window.location.href = window.location.href + '?t=' + new Date().getTime();
  
  // Méthode 2: Forcer le rechargement sans cache
  location.reload(true);
}, 2000);

console.log('✅ Script lancé. La page va se recharger automatiquement...');
