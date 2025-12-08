# 📹 Guia de Configuração da Câmera

## 🚀 Setup Rápido

### 1. **Configurar Câmera Web**
1. Abra `index_3d.html`
2. Selecione sua câmera no dropdown
3. Clique "Start Camera"
4. Posicione-se confortavelmente
5. Pressione **SPACE** para calibrar

### 2. **Escolher Preset de Câmera**
- **Front View**: Vista frontal clássica
- **Side View**: Vista lateral (perfil)
- **Top View**: Vista superior
- **Perspective**: Vista em perspectiva (recomendado)
- **Close Up**: Vista próxima para detalhes
- **Custom**: Configuração manual

### 3. **Ajustar Posição Manual**
- **Camera X/Y/Z**: Posição da câmera 3D
- **Model X/Y/Z**: Posição do modelo
- **Field of View**: Ângulo de visão (20°-120°)

## 🎬 Tipos de Cenas

### **Apresentação de Produto**
```
Preset: Front View
FOV: 50°
Distance: 6-8 unidades
Background: Studio
```

### **Visualização Artística**
```
Preset: Perspective
FOV: 75°
Distance: 5 unidades
Background: Gradient
```

### **Análise Técnica**
```
Preset: Side View
FOV: 45°
Distance: 10 unidades
Wireframe: ON
```

### **Demonstração Interativa**
```
Preset: Close Up
FOV: 90°
Distance: 3 unidades
Background: Dark
```

## ⚙️ Controles Avançados

### **Head Tracking**
- **Sensitivity X/Y**: Velocidade de resposta (10-120)
- **Offset X/Y**: Ajuste fino da posição neutra
- **Invert X/Y**: Inverte direção do movimento

### **Modelo 3D**
- **Scale**: Tamanho do modelo (0.1x-5x)
- **Position**: Posição no espaço 3D
- **Wireframe**: Mostra estrutura do modelo

### **Iluminação**
- **Dark**: Fundo escuro, iluminação suave
- **Light**: Fundo claro, iluminação intensa
- **Studio**: Configuração profissional
- **Gradient**: Fundo degradê

## 💾 Salvar/Carregar Cenas

### **Salvar Configuração**
1. Configure câmera, modelo e iluminação
2. Clique "Save Scene"
3. Arquivo JSON será baixado

### **Carregar Configuração**
1. Clique "Load Scene"
2. Selecione arquivo JSON salvo
3. Configuração será aplicada automaticamente

## 🎯 Dicas de Performance

### **Para Modelos Pesados**
- Use FOV menor (45°-60°)
- Aumente distância da câmera
- Reduza sensibilidade do head tracking

### **Para Apresentações**
- Use preset "Front View" ou "Perspective"
- FOV entre 50°-75°
- Background "Studio" ou "Light"

### **Para Análise Detalhada**
- Use "Close Up" com FOV alto (90°+)
- Ative wireframe se necessário
- Background "Dark" para contraste

## 🔧 Troubleshooting

### **Câmera não funciona**
- Verifique permissões do navegador
- Teste com câmera diferente
- Recarregue a página

### **Head tracking impreciso**
- Recalibre (pressione SPACE)
- Melhore iluminação do ambiente
- Ajuste sensibilidade gradualmente

### **Modelo não aparece**
- Verifique se arquivo GLB é válido
- Teste com "Default Cube" primeiro
- Ajuste escala e posição

### **Performance baixa**
- Reduza FOV
- Aumente distância da câmera
- Use modelos com menos polígonos