# Otimização Renderização Gráfica

Em sistemas de renderização em tempo real (como jogos 3D), o equilíbrio que deve ser controlado entre qualidade visual e performance é crítico, como um renderizador que precisa calcular e construir cenas complexas, mantendo uma taxa de quadros estável (FPS ou QPS), também precisa cuidar dos controles dados pelo jogador. Por exemplo: uma engine de renderização com resolução adaptativa ajusta dinamicamente a resolução interna da imagem renderizada para manter 60 FPS (quadros por segundo). Quanto maior a resolução, melhor a qualidade, maior a intensidade, custo e o tempo de processamento.

---

Seja a resolução $r$ da renderização (em megapixels). O tempo de processamento (em milissegundos) é modelado por:
```math
T(r)=0.5r^{2}+2r+5
```
Onde
- $0.5r^{2}$ representa a complexidade dos cálculos de iluminação e sombreamento
- $2r$ representa operações lineares (transferência de dados, etc)
- $5$ é o *overhead* fixo do sistema

---

## Restrição de performance
Queremos manter $T(r) \leq 16.67$ ($\frac{1000}{60}=16.67$ para o intervalo de 60 quadros por segundo)
**Objetivo**: Encontrar a resolução máxima que não ultrapassa o limite de tempo

Para encontrar o ponto crítico (onde a taxa de mudança de tempo em relação à resolução é máxima), calculamos a derivada:
```math
T'(r)=r+2
```
E a segunda derivada, indica se a derivada de primeira ordem possui mínima global:
```math
T''(r)=1>0
```
Como queremos maximizar $r$ dentro da restrição $T(r)\leq 16.67$:
```math
\begin{align}
 & 0.5r^{2}+2r+5=16.67 \\
 & 0.5r^{2}+2r−11.67=0 \\  
 & r^{2}+4r−23.34=0
\end{align}
```
Usando a **fórmula de Bhaskara:**
```math
\begin{align}
r=\frac{-4\pm \sqrt{ 16+93.36 }}{2}=\frac{-4\pm \sqrt{ 109.36 }}{2}=\frac{-4\pm 10.457}{2}
\end{align}
```
Como $r>0$: $r_{max}=\frac{-4+10.457}{2}=3.23$ megapixels
