#!/usr/bin/env python3
"""
AUDIT STRUCTURES EXERCICES - Script complet
============================================

Scanne chapitres.json et compare structures d'exercices:
- CH1 = structure de référence
- CH2-CH6 = vérification conformité
- Rapport écarts + recommandations

Usage:
    python audit_structures_exercices.py
    python audit_structures_exercices.py --fix   # Corriger les écarts détectés
"""

import json
import sys
from collections import defaultdict
from pathlib import Path

class AuditStructures:
    def __init__(self, json_path="data/chapitres.json"):
        self.json_path = Path(json_path)
        self.data = None
        self.ch1_ref = {}
        self.ecarts = []
        self.stats = {
            'total_chapitres': 0,
            'total_exercices': 0,
            'types_found': set(),
            'conformes': 0,
            'non_conformes': 0
        }
    
    def load_data(self):
        """Charge le fichier JSON"""
        try:
            with open(self.json_path, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            print(f"✓ Fichier charge: {self.json_path}")
            return True
        except Exception as e:
            print(f"✗ Erreur chargement: {e}")
            return False
    
    def extract_ch1_reference(self):
        """Extrait la structure de reference de CH1"""
        ch1 = self.data['chapitres'][0]
        
        # Collecter par type
        types_in_ch1 = defaultdict(list)
        for etape in ch1.get('etapes', []):
            for ex in etape.get('exercices', []):
                ex_type = ex.get('type')
                if ex_type:
                    types_in_ch1[ex_type].append(ex)
                    self.stats['total_exercices'] += 1
        
        # Stocker structure de reference
        self.ch1_ref = {
            ex_type: {
                'structure_keys': list(exs[0].keys()),
                'content_keys': list(exs[0].get('content', {}).keys()),
                'count': len(exs),
                'example_id': exs[0]['id']
            }
            for ex_type, exs in types_in_ch1.items()
        }
        
        self.stats['types_found'] = set(self.ch1_ref.keys())
        self.stats['total_chapitres'] = 1
        
        return self.ch1_ref
    
    def audit_other_chapters(self):
        """Audit CH2-CH6 vs CH1"""
        results = {}
        
        for idx in range(1, 6):  # CH2-CH6
            chapter = self.data['chapitres'][idx]
            ch_id = chapter['id']
            results[ch_id] = {
                'titre': chapter.get('titre', 'N/A'),
                'exercices': defaultdict(list),
                'ecarts': []
            }
            
            for etape in chapter.get('etapes', []):
                for ex in etape.get('exercices', []):
                    ex_type = ex.get('type')
                    if ex_type:
                        results[ch_id]['exercices'][ex_type].append(ex)
                        self.stats['total_exercices'] += 1
            
            # Verifier conformite
            for ex_type, exs in results[ch_id]['exercices'].items():
                if ex_type not in self.ch1_ref:
                    # Nouveau type (ok)
                    continue
                
                ref_keys = self.ch1_ref[ex_type]['structure_keys']
                for ex in exs:
                    current_keys = list(ex.keys())
                    if current_keys != ref_keys:
                        # Écart détecté
                        missing = set(ref_keys) - set(current_keys)
                        extra = set(current_keys) - set(ref_keys)
                        
                        ecart = {
                            'chapter': ch_id,
                            'type': ex_type,
                            'ex_id': ex.get('id'),
                            'missing_keys': list(missing),
                            'extra_keys': list(extra),
                            'current_keys': current_keys,
                            'expected_keys': ref_keys
                        }
                        results[ch_id]['ecarts'].append(ecart)
                        self.ecarts.append(ecart)
                        self.stats['non_conformes'] += 1
            
            self.stats['conformes'] += len(results[ch_id]['exercices'])
        
        return results
    
    def generate_report(self):
        """Genere un rapport texte"""
        report = []
        report.append("=" * 80)
        report.append("AUDIT STRUCTURES EXERCICES - RAPPORT COMPLET")
        report.append("=" * 80)
        
        # Resume
        report.append("\nRESUME:")
        report.append(f"  Total chapitres: {self.stats['total_chapitres']} (CH1 reference)")
        report.append(f"  Total exercices: {self.stats['total_exercices']}")
        report.append(f"  Types distincts: {len(self.stats['types_found'])}")
        report.append(f"    Types: {', '.join(sorted(self.stats['types_found']))}")
        report.append(f"  Exercices non-conformes: {len(self.ecarts)}")
        
        # Structures de reference
        report.append("\n" + "-" * 80)
        report.append("STRUCTURES DE REFERENCE (CH1)")
        report.append("-" * 80)
        
        for ex_type in sorted(self.ch1_ref.keys()):
            ref = self.ch1_ref[ex_type]
            report.append(f"\n[{ex_type.upper()}]")
            report.append(f"  Cles requises: {ref['structure_keys']}")
            report.append(f"  Cles content: {ref['content_keys']}")
            report.append(f"  Nombre CH1: {ref['count']}")
        
        # Ecarts
        if self.ecarts:
            report.append("\n" + "-" * 80)
            report.append("ECARTS DETECTES")
            report.append("-" * 80)
            
            for ecart in self.ecarts:
                report.append(f"\n{ecart['chapter']} | {ecart['type']} | {ecart['ex_id']}")
                if ecart['missing_keys']:
                    report.append(f"  MANQUANTES: {ecart['missing_keys']}")
                if ecart['extra_keys']:
                    report.append(f"  SUPPLEMENTAIRES: {ecart['extra_keys']}")
        else:
            report.append("\n" + "-" * 80)
            report.append("AUCUN ECART DETECTE - TOUTES STRUCTURES CONFORMES!")
            report.append("-" * 80)
        
        report.append("\n")
        return "\n".join(report)
    
    def fix_ecarts(self):
        """Corrige automatiquement les ecarts (si possible)"""
        fixed = 0
        failed = 0
        
        for ecart in self.ecarts:
            # Ajouter les cles manquantes
            if ecart['missing_keys']:
                for ch_idx in range(1, 6):
                    chapter = self.data['chapitres'][ch_idx]
                    if chapter['id'] != ecart['chapter']:
                        continue
                    
                    for etape in chapter.get('etapes', []):
                        for ex in etape.get('exercices', []):
                            if ex.get('id') == ecart['ex_id']:
                                # Pour VIDEO: ajouter 'url' depuis content.url
                                if 'url' in ecart['missing_keys']:
                                    content_url = ex.get('content', {}).get('url')
                                    if content_url:
                                        ex['url'] = content_url
                                        fixed += 1
                                    else:
                                        failed += 1
                                        print(f"! Impossible corriger {ecart['ex_id']}: url absent dans content")
        
        return fixed, failed
    
    def save_data(self):
        """Sauvegarde le fichier JSON modifie"""
        try:
            with open(self.json_path, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
            print(f"✓ Fichier sauvegarde: {self.json_path}")
            return True
        except Exception as e:
            print(f"✗ Erreur sauvegarde: {e}")
            return False
    
    def run(self, fix=False):
        """Lance l'audit complet"""
        print("\n[AUDIT] Demarrage...")
        
        if not self.load_data():
            return False
        
        print("\n[PHASE 1] Extraction CH1...")
        self.extract_ch1_reference()
        print(f"✓ {len(self.ch1_ref)} types trouves dans CH1")
        
        print("\n[PHASE 2] Audit CH2-CH6...")
        self.audit_other_chapters()
        print(f"✓ Audit complete: {len(self.ecarts)} ecarts detectes")
        
        print("\n[PHASE 3] Rapport...")
        report = self.generate_report()
        print(report)
        
        if fix and self.ecarts:
            print("\n[PHASE 4] Correction automatique...")
            fixed, failed = self.fix_ecarts()
            print(f"✓ {fixed} exercices corriges")
            if failed > 0:
                print(f"! {failed} exercices NON corrigeables")
            
            if fixed > 0:
                self.save_data()
        
        return True


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Audit structures exercices")
    parser.add_argument('--fix', action='store_true', help="Corriger les ecarts")
    parser.add_argument('--file', default='data/chapitres.json', help="Fichier JSON a auditer")
    
    args = parser.parse_args()
    
    audit = AuditStructures(args.file)
    success = audit.run(fix=args.fix)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
