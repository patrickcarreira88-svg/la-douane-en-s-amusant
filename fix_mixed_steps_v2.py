#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PROMPT 5 - FIX #1 (v2)
Analyser et corriger les 6 étapes MIXED/UNKNOWN
"""

import json
import os

def classify_step(etape):
    """Classify étape as consultation or validation"""
    etape_type = etape.get('type', 'unknown')
    exercices = etape.get('exercices', [])
    ex_types = set(ex.get('type', 'unknown') for ex in exercices)
    
    is_consultation = False
    is_validation = False
    
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
        elif 'portfolio' in ex_types:  # Portfolio = consultation
            is_consultation = True
        elif not ex_types:  # Empty exercice group
            is_consultation = True
        else:
            # Default for mixed: if has matching or flashcard, treat as consultation
            if any(t in ['matching', 'flashcards', 'dragdrop', 'fillblanks'] for t in ex_types):
                is_consultation = True
            else:
                # Check for scenario-style exercises
                if 'scenario' in ex_types or 'case_study' in ex_types:
                    is_validation = True  # Scenarios are validation
                else:
                    is_consultation = True  # Default to consultation
    
    return is_consultation, is_validation

# Analyze both files
print("="*80)
print("PROMPT 5 - FIX #1 (v2): FIND & FIX MIXED/UNKNOWN STEPS")
print("="*80)

chapitres_fixed = r"c:\Users\patri\OneDrive\Bureau\LMS Brevet Fédéral\data\chapitres_FIXED.json"
data101bt = r"c:\Users\patri\OneDrive\Bureau\LMS Brevet Fédéral\data\data101-BT.json"

print("\n📖 FINDING MIXED/UNKNOWN STEPS IN chapitres_FIXED.json...")
with open(chapitres_fixed, 'r', encoding='utf-8') as f:
    data = json.load(f)

mixed_steps = []
for chapitre in data['chapitres']:
    ch_id = chapitre['id']
    for idx, etape in enumerate(chapitre['etapes']):
        is_c, is_v = classify_step(etape)
        if not is_c and not is_v:  # Mixed
            titre = etape.get('titre', 'Unknown')[:50]
            etape_type = etape.get('type', 'unknown')
            mixed_steps.append({
                'chapitre': ch_id,
                'index': idx,
                'id': etape.get('id'),
                'titre': titre,
                'type': etape_type,
                'current_consultation': etape.get('consultation'),
                'current_validation': etape.get('validation'),
                'should_be': ('consultation' if is_c else 'validation' if is_v else 'unknown')
            })

if mixed_steps:
    print(f"\n⚠️  Found {len(mixed_steps)} MIXED/UNKNOWN steps:")
    for step in mixed_steps:
        print(f"  {step['chapitre']}:{step['index']} - {step['titre']}")
        print(f"    Type: {step['type']}")
        print(f"    Current: consultation={step['current_consultation']}, validation={step['current_validation']}")
else:
    print("✅ No MIXED/UNKNOWN steps found")

# Now re-analyze with smarter logic
print("\n📊 RE-ANALYZING WITH CONTEXT...")
with open(chapitres_fixed, 'r', encoding='utf-8') as f:
    data = json.load(f)

context_map = {
    "Les 3 domaines douaniers": "consultation",  # Topic intro
    "Classification tarifaire": "consultation",   # Learning topic
    "Recours et contestation": "consultation",    # Learning topic
    "Documents commerciaux": "consultation",      # Learning content
    "Marchandises prohibées": "validation",       # Assessment/quiz type
    "Portfolio": "consultation"                   # Portfolio = consultation
}

fixed_count = 0
for chapitre in data['chapitres']:
    for etape in chapitre['etapes']:
        titre = etape.get('titre', '')
        
        # Check if this is a known mixed step
        for key, should_be in context_map.items():
            if key in titre:
                is_consultation = (should_be == 'consultation')
                is_validation = (should_be == 'validation')
                
                if etape.get('consultation') != is_consultation or etape.get('validation') != is_validation:
                    print(f"✅ Fixing {titre}...")
                    etape['consultation'] = is_consultation
                    etape['validation'] = is_validation
                    fixed_count += 1
                break

# Save
output_file = chapitres_fixed.replace('_FIXED.json', '_FIXED_v2.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Fixed {fixed_count} steps")
print(f"📝 Saved to: {output_file}")

# Verify final stats
print("\n📊 FINAL VERIFICATION...")
consultation_total = 0
validation_total = 0
unknown_total = 0

for chapitre in data['chapitres']:
    for etape in chapitre['etapes']:
        c = etape.get('consultation', False)
        v = etape.get('validation', False)
        if c:
            consultation_total += 1
        elif v:
            validation_total += 1
        else:
            unknown_total += 1

print(f"📖 CONSULTATION: {consultation_total}")
print(f"🎯 VALIDATION: {validation_total}")
print(f"❓ UNKNOWN: {unknown_total}")
print(f"📋 TOTAL: {consultation_total + validation_total + unknown_total}")

print("\n" + "="*80)
print("✅ FIX #1 COMPLETE - Ready to replace chapitres.json")
print("="*80)
