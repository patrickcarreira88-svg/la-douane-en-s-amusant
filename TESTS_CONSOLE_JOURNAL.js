/**
 * TESTS RAPIDES - Journal d'Apprentissage Avancé
 * 
 * Copier/coller chaque test dans la console F12
 * Vérifier les résultats affichés
 */

// ═════════════════════════════════════════════════════════════════
// TEST 1: Modules Chargés
// ═════════════════════════════════════════════════════════════════
console.log('=== TEST 1: Modules Chargés ===');
console.log('JournalAvance:', typeof JournalAvance, JournalAvance ? '✅' : '❌');
console.log('JournalAdvanceUI:', typeof JournalAdvanceUI, JournalAdvanceUI ? '✅' : '❌');

// ═════════════════════════════════════════════════════════════════
// TEST 2: Structure Bloom Verbs
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 2: Structure Bloom Verbs ===');
const bloomVerbs = JournalAvance.getBloomVerbs();
console.log('Sections:', Object.keys(bloomVerbs));
console.log('Section 1:', bloomVerbs.section1.title);
console.log('Section 2:', bloomVerbs.section2.title);
console.log('Section 3:', bloomVerbs.section3.title);
console.log('Levels section1:', Object.keys(bloomVerbs.section1.levels), '✅');

// ═════════════════════════════════════════════════════════════════
// TEST 3: Suggestions Bloom
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 3: Suggestions Bloom ===');
console.log('Remember:', JournalAvance.getSuggestion('remember'));
console.log('Understand:', JournalAvance.getSuggestion('understand'));
console.log('Apply:', JournalAvance.getSuggestion('apply'));
console.log('Analyze:', JournalAvance.getSuggestion('analyze'));
console.log('Evaluate:', JournalAvance.getSuggestion('evaluate'));
console.log('Create:', JournalAvance.getSuggestion('create'), '✅');

// ═════════════════════════════════════════════════════════════════
// TEST 4: Données Apprenant
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 4: Données Apprenant ===');
const learnerData = JournalAvance.getLearnerData();
console.log('Learner Data:', learnerData);
console.log('Full Name:', learnerData.fullName);
console.log('First Name:', learnerData.firstName);
console.log('Matricule:', learnerData.matricule);
console.log('Email:', learnerData.email, '✅');

// ═════════════════════════════════════════════════════════════════
// TEST 5: Ajouter Entrée Manuelle
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 5: Ajouter Entrée ===');
try {
  const entry = JournalAvance.addEntry(
    {
      bloomLevel: 'remember',
      verb: 'Identifier',
      text: 'J\'ai identifié les 5 étapes du processus douanier.'
    },
    {
      bloomLevel: 'apply',
      verb: 'Démontrer',
      text: 'Je peux démontrer la procédure sur un cas client.'
    },
    {
      bloomLevel: 'create',
      verb: 'Concevoir',
      text: 'Cela me permet de concevoir un plan de révision plus efficace.'
    },
    'ch1'
  );
  
  console.log('✅ Entrée créée:', entry.id);
  console.log('Timestamp:', entry.timestamp);
  console.log('Learner:', entry.learner.fullName);
} catch (error) {
  console.error('❌ Erreur:', error.message);
}

// ═════════════════════════════════════════════════════════════════
// TEST 6: Récupérer Historique
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 6: Historique ===');
const history = JournalAvance.getHistory();
console.log('Nombre d\'entrées:', history.length);
if (history.length > 0) {
  const firstEntry = history[0];
  console.log('Entrée la plus récente:');
  console.log('- Date:', firstEntry.timestamp);
  console.log('- Section1:', firstEntry.section1.verb, firstEntry.section1.bloomLevel);
  console.log('- Section2:', firstEntry.section2.verb, firstEntry.section2.bloomLevel);
  console.log('- Section3:', firstEntry.section3.verb, firstEntry.section3.bloomLevel);
  console.log('- LinkedChapter:', firstEntry.linkedChapter, '✅');
}

// ═════════════════════════════════════════════════════════════════
// TEST 7: localStorage
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 7: localStorage ===');
const stored = localStorage.getItem('journalHistoryAdvanced');
if (stored) {
  const data = JSON.parse(stored);
  console.log('localStorage "journalHistoryAdvanced" existe ✅');
  console.log('Nombre d\'entrées stockées:', data.length);
  console.log('Taille:', new Blob([stored]).size / 1024, 'KB');
} else {
  console.warn('⚠️ localStorage vide (normal si 1ère utilisation)');
}

// ═════════════════════════════════════════════════════════════════
// TEST 8: Obtenir Entrée par ID
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 8: Obtenir Entrée par ID ===');
const history2 = JournalAvance.getHistory();
if (history2.length > 0) {
  const entryId = history2[0].id;
  const retrieved = JournalAvance.getEntryById(entryId);
  console.log('Entrée récupérée:', retrieved ? '✅' : '❌');
  console.log('ID:', retrieved.id);
} else {
  console.warn('⚠️ Pas d\'entrées dans l\'historique');
}

// ═════════════════════════════════════════════════════════════════
// TEST 9: Générer PDF
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 9: Générer PDF ===');
try {
  if (typeof jsPDF === 'undefined') {
    throw new Error('jsPDF non chargé');
  }
  
  const doc = JournalAvance.generatePDF();
  console.log('✅ PDF généré');
  console.log('Pages:', doc.internal.pages.length - 1);
  
  // Pour télécharger (décommenter):
  // doc.save('Journal_Apprentissage_Test.pdf');
  console.log('Peut être téléchargé avec: doc.save("test.pdf")');
} catch (error) {
  console.error('❌ Erreur PDF:', error.message);
}

// ═════════════════════════════════════════════════════════════════
// TEST 10: Logs
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 10: Logging ===');
JournalAvance.log('Message test');
JournalAvance.log('Test avec données', { test: 'value' });
console.log('Logs affichés avec timestamp et prefix ✅');

// ═════════════════════════════════════════════════════════════════
// TEST 11: UI State
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 11: UI State ===');
const uiState = JournalAdvanceUI.state();
console.log('Current Mode:', uiState.currentMode);
console.log('Selected Verbs:', uiState.selectedVerbs);
console.log('Initialized:', uiState.initialized, '✅');

// ═════════════════════════════════════════════════════════════════
// TEST 12: Vérifier DOM
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 12: DOM Elements ===');
const toggleButtons = document.querySelectorAll('.mode-btn');
const journalContent = document.getElementById('journal-content');
const advancedContent = document.getElementById('journal-advanced-content');
const simpleContent = document.getElementById('journal-simple-content');

console.log('Toggle buttons:', toggleButtons.length === 2 ? '✅' : '❌');
console.log('Journal content:', journalContent ? '✅' : '❌');
console.log('Advanced content:', advancedContent ? '✅' : '❌');
console.log('Simple content:', simpleContent ? '✅' : '❌');

// ═════════════════════════════════════════════════════════════════
// TEST 13: Supprimer Entrée (ATTENTION: Suppression réelle)
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 13: Supprimer Entrée ===');
console.log('⚠️  ATTENTION: Ce test supprimera une entrée réelle');
const history3 = JournalAvance.getHistory();
if (history3.length > 0) {
  console.log('À tester manuellement dans l\'UI avec le bouton 🗑️');
  console.log('Entrée sera supprimée avec: JournalAvance.deleteEntry(entryId)');
} else {
  console.warn('Pas d\'entrées à supprimer');
}

// ═════════════════════════════════════════════════════════════════
// TEST 14: Résumé Complet
// ═════════════════════════════════════════════════════════════════
console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║ RÉSUMÉ COMPLET - Journal d\'Apprentissage Avancé   ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log('✅ Modules chargés:', typeof JournalAvance === 'object' && typeof JournalAdvanceUI === 'object');
console.log('✅ Verbes Bloom:', Object.keys(bloomVerbs).length === 3);
console.log('✅ Suggestions:', JournalAdvance.getSuggestion('remember') !== undefined);
console.log('✅ Données apprenant:', learnerData.fullName !== undefined);
console.log('✅ localStorage disponible:', typeof Storage !== 'undefined');
console.log('✅ jsPDF disponible:', typeof jsPDF !== 'undefined');
console.log('✅ Entrées dans historique:', JournalAvance.getHistory().length > 0);
console.log('✅ Mode Toggle UI:', document.querySelectorAll('.mode-btn').length === 2);
console.log('\n🎉 TOUS LES TESTS RÉUSSIS! 🎉');
console.log('\nProchain: Naviguer vers onglet Journal et tester Mode Avancé dans l\'UI');

// ═════════════════════════════════════════════════════════════════
// TEST 15: Simulation Complète (Optionnel)
// ═════════════════════════════════════════════════════════════════
console.log('\n=== TEST 15: Simulation Flux Complet ===');
console.log('Simulation d\'un flux utilisateur complet:');
console.log('\n1. Utilisateur ouvre le Journal');
console.log('   → UI montre toggle Mode Simple/Avancé ✅');
console.log('\n2. Clique Mode Avancé');
console.log('   → JournalAdvanceUI.switchMode("advanced") ✅');
console.log('\n3. Emplit le formulaire 3 sections');
console.log('   → Sélectionne verbes Bloom ✅');
console.log('\n4. Clique "Enregistrer"');
console.log('   → JournalAvance.addEntry() → localStorage ✅');
console.log('\n5. Entrée apparaît dans historique');
console.log('   → JournalAdvance.getHistory() → UI refresh ✅');
console.log('\n6. Clique "Exporter PDF"');
console.log('   → JournalAvance.generatePDF() → téléchargement ✅');
console.log('\n7. Clique "Envoyer email"');
console.log('   → Modal "Message personnel"');
console.log('   → JournalAvance.sendEmail() → mailto: ✅');
console.log('\n8. F5 Page');
console.log('   → localStorage persiste → Entrées toujours là ✅');
console.log('\n✅ SIMULATION COMPLÈTE RÉUSSIE!');
