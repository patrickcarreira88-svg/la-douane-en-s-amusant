// ═════════════════════════════════════════════════════════════
// TEST jsPDF LOADING
// ═════════════════════════════════════════════════════════════

// Exécuter dans la console du navigateur après que la page soit chargée

console.log('%c🧪 TEST jsPDF LOADING', 'color: #7c3aed; font-size: 14px; font-weight: bold;');

// Vérifier toutes les façons d'accéder à jsPDF
console.log('');
console.log('window.jspdf:', window.jspdf);
console.log('window.jsPDF:', window.jsPDF);

if (window.jspdf) {
  console.log('window.jspdf.jsPDF:', window.jspdf.jsPDF);
}

// Vérifier le contenu de window.jspdf
if (window.jspdf) {
  console.log('Contenu de window.jspdf:', Object.keys(window.jspdf));
}

// Test de création d'un PDF
console.log('');
console.log('🧪 Test création PDF:');

try {
  let JsPDFClass;
  
  if (window.jspdf && window.jspdf.jsPDF) {
    console.log('✅ Trouvé: window.jspdf.jsPDF');
    JsPDFClass = window.jspdf.jsPDF;
  } else if (window.jsPDF) {
    console.log('✅ Trouvé: window.jsPDF');
    JsPDFClass = window.jsPDF;
  } else {
    throw new Error('jsPDF not found!');
  }
  
  const doc = new JsPDFClass();
  console.log('✅ PDF créé avec succès:', doc);
  
  // Essayer de générer un petit PDF test
  doc.text('Test jsPDF', 10, 10);
  console.log('✅ Texte ajouté');
  
  const pdfData = doc.output('dataurlstring');
  console.log('✅ PDF data URL généré:', pdfData.substring(0, 50) + '...');
  
} catch (error) {
  console.log('❌ Erreur:', error.message);
}
