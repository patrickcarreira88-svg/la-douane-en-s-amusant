import json

# Lire le fichier
with open('data/chapitres-N1N4.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Sauvegarder 101AY
ch_101ay = None
for i, ch in enumerate(data['niveaux'][0]['chapitres']):
    if ch['id'] == '101AY':
        ch_101ay = data['niveaux'][0]['chapitres'].pop(i)
        break

# Ajouter 101AY à la fin
if ch_101ay:
    ch_101ay['numero'] = 7
    data['niveaux'][0]['chapitres'].append(ch_101ay)

# Réécrire le fichier
with open('data/chapitres-N1N4.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ Fichier réorganisé avec succès")
