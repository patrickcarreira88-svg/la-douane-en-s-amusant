#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the bad JSDoc and skip orphaned code
output = []
i = 0
in_bad_section = False

while i < len(lines):
    line = lines[i]
    
    # Detect bad JSDoc followed by orphaned code
    if '/**' in line and i + 1 < len(lines) and 'Complète' in lines[i + 1]:
        # Check if next actual code line is orphaned
        j = i + 3
        while j < len(lines) and (lines[j].strip() == '' or lines[j].strip().startswith('*')):
            j += 1
        
        # If next line after JSDoc is orphaned code (starts with //)
        if j < len(lines) and lines[j].strip().startswith('//'):
            # Skip until we find the real nextEtape function
            in_bad_section = True
            while i < len(lines) and 'nextEtape(chapitreId, etapeIndex) {' not in lines[i]:
                i += 1
            in_bad_section = False
            # Don't increment i, process the real function on next iteration
            continue
    
    if not in_bad_section:
        output.append(line)
    
    i += 1

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.writelines(output)

print('✅ Fichier app.js nettoyé avec succès!')
