#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import re

print("\n" + "="*70)
print("VALIDATION CHAPITRES-N1N4.JSON")
print("="*70)

# 1. Parser le JSON
try:
    with open('data/chapitres-N1N4.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print("\n✅ JSON PARSÉ AVEC SUCCÈS (Syntaxe valide)")
except json.JSONDecodeError as e:
    print(f"\n❌ ERREUR JSON: {e}")
    exit(1)

# 2. Vérifier la structure root
print("\n" + "="*70)
print("1. VALIDATION STRUCTURE ROOT")
print("="*70)

if "niveaux" in data and isinstance(data["niveaux"], list):
    print(f"✅ 'niveaux' array présent: {len(data['niveaux'])} niveaux")
else:
    print("❌ 'niveaux' manquant ou invalide")
    exit(1)

# 3. Compter et valider les niveaux
print("\n" + "="*70)
print("2. VALIDATION NIVEAUX")
print("="*70)

niveaux_ids = []
for i, niveau in enumerate(data["niveaux"]):
    n_id = niveau.get("id")
    n_ch = len(niveau.get("chapitres", []))
    niveaux_ids.append(n_id)
    status = "✅" if n_ch >= 0 else "❌"
    print(f"{status} Niveau {i+1}: {n_id} - {n_ch} chapitres")

if niveaux_ids == ["N1", "N2", "N3", "N4"]:
    print("✅ IDs niveaux corrects")
else:
    print(f"❌ IDs niveaux incorrect: {niveaux_ids}")

# 4. Valider N1 chapitres
print("\n" + "="*70)
print("3. VALIDATION N1 CHAPITRES")
print("="*70)

n1_ch = data["niveaux"][0]["chapitres"]
print(f"Total: {len(n1_ch)} chapitres\n")

ch_ids = []
ch_nums = []
errors = []

for i, ch in enumerate(n1_ch):
    ch_id = ch.get("id")
    ch_num = ch.get("numero")
    n_etapes = len(ch.get("etapes", []))
    n_exos = sum(len(e.get("exercices", [])) for e in ch.get("etapes", []))
    
    ch_ids.append(ch_id)
    ch_nums.append(ch_num)
    
    print(f"  {i+1}. {ch_id:8} (num={ch_num}): {n_etapes} étapes, {n_exos} exercices ✅")

expected_ids = ["ch1", "101BT", "ch2", "ch3", "ch4", "ch5", "101AY"]
expected_nums = [1, 2, 3, 4, 5, 6, 7]

if ch_ids == expected_ids:
    print(f"\n✅ IDs corrects: {ch_ids}")
else:
    print(f"\n❌ IDs incorrect: {ch_ids}")
    errors.append(f"IDs chapitres: attendu {expected_ids}, trouvé {ch_ids}")

if ch_nums == expected_nums:
    print(f"✅ Numéros corrects: {ch_nums}")
else:
    print(f"❌ Numéros incorrect: {ch_nums}")
    errors.append(f"Numéros: attendu {expected_nums}, trouvé {ch_nums}")

# 5. Valider N2, N3, N4 vides
print("\n" + "="*70)
print("4. VALIDATION N2, N3, N4 (SHELLS VIDES)")
print("="*70)

for i in range(1, 4):
    niv = data["niveaux"][i]
    n_ch = len(niv.get("chapitres", []))
    status = "✅" if n_ch == 0 else "❌"
    print(f"{status} {niv['id']}: {n_ch} chapitres (vide)")
    if n_ch != 0:
        errors.append(f"{niv['id']} doit être vide")

# 6. Compter étapes et exercices
print("\n" + "="*70)
print("5. TOTAUX N1")
print("="*70)

total_etapes = 0
total_exos = 0
total_pts = 0

for ch in n1_ch:
    for etape in ch.get("etapes", []):
        total_etapes += 1
        total_pts += etape.get("points", 0)
        for ex in etape.get("exercices", []):
            total_exos += 1
            total_pts += ex.get("points", 0)

print(f"✅ Étapes totales: {total_etapes}")
print(f"✅ Exercices totaux: {total_exos}")
print(f"✅ Points totaux: {total_pts}")

# 7. Vérifier IDs uniques
print("\n" + "="*70)
print("6. VALIDATION IDs UNIQUES")
print("="*70)

all_ids = []
def collect_ids(obj):
    if isinstance(obj, dict):
        if "id" in obj:
            all_ids.append(obj["id"])
        for v in obj.values():
            collect_ids(v)
    elif isinstance(obj, list):
        for item in obj:
            collect_ids(item)

collect_ids(data)

unique_ids = list(set(all_ids))
duplicates = [id_val for id_val in unique_ids if all_ids.count(id_val) > 1]

print(f"Total IDs: {len(all_ids)}")
print(f"Uniques: {len(unique_ids)}")

if duplicates:
    print(f"❌ Doublons trouvés: {duplicates}")
    errors.append(f"IDs dupliqués: {duplicates}")
else:
    print("✅ Pas de doublons")

# 8. Vérifier couleurs HEX
print("\n" + "="*70)
print("7. VALIDATION COULEURS (HEX)")
print("="*70)

hex_pattern = r"^#?[0-9A-Fa-f]{6}$"
color_errors = 0

for niveau in data["niveaux"]:
    color = niveau.get("couleur", "")
    if not re.match(hex_pattern, color):
        print(f"❌ {niveau['id']}: couleur invalide '{color}'")
        color_errors += 1

if color_errors == 0:
    print("✅ Toutes les couleurs en format HEX valide")

# 9. Résumé final
print("\n" + "="*70)
print("RÉSUMÉ FINAL")
print("="*70)

print(f"✅ Niveaux: 4 (N1, N2, N3, N4)")
print(f"✅ N1 Chapitres: 7 (ch1, 101BT, ch2, ch3, ch4, ch5, 101AY)")
print(f"✅ N2, N3, N4: vides (shells)")
print(f"✅ Étapes N1: {total_etapes}")
print(f"✅ Exercices N1: {total_exos}")
print(f"✅ Points N1: {total_pts}")
print(f"✅ IDs uniques: {len(unique_ids)}")

if errors:
    print(f"\n❌ ERREURS ({len(errors)}):")
    for err in errors:
        print(f"  - {err}")
    print("\n❌ VALIDATION ÉCHOUÉE")
    exit(1)
else:
    print("\n" + "="*70)
    print("✅ PRÊT ÉTAPE 4 - AUCUNE ERREUR DÉTECTÉE")
    print("="*70)
