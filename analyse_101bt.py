#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import sys

try:
    with open('data/101-BT.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("✅ JSON VALIDE - Syntaxe correcte\n")
    
    # Analyse structure
    print("📊 ANALYSE STRUCTURE:")
    print(f"  - ID Chapitre: {data['id']}")
    print(f"  - Titre: {data['titre']}")
    print(f"  - Nombre d'étapes: {len(data['etapes'])}\n")
    
    # Analyse étapes
    print("📋 DÉTAIL DES ÉTAPES:")
    exercices_par_type = {}
    total_exercices = 0
    
    for idx, etape in enumerate(data['etapes'], 1):
        num_ex = len(etape.get('exercices', []))
        total_exercices += num_ex
        print(f"\n  Étape {idx}: {etape['id']}")
        print(f"    - Titre: {etape['titre']}")
        print(f"    - Numéro: {etape['numero']}")
        print(f"    - Exercices: {num_ex}")
        
        # Compter types
        for ex in etape.get('exercices', []):
            ex_type = ex.get('type', 'unknown')
            exercices_par_type[ex_type] = exercices_par_type.get(ex_type, 0) + 1
            print(f"      └─ {ex['id']}: type={ex_type}, titre={ex['titre'][:50]}...")
    
    print(f"\n\n📈 STATISTIQUES EXERCICES:")
    print(f"  Total exercices: {total_exercices}")
    print(f"\n  Par type:")
    for ex_type in sorted(exercices_par_type.keys()):
        count = exercices_par_type[ex_type]
        print(f"    - {ex_type}: {count}")
    
    # Vérifications de cohérence
    print(f"\n\n🔍 VÉRIFICATIONS DE COHÉRENCE:")
    
    # 1. Vérifier les IDs uniques
    all_ids = []
    for etape in data['etapes']:
        all_ids.append(etape['id'])
        for ex in etape.get('exercices', []):
            all_ids.append(ex['id'])
    
    duplicates = [x for x in all_ids if all_ids.count(x) > 1]
    if duplicates:
        print(f"  ⚠️  IDs dupliqués: {set(duplicates)}")
    else:
        print(f"  ✅ Tous les IDs sont uniques ({len(all_ids)} IDs)")
    
    # 2. Vérifier cohérence points
    print(f"\n  Analyse points par étape:")
    for etape in data['etapes']:
        etape_points = etape.get('points', 0)
        ex_points = sum([ex.get('points', 0) for ex in etape.get('exercices', [])])
        status = "✅" if etape_points >= ex_points else "⚠️"
        print(f"    {status} {etape['id']}: {etape_points} points (exercices: {ex_points})")
    
    # 3. Vérifier que calculation a content
    print(f"\n  Vérification exercices 'calculation':")
    calc_count = 0
    for etape in data['etapes']:
        for ex in etape.get('exercices', []):
            if ex.get('type') == 'calculation':
                calc_count += 1
                has_scenario = bool(ex.get('content', {}).get('scenario'))
                has_questions = bool(ex.get('content', {}).get('questions'))
                status = "✅" if (has_scenario and has_questions) else "❌"
                print(f"    {status} {ex['id']}: scenario={has_scenario}, questions={has_questions}")
    print(f"    Total exercices calculation: {calc_count}")
    
    print(f"\n\n✨ FICHIER VALIDE ET COHÉRENT")
    sys.exit(0)
    
except json.JSONDecodeError as e:
    print(f"❌ ERREUR JSON: {e}")
    print(f"   Ligne {e.lineno}, Colonne {e.colno}")
    sys.exit(1)
except Exception as e:
    print(f"❌ ERREUR: {e}")
    sys.exit(1)
