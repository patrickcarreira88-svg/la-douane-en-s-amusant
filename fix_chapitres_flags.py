import json

# Charger les données sources
with open('data/chapitres.json', 'r', encoding='utf-8') as f:
    source_data = json.load(f)

# Charger le fichier cible
with open('data/chapitres-N1N4.json', 'r', encoding='utf-8') as f:
    target_data = json.load(f)

# Créer un mapping de consultation/validation par id d'étape
flags_map = {}
for chapitre in source_data['chapitres']:
    for etape in chapitre['etapes']:
        flags_map[etape['id']] = {
            'consultation': etape.get('consultation', False),
            'validation': etape.get('validation', False)
        }

# Appliquer les flags au fichier cible
count = 0
for niveau in target_data['niveaux']:
    for chapitre in niveau['chapitres']:
        for etape in chapitre['etapes']:
            if etape['id'] in flags_map:
                etape['consultation'] = flags_map[etape['id']]['consultation']
                etape['validation'] = flags_map[etape['id']]['validation']
                count += 1

print(f"✅ {count} étapes mises à jour avec les flags")

# Sauvegarder
with open('data/chapitres-N1N4.json', 'w', encoding='utf-8') as f:
    json.dump(target_data, f, ensure_ascii=False, indent=2)

print("✅ chapitres-N1N4.json sauvegardé")
