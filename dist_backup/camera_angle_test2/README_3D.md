# Guia para Usar Modelos 3D com Head Tracking

## Como Exportar do Blender

### 1. Preparar o Modelo no Blender
- Crie ou importe seu modelo 3D
- Certifique-se de que o modelo está centrado na origem (0,0,0)
- Aplique todas as transformações: `Ctrl+A` → "All Transforms"
- Mantenha o modelo em escala razoável (aproximadamente 2 unidades de tamanho)

### 2. Exportar como GLB/GLTF
1. Vá em `File` → `Export` → `glTF 2.0 (.glb/.gltf)`
2. Configurações recomendadas:
   - **Format**: GLB (binário, arquivo único)
   - **Include**: Selected Objects (se quiser apenas objetos selecionados)
   - **Transform**: +Y Up (padrão do Three.js)
   - **Geometry**: Apply Modifiers ✓
   - **Materials**: Export Materials ✓
   - **Compression**: Draco (opcional, para arquivos menores)

### 3. Carregar no Sistema
1. Abra `index_3d.html`
2. Clique em "Choose File" na seção "3D Model"
3. Selecione seu arquivo `.glb`
4. O modelo será carregado e centralizado automaticamente

## Recursos Disponíveis

### Controles de Head Tracking
- **Sensitivity X/Y**: Controla a sensibilidade do movimento
- **Offset X/Y**: Ajusta o ponto neutro
- **Invert X/Y**: Inverte a direção do movimento
- **Same Value**: Sincroniza sensibilidade X e Y

### Controles de Cena
- **Scale**: Redimensiona o modelo (0.1x a 5x)
- **Distance**: Ajusta distância da câmera (1 a 20 unidades)
- **Toggle Wireframe**: Mostra/esconde wireframe
- **Toggle Lighting**: Liga/desliga iluminação

### Funcionalidades
- ✅ Carregamento de modelos GLB/GLTF
- ✅ Head tracking em tempo real
- ✅ Calibração automática
- ✅ Controles de sensibilidade
- ✅ Salvamento de configurações
- ✅ Cubo padrão para testes
- ✅ Suporte a materiais e texturas
- ✅ Iluminação dinâmica
- ✅ Modo wireframe

## Dicas de Performance

### Para Modelos Complexos
- Use **Draco compression** na exportação
- Mantenha polígonos abaixo de 50k para performance suave
- Otimize texturas (máximo 2048x2048 para web)
- Use LOD (Level of Detail) se necessário

### Para Melhor Head Tracking
- Calibre em posição neutra confortável
- Ajuste sensibilidade gradualmente
- Use boa iluminação para detecção facial
- Mantenha distância consistente da câmera

## Exemplos de Uso

### Objetos Recomendados
- **Produtos**: Para visualização de produtos
- **Personagens**: Para animação e apresentação
- **Arquitetura**: Para visualização de projetos
- **Arte**: Para exposições interativas
- **Educação**: Para modelos anatômicos, moleculares, etc.

### Formatos Suportados
- ✅ GLB (recomendado)
- ✅ GLTF + assets
- ❌ OBJ (não suportado diretamente)
- ❌ FBX (não suportado diretamente)

## Troubleshooting

### Modelo não aparece
- Verifique se o arquivo GLB está válido
- Tente reduzir o tamanho do arquivo
- Use o "Default Cube" para testar o sistema

### Performance baixa
- Reduza polígonos do modelo
- Diminua resolução das texturas
- Desative sombras se necessário

### Head tracking impreciso
- Recalibre o sistema (Space)
- Ajuste sensibilidade
- Melhore iluminação da câmera
- Verifique se a face está bem visível