// ═════════════════════════════════════════════════════════════
// SCRIPT DE TEST - À EXÉCUTER DANS LA CONSOLE NAVIGATEUR (F12)
// ═════════════════════════════════════════════════════════════

console.log('%c🧪 TEST JOURNAL AVANCÉ BLOOM', 'color: #7c3aed; font-size: 14px; font-weight: bold;');

// Test 1: Vérifier que les modules sont chargés
console.log('');
console.log('%c1️⃣ Vérification des modules', 'color: #7c3aed; font-weight: bold;');

if (typeof JournalAvance !== 'undefined') {
  console.log('✅ JournalAvance.js chargé');
} else {
  console.log('❌ JournalAvance.js NOT loaded');
}

if (typeof JournalAdvanceUI !== 'undefined') {
  console.log('✅ JournalAdvanceUI.js chargé');
} else {
  console.log('❌ JournalAdvanceUI.js NOT loaded');
}

// Test 2: Vérifier l'initialisation
console.log('');
console.log('%c2️⃣ État des modules', 'color: #7c3aed; font-weight: bold;');

if (typeof JournalAvance !== 'undefined') {
  const state = JournalAvance.state();
  console.log(`JournalAvance initialized: ${state.initialized}`);
  console.log(`Entries count: ${state.entries.length}`);
  
  if (state.entries.length > 0) {
    console.log('🎉 Entries trouvées!');
    console.log('Première entrée:', state.entries[0]);
  } else {
    console.log('ℹ️ Aucune entrée pour le moment');
  }
}

// Test 3: Vérifier les verbes Bloom
console.log('');
console.log('%c3️⃣ Verbes Bloom', 'color: #7c3aed; font-weight: bold;');

if (typeof JournalAvance !== 'undefined') {
  const bloomVerbs = JournalAvance.getBloomVerbs();
  
  console.log('Section 1 - Qu\'ai-je appris ?');
  Object.entries(bloomVerbs.section1.levels).forEach(([level, data]) => {
    console.log(`  ${data.label}: ${data.verbs.join(', ')}`);
  });
  
  console.log('Section 2 - Comment l\'appliquer ?');
  Object.entries(bloomVerbs.section2.levels).forEach(([level, data]) => {
    console.log(`  ${data.label}: ${data.verbs.join(', ')}`);
  });
  
  console.log('Section 3 - Quel impact personnel ?');
  Object.entries(bloomVerbs.section3.levels).forEach(([level, data]) => {
    console.log(`  ${data.label}: ${data.verbs.join(', ')}`);
  });
}

// Test 4: Vérifier le localStorage
console.log('');
console.log('%c4️⃣ LocalStorage', 'color: #7c3aed; font-weight: bold;');

const journalHistory = localStorage.getItem('journalHistoryAdvanced');
if (journalHistory) {
  const entries = JSON.parse(journalHistory);
  console.log(`✅ journalHistoryAdvanced trouvé (${entries.length} entrées)`);
  if (entries.length > 0) {
    console.log('Dernière entrée:', entries[0]);
  }
} else {
  console.log('ℹ️ journalHistoryAdvanced: vide');
}

const userProfileStr = localStorage.getItem('douanelmsv2');
if (userProfileStr) {
  const userProfile = JSON.parse(userProfileStr);
  console.log('✅ douanelmsv2 trouvé');
  console.log(`   Nom: ${userProfile.user?.nom || 'N/A'}`);
  console.log(`   Prenom: ${userProfile.user?.prenom || 'N/A'}`);
  console.log(`   Matricule: ${userProfile.user?.matricule || 'N/A'}`);
  console.log(`   Email: ${userProfile.user?.email || 'N/A'}`);
} else {
  console.log('ℹ️ douanelmsv2: pas créé');
}

// Test 5: Vérifier les données apprenant
console.log('');
console.log('%c5️⃣ Données Apprenant', 'color: #7c3aed; font-weight: bold;');

if (typeof JournalAvance !== 'undefined') {
  const learnerData = JournalAvance.getLearnerData();
  console.log('Données apprenant:', learnerData);
}

// Test 6: Suggestions Bloom
console.log('');
console.log('%c6️⃣ Suggestions Bloom', 'color: #7c3aed; font-weight: bold;');

if (typeof JournalAvance !== 'undefined') {
  console.log('remember:', JournalAvance.getSuggestion('remember'));
  console.log('understand:', JournalAvance.getSuggestion('understand'));
  console.log('apply:', JournalAvance.getSuggestion('apply'));
  console.log('analyze:', JournalAvance.getSuggestion('analyze'));
  console.log('evaluate:', JournalAvance.getSuggestion('evaluate'));
  console.log('create:', JournalAvance.getSuggestion('create'));
}

// Test 7: Ajouter une entrée de test
console.log('');
console.log('%c7️⃣ Ajouter une entrée de test', 'color: #7c3aed; font-weight: bold;');

if (typeof JournalAvance !== 'undefined') {
  try {
    const testEntry = JournalAvance.addEntry(
      {
        bloomLevel: 'remember',
        verb: 'J\'ai identifié',
        text: 'J\'ai identifié les 5 étapes du processus douanier.'
      },
      {
        bloomLevel: 'apply',
        verb: 'J\'ai appliqué',
        text: 'J\'ai appliqué la procédure sur un cas client pratique.'
      },
      {
        bloomLevel: 'create',
        verb: 'J\'ai créé',
        text: 'J\'ai créé un plan de révision basé sur les techniques apprises.'
      },
      null
    );
    
    console.log('✅ Entrée ajoutée avec succès!');
    console.log('ID:', testEntry.id);
    console.log('Entrée complète:', testEntry);
  } catch (error) {
    console.log('❌ Erreur lors de l\'ajout:', error.message);
  }
}

console.log('');
console.log('%c✨ Tests terminés!', 'color: #7c3aed; font-size: 14px; font-weight: bold;');
console.log('Consultez le journal en accédant à l\'onglet 📔 Journal -> 🌟 Mode Avancé');

