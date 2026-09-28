# data-counter · Datos con contador y cortes de color

Campos de color plano que cambian en cada corte, número gigante que rueda como odómetro, barras que suben, anillo que se llena y una píldora con el cambio porcentual.

**Tendencia.** 34 de 260 referencias usan contador; ChatGPT Personal Finance (16.7M) y X Money (14M). En Opus 5.5: Email.lab, el perfil de @superalesha (split-flap) y SuperX.

**Uso en FinalStudio.** Hojas de cálculo del usuario: ventas, calificaciones, encuestas.

## Estructura y tiempos

| Tramo | Qué pasa |
|---|---|
| 0–3.2 s | total |
| 3.2–6.4 s | barras por periodo |
| 6.4–9.6 s | anillo de avance vs meta |
| 9.6–12.8 s | insight con % de cambio |

Tempo: medio · un dato por toma de 3.2 s.

## Campos del spec

- `title`, `unit`, `locale` (`es-MX`), `data[]` (`label`, `value`), `goal`, `goalPeriod`, `totalCaption`, `shotLength` (3.2 s), `palette`.
- Tomas: total → barras → anillo de meta (si hay `goal`) → cambio del último periodo vs. el anterior.
- Todo número se calcula en el build desde `data`; el build imprime los valores para revisarlos.

Ejemplo: `example.json`. Preview: `../../previews/data-counter.mp4`.

## Receta original

receta (nota de Montaj) · [fuente](https://github.com/muhammedsevimli/montaj)

> Her sahneye farklı düz zemin ver, yüzde rakamlarını halka ve çubukla 1 saniyede doldur ve akış düğümlerini çizgilerle sırayla bağla. → Cada escena con un fondo plano distinto; llena los porcentajes con anillo y barra en 1 s (Email.lab).

La plantilla calcula total, % de meta y cambio desde la hoja; ningún número se escribe a mano.

## Referencias

- [@ChatGPT · Personal Finance (16.7M)](https://x.com/ChatGPT/status/2055317612687675545)
- [@XMoney · 𝕏 Money (14M)](https://x.com/XMoney/status/2081802002539876506)
- [@Rayan_luck · Email.lab](https://x.com/Rayan_luck/status/2103883256806453502)

Bloques equivalentes del registro de HyperFrames: `count-up`, `number-wheel`, `split-flap-board`, `animated-bar-chart`, `conic-progress-ring`, `bar-chart-race`, `chart-story`.

## Licencia

- Referencias: Los videos originales son de sus autores: solo enlazamos, no copiamos cuadros ni assets.
- Receta: Nota de Montaj (MIT) traducida.
- Esta plantilla: Plantilla original; Inter (OFL).
