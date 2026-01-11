#!/usr/bin/env python3
"""
Test de la logique validateAndCleanStorage()
Simule la détection de données corrompues dans localStorage
"""

# Simule une situation où tous les steps sont marqués comme complétés
def simulate_corrupted_storage():
    """Simule localStorage corrompu avec tous les steps complétés"""
    chapitres_etapes = {
        'ch1': {
            'titre': 'Introduction à la',
            'etapes_count': 7,
            'etapes': [
                {'id': 'ch1_step1', 'type': 'video'},
                {'id': 'ch1_step2', 'type': 'exercice'},
                {'id': 'ch1_step3', 'type': 'qcm'},
                {'id': 'ch1_step4', 'type': 'video'},
                {'id': 'ch1_step5', 'type': 'exercice'},
                {'id': 'ch1_step6', 'type': 'quiz'},
                {'id': 'ch1_step7', 'type': 'portfolio'},
            ]
        }
    }
    
    # localStorage actuel (corrompu): tous complétés=true
    storage = {}
    for etape in chapitres_etapes['ch1']['etapes']:
        storage[f"step_{etape['id']}"] = {
            'id': etape['id'],
            'completed': True,  # ❌ Tous marqués TRUE (corruption!)
            'points': 10,
            'maxPoints': 10,
            'timestamp': '2024-01-15T10:00:00',
            'attempts': 1,
            'lastAttempt': '2024-01-15T10:00:00'
        }
    
    return chapitres_etapes['ch1'], storage


def validate_and_clean_storage(chapitre, storage):
    """
    Logique de validation mimant validateAndCleanStorage()
    
    Détecte si >60% des steps sont marqués comme complétés
    Si oui, réinitialise tous les steps à completed=false
    """
    completed_count = 0
    suspicious_steps = []
    
    for i, etape in enumerate(chapitre['etapes']):
        step_key = f"step_{etape['id']}"
        if step_key in storage:
            if storage[step_key]['completed'] is True:
                completed_count += 1
                suspicious_steps.append({
                    'id': etape['id'],
                    'type': etape['type'],
                    'index': i
                })
    
    suspicious_ratio = completed_count / len(chapitre['etapes'])
    
    print(f"📊 ANALYSE:")
    print(f"   - Steps complétés: {completed_count}/{len(chapitre['etapes'])}")
    print(f"   - Ratio: {suspicious_ratio * 100:.0f}%")
    print(f"   - Seuil suspect: 60%")
    print()
    
    if suspicious_ratio > 0.6:
        print(f"⚠️  DÉTECTION: Données corrompues détectées!")
        print(f"   - Réinitialisant tous les steps pour {chapitre['titre']}...")
        print()
        
        # Nettoyer tous les steps
        for etape in chapitre['etapes']:
            step_key = f"step_{etape['id']}"
            storage[step_key]['completed'] = False  # RESET
        
        print(f"✅ localStorage nettoyé")
        return True, storage
    else:
        print(f"✅ Données valides - aucun nettoyage nécessaire")
        return False, storage


def test_before_and_after():
    """Test avant et après nettoyage"""
    chapitre, corrupted_storage = simulate_corrupted_storage()
    
    print("=" * 60)
    print("TEST: Validation et Nettoyage localStorage")
    print("=" * 60)
    print()
    
    # AVANT
    print("📌 ÉTAT AVANT:")
    print("-" * 60)
    completed_before = sum(1 for v in corrupted_storage.values() if v['completed'])
    print(f"   Steps complétés: {completed_before}/{len(chapitre['etapes'])}")
    for key, data in corrupted_storage.items():
        status = "✅" if data['completed'] else "⏳"
        print(f"   {status} {key}: completed={data['completed']}")
    print()
    
    # VALIDATION
    print("🔍 VALIDATION:")
    print("-" * 60)
    was_cleaned, cleaned_storage = validate_and_clean_storage(chapitre, corrupted_storage)
    print()
    
    # APRÈS
    print("📌 ÉTAT APRÈS:")
    print("-" * 60)
    completed_after = sum(1 for v in cleaned_storage.values() if v['completed'])
    print(f"   Steps complétés: {completed_after}/{len(chapitre['etapes'])}")
    for key, data in cleaned_storage.items():
        status = "✅" if data['completed'] else "⏳"
        print(f"   {status} {key}: completed={data['completed']}")
    print()
    
    print("=" * 60)
    if was_cleaned:
        print("✨ RÉSULTAT: Données corrompues détectées ET nettoyées!")
        print("   → Les utilisateurs verront tous les steps comme incomplets")
    else:
        print("✨ RÉSULTAT: Données valides - aucun problème détecté")
    print("=" * 60)


if __name__ == '__main__':
    test_before_and_after()
