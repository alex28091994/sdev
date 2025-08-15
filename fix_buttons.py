import re

# Ler o arquivo
with open('tabela_1.html', 'r', encoding='utf-8') as file:
    content = file.read()

# Padrão para encontrar os botões antigos
pattern = r'<td>\s*<button class="copy-btn" onclick="copyToClipboard\(\'([^\']+)\'\)">Copiar Link</button>\s*<a href="([^"]+)" target="_blank"><button>Abrir Link</button></a>\s*</td>'

# Substituir por novos botões
replacement = r'<td>\n            <a href="\2" target="_blank" class="open-btn">\n                <i class="fas fa-external-link-alt"></i>\n                <span>Abrir</span>\n            </a>\n        </td>'

# Aplicar a substituição
content = re.sub(pattern, replacement, content)

# Escrever de volta
with open('tabela_1.html', 'w', encoding='utf-8') as file:
    file.write(content)

print("Botões atualizados com sucesso!") 