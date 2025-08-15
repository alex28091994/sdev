import re

# Ler o arquivo
with open('ia.html', 'r', encoding='utf-8') as file:
    content = file.read()

# Padrão para encontrar os botões "Copiar Link" sem ícones
pattern = r'<button class="copy-btn" onclick="copyToClipboard\(\'([^\']*)\'\)">Copiar Link</button>'
replacement = r'<button class="copy-btn" onclick="copyToClipboard(\'\1\')">\n                <i class="fas fa-copy"></i> Copiar\n            </button>'

# Fazer a substituição
new_content = re.sub(pattern, replacement, content)

# Escrever de volta no arquivo
with open('ia.html', 'w', encoding='utf-8') as file:
    file.write(new_content)

print("Botões 'Copiar Link' atualizados!") 