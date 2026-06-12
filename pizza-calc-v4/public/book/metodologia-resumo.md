# Resumo metodológico

A calculadora usa massa-alvo, percentuais de padeiro, parâmetros de farinha, horas equivalentes de fermentação e fator térmico de superfície. Para levain, calcula a farinha prefermentada e desconta água do levain da água adicionada.


## Napolitana clássica AVPN x Napolitana produzível

A calculadora agora diferencia a categoria normativa da categoria tecnológica.

- **Napolitana clássica AVPN**: massa lean, sem azeite, açúcar ou mel.
- **Napolitana produzível**: solução de engenharia para quem precisa comer no mesmo dia ou usar forno de menor temperatura. O algoritmo ajusta mel, açúcar e azeite por horas equivalentes e temperatura do forno.

Tabela base:

| Horas equivalentes | Mel | Azeite | Açúcar base |
|---:|---:|---:|---:|
| <2h | 3,0% | 2,0% | variável por forno |
| 2–4h | 2,5% | 2,0% | variável por forno |
| 4–6h | 2,0% | 1,5% | variável por forno |
| 6–8h | 1,5% | 1,0% | variável por forno |
| 8–12h | 1,0% | 1,0% | variável por forno |
| 12–24h | 0,5% | 0,5% | variável por forno |
| 24h+ | 0% | 0% | 0% |

Açúcar entra principalmente como correção de forno baixo: até 0,5% em fornos abaixo de 300°C e até 0,25% em fornos intermediários para fermentações curtas. Em fornos acima de 400°C, açúcar é removido para evitar queima.
