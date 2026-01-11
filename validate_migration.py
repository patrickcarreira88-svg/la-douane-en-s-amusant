#!/usr/bin/env python3
"""
Validation complète de la migration
"""

import json
import os
from pathlib import Path
import sys

if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

class ValidationMigration:
    def __init__(self):
        self.stats = {
            'chapitres_total': 0,
            'exercices_total': 0,
            'ids_uniques': set(),
            'ids_doublons': [],
            'erreurs': []
        }
    
    def read_json(self, filepath):
        try:
            with open(filepath, 'r', encoding='utf-8-sig') as f:
                return json.load(f)
        except Exception as e:
            self.stats['erreurs'].append(f"Erreur lecture {filepath}: {e}")
            return None
    
    def validate_all(self):
        print("\n" + "="*70)
        print("VALIDATION COMPLÈTE DE LA MIGRATION")
        print("="*70 + "\n")
        
        # Valider chaque niveau
        for niveau in ['N1', 'N2', 'N3', 'N4']:
            self.validate_niveau(niveau)
        
        # Rapport final
        self.print_rapport()
    
    def validate_niveau(self, niveau):
        ch_file = f'data/{niveau}/chapitres.json'
        if not os.path.exists(ch_file):
            self.stats['erreurs'].append(f"MANQUANT: {ch_file}")
            return
        
        ch_data = self.read_json(ch_file)
        if not ch_data:
            return
        
        chapitres = ch_data.get('chapitres', [])
        self.stats['chapitres_total'] += len(chapitres)
        
        print(f"{niveau}: {len(chapitres)} chapitre(s)")
        
        for ch in chapitres:
            ch_id = ch.get('id')
            if not ch_id:
                self.stats['erreurs'].append(f"Chapitre sans ID dans {niveau}")
                continue
            
            # Vérifier ID unique
            if ch_id in self.stats['ids_uniques']:
                self.stats['ids_doublons'].append(ch_id)
            else:
                self.stats['ids_uniques'].add(ch_id)
            
            # Vérifier fichier exercices
            ex_file = f'data/{niveau}/exercices/{ch_id}.json'
            if os.path.exists(ex_file):
                ex_data = self.read_json(ex_file)
                if ex_data:
                    exercices = ex_data.get('exercices', [])
                    self.stats['exercices_total'] += len(exercices)
                    print(f"  - {ch_id}: {len(exercices)} exercices, " +
                          f"Titre: {ch.get('titre', '?')[:40]}")
                    
                    # Vérifier IDs exercices
                    for ex in exercices:
                        ex_id = ex.get('id')
                        if ex_id:
                            if ex_id in self.stats['ids_uniques']:
                                self.stats['ids_doublons'].append(ex_id)
                            else:
                                self.stats['ids_uniques'].add(ex_id)
            else:
                # C'est OK pour N3 et N4 vides
                if niveau not in ['N3', 'N4']:
                    self.stats['erreurs'].append(f"Fichier exercices manquant: {ex_file}")
        
        print()
    
    def print_rapport(self):
        print("="*70)
        print("RAPPORT FINAL")
        print("="*70 + "\n")
        
        print(f"Chapitres migrés: {self.stats['chapitres_total']}")
        print(f"Exercices migrés: {self.stats['exercices_total']}")
        print(f"IDs uniques: {len(self.stats['ids_uniques'])}")
        
        if self.stats['ids_doublons']:
            print(f"\nDOUBLONS DÉTECTÉS ({len(self.stats['ids_doublons'])}): ")
            for dup in self.stats['ids_doublons']:
                print(f"  - {dup}")
        else:
            print("\nDoublons: AUCUN")
        
        if self.stats['erreurs']:
            print(f"\nERREURS ({len(self.stats['erreurs'])}):")
            for err in self.stats['erreurs']:
                print(f"  - {err}")
        else:
            print("\nErreurs: AUCUNE")
        
        print("\n" + "="*70)
        print("RÉSUMÉ DÉTAILLÉ")
        print("="*70)
        
        # Détail par niveau
        for niveau in ['N1', 'N2', 'N3', 'N4']:
            ch_file = f'data/{niveau}/chapitres.json'
            if os.path.exists(ch_file):
                ch_data = self.read_json(ch_file)
                if ch_data:
                    chapitres = ch_data.get('chapitres', [])
                    print(f"\n{niveau}: {len(chapitres)} chapitres")
                    for ch in chapitres:
                        ex_file = f'data/{niveau}/exercices/{ch.get("id", "?")}.json'
                        ex_count = 0
                        if os.path.exists(ex_file):
                            ex_data = self.read_json(ex_file)
                            if ex_data:
                                ex_count = len(ex_data.get('exercices', []))
                        
                        points = ch.get('objectifs', [])
                        print(f"  - {ch.get('id'):15} | {ch.get('titre', '?')[:30]:30} | " +
                              f"{ex_count} ex | {len(ch.get('objectifs', []))} obj | " +
                              f"{len(ch.get('etapes', []))} etapes")
        
        print("\n" + "="*70 + "\n")

if __name__ == '__main__':
    validator = ValidationMigration()
    validator.validate_all()
