#!/usr/bin/env python3
"""
Migration des données vers la nouvelle structure hiérarchique
De: /data/*.json (plat)
À: /data/N1/, /data/N2/, /data/N3/, /data/N4/ (hiérarchique)
"""

import json
import os
from pathlib import Path
from collections import defaultdict
import sys

# Encoding fix
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

class DataMigration:
    def __init__(self, base_dir='data'):
        self.base_dir = base_dir
        self.stats = {
            'chapitres_migrés': 0,
            'exercices_migrés': 0,
            'erreurs': []
        }
        
    def read_json(self, filepath):
        """Lire un fichier JSON avec gestion d'encoding"""
        try:
            with open(filepath, 'r', encoding='utf-8-sig') as f:
                return json.load(f)
        except Exception as e:
            print(f"ERREUR lecture {filepath}: {e}")
            return None
    
    def write_json(self, filepath, data, create_dirs=True):
        """Écrire un fichier JSON"""
        try:
            if create_dirs:
                Path(filepath).parent.mkdir(parents=True, exist_ok=True)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"ERREUR écriture {filepath}: {e}")
            return False
    
    def migrate(self):
        """Exécuter la migration complète"""
        print("\n" + "="*60)
        print("MIGRATION DONNÉES LMS BREVET FÉDÉRAL")
        print("="*60 + "\n")
        
        # Étape 1: Lire les fichiers source
        print("ÉTAPE 1: Analyse des fichiers source...")
        chapitres_data = self.read_json('data/chapitres.json')
        if not chapitres_data:
            return False
        
        # Étape 2: Créer structure N1, N2, N3, N4
        print("ÉTAPE 2: Création de la structure N1-N4...")
        self.create_niveau_structure()
        
        # Étape 3: Migrer chapitres et exercices
        print("ÉTAPE 3: Migration des chapitres et exercices...")
        
        # Séparer ch1-ch5 (N1) et 101BT (N2)
        chapitres_n1 = []
        chapitres_n2 = []
        
        for ch in chapitres_data['chapitres']:
            if ch['id'] in ['ch1', 'ch2', 'ch3', 'ch4', 'ch5']:
                chapitres_n1.append(ch)
            elif ch['id'] == '101BT':
                chapitres_n2.append(ch)
        
        # Trier N1 par numéro
        chapitres_n1.sort(key=lambda x: x.get('numero', 999))
        
        # Traiter N1
        self.process_niveau(chapitres_n1, 'N1')
        
        # Traiter N2
        self.process_niveau(chapitres_n2, 'N2')
        
        # Créer N3 et N4 vides
        self.create_empty_niveau('N3')
        self.create_empty_niveau('N4')
        
        # Étape 4: Validation
        print("\nÉTAPE 4: Validation des fichiers...")
        self.validate_migration()
        
        # Rapport final
        self.print_report()
        
        return True
    
    def create_niveau_structure(self):
        """Créer les répertoires N1-N4"""
        for n in ['N1', 'N2', 'N3', 'N4']:
            Path(f'{self.base_dir}/{n}/exercices').mkdir(parents=True, exist_ok=True)
    
    def process_niveau(self, chapitres, niveau):
        """Traiter un niveau (N1, N2, N3, N4)"""
        if not chapitres:
            return
        
        chapitres_output = []
        all_exercices = defaultdict(list)
        
        for ch in chapitres:
            ch_id = ch['id']
            
            # Extraire exercices
            exercices = self.extract_exercices_from_chapters(ch)
            
            # Si fichier externe, le lire aussi
            if 'externalDataFile' in ch:
                external_exercices = self.extract_exercices_from_external_file(ch['externalDataFile'])
                exercices.extend(external_exercices)
            
            all_exercices[ch_id] = exercices
            
            # Créer chapitre sans exercices
            ch_output = {
                'id': ch['id'],
                'numero': ch.get('numero'),
                'titre': ch.get('titre', 'Sans titre'),
                'description': ch.get('description', ''),
                'couleur': ch.get('couleur', '#000000').lstrip('#'),  # Sans #
                'emoji': ch.get('emoji', '📚'),
                'progression': 0,
                'objectifs': ch.get('objectifs', []),
                'etapes': []
            }
            
            # Ajouter étapes SANS exercices
            for etape in ch.get('etapes', []):
                etape_output = {
                    'id': etape['id'],
                    'numero': etape.get('numero'),
                    'titre': etape.get('titre', 'Sans titre'),
                    'type': etape.get('type', 'exercise_group'),
                    'duree': etape.get('duree', ''),
                    'points': etape.get('points', 0),
                    'exercices': []  # IMPORTANT: vide ici
                }
                ch_output['etapes'].append(etape_output)
            
            # Ajouter badge si existant
            if 'badge' in ch:
                ch_output['badge'] = ch['badge']
            
            chapitres_output.append(ch_output)
        
        # Écrire chapitres.json
        output = {'chapitres': chapitres_output}
        filepath = f'{self.base_dir}/{niveau}/chapitres.json'
        if self.write_json(filepath, output):
            print(f"  ✓ {filepath} créé ({len(chapitres_output)} chapitres)")
            self.stats['chapitres_migrés'] += len(chapitres_output)
        
        # Écrire exercices par chapitre
        for ch_id, exercices in all_exercices.items():
            output = {'exercices': exercices}
            filepath = f'{self.base_dir}/{niveau}/exercices/{ch_id}.json'
            if self.write_json(filepath, output):
                print(f"  ✓ {filepath} créé ({len(exercices)} exercices)")
                self.stats['exercices_migrés'] += len(exercices)
    
    def extract_exercices_from_chapters(self, ch):
        """Extraire tous les exercices d'un chapitre"""
        exercices = []
        for etape in ch.get('etapes', []):
            for ex in etape.get('exercices', []):
                exercices.append(ex)
        return exercices
    
    def extract_exercices_from_external_file(self, filepath):
        """Extraire tous les exercices d'un fichier externe"""
        exercices = []
        data = self.read_json(filepath)
        if not data:
            return exercices
        
        for etape in data.get('etapes', []):
            for ex in etape.get('exercices', []):
                exercices.append(ex)
        
        return exercices
    
    def create_empty_niveau(self, niveau):
        """Créer un niveau vide (N3, N4)"""
        output = {'chapitres': []}
        filepath = f'{self.base_dir}/{niveau}/chapitres.json'
        if self.write_json(filepath, output):
            print(f"  ✓ {filepath} créé (vide)")
        
        # Créer .gitkeep
        gitkeep_path = f'{self.base_dir}/{niveau}/exercices/.gitkeep'
        Path(gitkeep_path).parent.mkdir(parents=True, exist_ok=True)
        Path(gitkeep_path).touch()
    
    def validate_migration(self):
        """Valider les fichiers migrés"""
        errors = []
        
        for niveau in ['N1', 'N2', 'N3', 'N4']:
            ch_path = f'{self.base_dir}/{niveau}/chapitres.json'
            if os.path.exists(ch_path):
                data = self.read_json(ch_path)
                if data:
                    print(f"  ✓ {niveau}: {len(data.get('chapitres', []))} chapitres")
            else:
                errors.append(f"MANQUANT: {ch_path}")
        
        if errors:
            print("\nERREURS DÉTECTÉES:")
            for err in errors:
                print(f"  ✗ {err}")
            self.stats['erreurs'] = errors
    
    def print_report(self):
        """Afficher le rapport final"""
        print("\n" + "="*60)
        print("RAPPORT FINAL DE MIGRATION")
        print("="*60)
        print(f"Chapitres migrés: {self.stats['chapitres_migrés']}")
        print(f"Exercices migrés: {self.stats['exercices_migrés']}")
        if self.stats['erreurs']:
            print(f"Erreurs détectées: {len(self.stats['erreurs'])}")
            for err in self.stats['erreurs']:
                print(f"  - {err}")
        else:
            print("Erreurs: AUCUNE")
        print("="*60 + "\n")

if __name__ == '__main__':
    migration = DataMigration()
    success = migration.migrate()
    sys.exit(0 if success else 1)
