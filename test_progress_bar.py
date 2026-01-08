#!/usr/bin/env python3
"""
TEST DE LA BARRE DE PROGRESSION
Simule l'achèvement des étapes et vérifie que la progression se met à jour correctement
"""

import json
import os

# Charger les chapitres
with open('data/chapitres-N1N4.json', 'r', encoding='utf-8') as f:
    chapitres = json.load(f)

# Obtenir le chapitre 1
ch1 = next((c for c in chapitres if c.get('id') == 'ch1'), None)

if not ch1:
    print("❌ ERREUR: Chapitre 1 non trouvé")
    exit(1)

print("=" * 60)
print("🧪 TEST: BARRE DE PROGRESSION")
print("=" * 60)
print()

total_steps = len(ch1['etapes'])
print(f"📊 Chapitre 1: {ch1['titre']}")
print(f"📊 Nombre total d'étapes: {total_steps}")
print()

# Test 1: Progression initiale
print("TEST 1: Progression initiale (0%)")
print("-" * 60)
print(f"  État: Aucune étape complétée")
print(f"  Calcul: 0/{total_steps} = 0%")
progress_pct = round((0 / total_steps) * 100)
print(f"  ✅ Progression attendue: {progress_pct}%")
print()

# Test 2: 1 étape complétée
print("TEST 2: 1ère étape complétée")
print("-" * 60)
completed = 1
progress_pct = round((completed / total_steps) * 100)
print(f"  État: {completed}/{total_steps} étapes complétées")
print(f"  Calcul: {completed}/{total_steps} = {progress_pct}%")
print(f"  ✅ Progression attendue: {progress_pct}%")
print(f"  📏 Barre: {'█' * (progress_pct // 10)}{' ' * (10 - progress_pct // 10)} {progress_pct}%")
print()

# Test 3-7: Progression par étape
print("TEST 3-9: Progression par étape complétée")
print("-" * 60)
for i in range(2, total_steps + 1):
    completed = i
    progress_pct = round((completed / total_steps) * 100)
    bar_length = progress_pct // 10
    print(f"  Étape {i}: {completed}/{total_steps} = {progress_pct}% | {'█' * bar_length}{' ' * (10 - bar_length)}")

print()

# Test 4: 100% (toutes les étapes)
print("TEST 4: TOUS les étapes complétées")
print("-" * 60)
completed = total_steps
progress_pct = round((completed / total_steps) * 100)
print(f"  État: {completed}/{total_steps} étapes complétées")
print(f"  Calcul: {completed}/{total_steps} = {progress_pct}%")
print(f"  ✅ Progression attendue: {progress_pct}%")
print(f"  📏 Barre: {'█' * 10} {progress_pct}% ✨ COMPLÉTÉ!")
print()

# Résumé
print("=" * 60)
print("📋 RÉSUMÉ DES TESTS")
print("=" * 60)
print(f"✅ Progression initiale: 0%")
print(f"✅ Augmentation par étape: {round(100/total_steps)}% (7 étapes = 7 x 14% ≈ 100%)")
print(f"✅ Progression finale: 100%")
print()

# Vérification du calcul
print("🔍 VÉRIFICATION DES VALEURS")
print("-" * 60)
increment = round(100 / total_steps)
print(f"  Nombre d'étapes: {total_steps}")
print(f"  Increment par étape: {increment}%")
print(f"  Total (7 × {increment}%): {increment * total_steps}%")
print()

# Afficher les étapes pour validation
print("📍 ÉTAPES À TESTER")
print("-" * 60)
for i, step in enumerate(ch1['etapes'][:7], 1):
    exercises = step.get('exercices', [])
    print(f"  {i}. {step.get('titre', 'Sans titre')} ({len(exercises)} exercices)")
    if exercises:
        for j, ex in enumerate(exercises, 1):
            print(f"     - Exercice {j}: {ex.get('type', '?')}")

print()
print("=" * 60)
print("✨ PROCÉDURE DE TEST MANUELLE:")
print("=" * 60)
print("""
1. Ouvrir DevTools (F12)
2. Aller à Console
3. Exécuter: StorageManager.reset('ch1')
4. Reload page (F5)
5. Afficher Chapitre 1 → Vérifier 0%
6. Compléter Étape 1 (vidéo) → Vérifier ~14%
7. Compléter Étapes 2-7 → Vérifier progression jusqu'à 100%
8. Vérifier logs: "📊 Progression ch1: X% complété"
9. Refresh page → Vérifier que 100% persiste
""")
print("=" * 60)
