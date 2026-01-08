#!/usr/bin/env python3
"""
📹 Migration de Structure Vidéo - Tous les Chapitres
Guide et outil pour appliquer le pattern vidéo unifié à CH2-CH6
"""

import json
import re
from pathlib import Path

class VideoStructureMigration:
    def __init__(self, data_path='data/chapitres.json'):
        self.data_path = Path(data_path)
        self.data = self._load_data()
        self.migration_report = []
    
    def _load_data(self):
        """Charger les données JSON"""
        with open(self.data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _save_data(self):
        """Sauvegarder les données modifiées"""
        with open(self.data_path, 'w', encoding='utf-8', newline='') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
    
    def extract_youtube_id(self, url):
        """Extraire l'ID d'une URL YouTube"""
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/)([^&\n?#]+)',
            r'youtube\.com/embed/([^&\n?#]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def is_youtube_url(self, url):
        """Vérifier si c'est une URL YouTube"""
        return url and ('youtube.com' in url or 'youtu.be' in url)
    
    def audit_chapter_videos(self, chapter_id):
        """Auditer les vidéos d'un chapitre"""
        chapter = next((ch for ch in self.data['chapitres'] if ch['id'] == chapter_id), None)
        if not chapter:
            return None
        
        videos = []
        for etape in chapter.get('etapes', []):
            for exercice in etape.get('exercices', []):
                if exercice.get('type') == 'video':
                    videos.append({
                        'id': exercice.get('id'),
                        'titre': exercice.get('titre'),
                        'structure': self._analyze_video_structure(exercice)
                    })
        
        return videos
    
    def _analyze_video_structure(self, exercice):
        """Analyser la structure actuelle d'une vidéo"""
        analysis = {
            'has_url': 'url' in exercice,
            'has_content': 'content' in exercice,
            'has_videoId': 'videoId' in exercice,
            'has_videoType': False,
            'url_value': None,
            'content_value': None,
            'videoId_value': None,
        }
        
        if 'content' in exercice:
            analysis['has_videoType'] = 'videoType' in exercice['content']
            analysis['content_value'] = exercice['content'].get('url')
        
        if 'url' in exercice:
            analysis['url_value'] = exercice['url']
        
        if 'videoId' in exercice:
            analysis['videoId_value'] = exercice['videoId']
        
        return analysis
    
    def migrate_video_to_unified(self, chapter_id, dry_run=True):
        """Migrer les vidéos d'un chapitre vers la structure unifiée"""
        chapter = next((ch for ch in self.data['chapitres'] if ch['id'] == chapter_id), None)
        if not chapter:
            print(f"❌ Chapitre {chapter_id} non trouvé")
            return
        
        print(f"\n📊 Migration du chapitre {chapter_id}: {chapter['titre']}")
        print("=" * 60)
        
        videos_migrated = 0
        
        for etape in chapter.get('etapes', []):
            for exercice in etape.get('exercices', []):
                if exercice.get('type') == 'video':
                    before = json.dumps(exercice, ensure_ascii=False, indent=2)
                    
                    self._migrate_single_video(exercice)
                    
                    after = json.dumps(exercice, ensure_ascii=False, indent=2)
                    
                    if before != after:
                        videos_migrated += 1
                        print(f"\n✅ Migré: {exercice['id']}")
                        print(f"   Titre: {exercice.get('titre', 'N/A')}")
                        
                        # Afficher les changements
                        structure = self._analyze_video_structure(exercice)
                        print(f"   Structure finale:")
                        print(f"   - videoType: {exercice['content'].get('videoType', 'N/A')}")
                        print(f"   - url: {exercice['content'].get('url', 'N/A')}")
        
        print(f"\n📈 Total migré: {videos_migrated} vidéo(s)")
        
        if not dry_run:
            self._save_data()
            print(f"✅ Changements sauvegardés dans {self.data_path}")
        else:
            print(f"ℹ️  Mode simulation - aucun changement sauvegardé")
    
    def _migrate_single_video(self, exercice):
        """Migrer une seule vidéo"""
        # Obtenir l'URL actuelle
        url = exercice.get('url') or exercice.get('content', {}).get('url')
        description = exercice.get('description') or exercice.get('content', {}).get('description', '')
        
        if not url:
            return
        
        # Créer la nouvelle structure
        if not exercice.get('content'):
            exercice['content'] = {}
        
        content = exercice['content']
        
        # Déterminer le type
        if self.is_youtube_url(url):
            content['videoType'] = 'youtube'
        else:
            content['videoType'] = 'local'
        
        content['url'] = url
        content['description'] = description
        
        # Nettoyer les anciens champs
        if 'url' in exercice and exercice['url'] == url:
            del exercice['url']
        
        # Garder videoId/videoPath pour debug seulement
        # (ne pas supprimer immédiatement pour la compatibilité)
    
    def generate_report(self):
        """Générer un rapport de migration"""
        print("\n" + "=" * 60)
        print("📋 RAPPORT FINAL DE MIGRATION")
        print("=" * 60)
        
        for chapter in self.data['chapitres']:
            videos = self.audit_chapter_videos(chapter['id'])
            if videos:
                print(f"\n{chapter['id']}: {chapter['titre']}")
                print(f"  Total vidéos: {len(videos)}")
                
                for video in videos:
                    status = "✅" if video['structure']['has_videoType'] else "⏳"
                    print(f"  {status} {video['id']}: {video['titre'][:50]}...")


def main():
    print("""
╔════════════════════════════════════════════════════════════════╗
║  📹 OUTIL DE MIGRATION - STRUCTURE VIDÉO UNIFIÉE              ║
║  Applique le pattern CH1 à tous les chapitres                  ║
╚════════════════════════════════════════════════════════════════╝
    """)
    
    migration = VideoStructureMigration()
    
    # Afficher l'état actuel
    print("\n🔍 AUDIT INITIAL")
    print("-" * 60)
    migration.generate_report()
    
    # Proposer les options
    print("\n\n🚀 OPTIONS:")
    print("1. Faire un audit complet (lecture seule)")
    print("2. Migrer CH2 en simulation")
    print("3. Migrer CH3 en simulation")
    print("4. Migrer tous les chapitres en simulation")
    print("5. Quitter")
    
    choice = input("\nVotre choix (1-5): ").strip()
    
    if choice == '1':
        migration.generate_report()
    elif choice == '2':
        migration.migrate_video_to_unified('ch2', dry_run=True)
    elif choice == '3':
        migration.migrate_video_to_unified('ch3', dry_run=True)
    elif choice == '4':
        for ch_id in ['ch2', 'ch3', 'ch4', 'ch5', 'ch6']:
            migration.migrate_video_to_unified(ch_id, dry_run=True)
    elif choice == '5':
        print("Au revoir!")
        return
    
    # Afficher le rapport final
    migration.generate_report()


if __name__ == '__main__':
    main()
