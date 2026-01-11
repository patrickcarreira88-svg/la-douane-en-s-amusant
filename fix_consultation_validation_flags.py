#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PROMPT 5 - FIX #1
Analyser chapitres.json et data101-BT.json
Ajouter flags consultation/validation à chaque étape
"""

import json
import os

def analyze_json_file(filepath):
    """Analyze JSON file and add consultation/validation flags"""
    
    print(f"\n📋 Analyzing {os.path.basename(filepath)}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Get chapitres list
    chapitres = data.get('chapitres', [])
    
    stats = {
        'consultation': 0,
        'validation': 0,
        'mixed': 0,
        'total': 0
    }
    
    for chapitre in chapitres:
        ch_id = chapitre.get('id', '?')
        etapes = chapitre.get('etapes', [])
        
        print(f"\n📖 {ch_id} ({len(etapes)} étapes):")
        
        for idx, etape in enumerate(etapes):
            etape_id = etape.get('id', f'step_{idx}')
            etape_type = etape.get('type', 'unknown')
            titre = etape.get('titre', '')[:50]
            
            # Classify based on type and exercices
            is_consultation = False
            is_validation = False
            
            exercices = etape.get('exercices', [])
            ex_types = set(ex.get('type', 'unknown') for ex in exercices)
            
            # Rule 1: Check direct type
            if etape_type in ['video', 'lecture', 'reading', 'objectives', 'portfolio']:
                is_consultation = True
            elif etape_type in ['qcm', 'quiz', 'assessment', 'qcm_scenario']:
                is_validation = True
            elif etape_type == 'exercise_group':
                # Rule 2: Check exercice types
                if any(t in ['qcm', 'quiz', 'assessment', 'qcm_scenario'] for t in ex_types):
                    is_validation = True
                elif any(t in ['video', 'lecture', 'reading'] for t in ex_types):
                    is_consultation = True
                elif not ex_types:  # Empty exercice group
                    is_consultation = True
            
            # Add flags if missing
            if 'consultation' not in etape:
                etape['consultation'] = is_consultation
            if 'validation' not in etape:
                etape['validation'] = is_validation
            
            # Update stats
            stats['total'] += 1
            if is_consultation:
                stats['consultation'] += 1
                marker = '📖'
            elif is_validation:
                stats['validation'] += 1
                marker = '🎯'
            else:
                stats['mixed'] += 1
                marker = '❓'
            
            print(f"  [{idx}] {marker} {etape_id}: {titre}... → consultation={is_consultation}, validation={is_validation}")
    
    # Save modified file
    output_file = filepath.replace('.json', '_FIXED.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved to: {output_file}")
    print(f"📊 Stats: {stats['consultation']} CONSULTATION + {stats['validation']} VALIDATION + {stats['mixed']} MIXED = {stats['total']} total")
    
    return stats

# Main
print("="*80)
print("PROMPT 5 - FIX #1: ADD CONSULTATION/VALIDATION FLAGS")
print("="*80)

chapitres_file = r"c:\Users\patri\OneDrive\Bureau\LMS Brevet Fédéral\data\chapitres.json"
data101bt_file = r"c:\Users\patri\OneDrive\Bureau\LMS Brevet Fédéral\data\data101-BT.json"

total_stats = {'consultation': 0, 'validation': 0, 'mixed': 0}

for filepath in [chapitres_file, data101bt_file]:
    if os.path.exists(filepath):
        stats = analyze_json_file(filepath)
        total_stats['consultation'] += stats['consultation']
        total_stats['validation'] += stats['validation']
        total_stats['mixed'] += stats['mixed']

print("\n" + "="*80)
print(f"📊 TOTAL SUMMARY:")
print(f"  📖 CONSULTATION: {total_stats['consultation']} étapes")
print(f"  🎯 VALIDATION: {total_stats['validation']} étapes")
print(f"  ❓ MIXED/UNKNOWN: {total_stats['mixed']} étapes")
print(f"  📋 TOTAL: {sum(total_stats.values())} étapes")
print("="*80)
