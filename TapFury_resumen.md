# TapFury — Idle Clicker Game

## Concepto
Idle clicker game para iOS y Android llamado **TapFury**.
Género: idle clicker — tap → contador → monedas → mejoras/cosméticos.

---

## Modos de juego

**Modo Fury (principal)**
- Pantalla con botón y contador acumulativo
- Economía completa: coins, gems, upgrades, auto-clicker, multiplicadores
- Shop e inventario activos

**Modo Clásico**
- Sin coins, sin upgrades funcionales, sin auto-clicker
- Solo el botón y el contador — experiencia pura
- Contador y leaderboard separados del Modo Fury
- Sí usa los cosméticos (botones, fondos, sonidos, música) comprados en Modo Fury

**Modo Tiempo**
- El jugador elige 10, 20 o 30 segundos
- Intenta hacer la mayor cantidad de clicks
- Record personal guardado por duración
- Ads entre partidas (monetización)
- La música sube de intensidad automáticamente (overrideable desde inventario)

---

## Economía del juego

**Dos monedas:**

**Coins** (moneda común)
- Se ganan clickeando
- Abundantes, para cosméticos y upgrades básicos

**Gems** (moneda premium)
- Se ganan muy lento (logros, prestige, eventos)
- O se compran con dinero real
- Para upgrades poderosos e items exclusivos

---

## Items del Shop

**Cosméticos — Botones (Coins)**
| Item | Precio |
|---|---|
| Botón de fuego | 500 coins |
| Botón de hielo | 500 coins |
| Botón dorado | 2.000 coins |

**Cosméticos — Fondos (Coins)**
| Item | Precio |
|---|---|
| Fondo galaxy | 1.000 coins |
| Fondo lava | 1.000 coins |
| Fondo matrix | 2.500 coins |

**Cosméticos — Sonidos (Coins)**
| Item | Precio |
|---|---|
| Sonido "boom" | 300 coins |
| Sonido "laser" | 300 coins |

**Música — Tracks (Coins)**
| Track | Precio | Estilo |
|---|---|---|
| Neon Rush | 1.500 coins | Electrónico intenso |
| Chill Tap | 1.500 coins | Lo-fi relajado |
| 8bit Fury | 1.500 coins | Retro videogame |
| Dark Pulse | 3.000 coins | Heavy/oscuro |

**Upgrades funcionales (Coins)**
| Upgrade | Precio | Efecto |
|---|---|---|
| Auto-clicker I | 5.000 coins | +1 click cada 5 seg |
| Auto-clicker II | 20.000 coins | +1 click cada 2 seg |
| Auto-clicker III | 75.000 coins | +1 click por segundo |
| Multiplicador x2 | 10.000 coins | Cada tap vale 2 clicks |
| Multiplicador x5 | 50.000 coins | Cada tap vale 5 clicks |
| Combo bonus | 8.000 coins | Tapear rápido da bonus temporales |

**Items exclusivos (Gems)**
| Item | Precio | Descripción |
|---|---|---|
| Botón legendario | 50 gems | Animación única |
| Fondo exclusivo | 30 gems | Solo con gems |
| Multiplicador x10 | 100 gems | Cada tap vale 10 clicks |
| Racha protegida | 20 gems | No perdés la racha por un día |
| Cosmic Wave (música) | 50 gems | Track épico exclusivo |

**Tracks incluidos gratis (desde el inicio)**
- 2 o 3 tracks base: uno chill, uno intenso, uno retro/8bit

---

## Música
- On/Off y control de volumen
- Selector de track desde el inventario
- Funciona en todos los modos
- Modo Clásico → sugiere track chill automáticamente
- Modo Tiempo → sugiere track intenso automáticamente
- El jugador puede overridear desde el inventario

---

## Features adicionales
- **Leaderboards**: ranking global de clicks totales, ranking del modo tiempo por duración, ranking del modo clásico
- **Logros / achievements**: "Primer click", "1000 clicks", "Click millonario", etc.
- **Racha diaria**: bonificación por entrar X días seguidos
- **Haptic feedback** en cada tap
- **Misiones diarias**: "Hacé 500 clicks hoy", "Ganá 3 partidas de modo tiempo" → recompensa coins
- **Prestige / Rebirth**: resetear contador a cambio de moneda premium permanente con bonificaciones
- **Eventos temporales**: "Este fin de semana los clicks valen el doble"

---

## Monetización
- Ads entre partidas del modo tiempo (no invasivo)
- Compras de gems con dinero real para acelerar progreso
- "Remove ads" por pago único ($0.99 / $1.99)

---

## Estética
- Dark mode
- Colores neón (púrpura / cyan)
- Tipografía bold
- Animaciones en cada tap
- Sensación intensa y moderna

---

## Stack tecnológico
- **React Native + Expo** (un solo código para iOS y Android)
- **Zustand** para estado global
- Almacenamiento local para guardar progreso del jugador

---

## Estructura de archivos
```
TapFury/
├── app/
│   ├── index.jsx           # Pantalla de inicio (elegir modo)
│   ├── fury.jsx            # Modo Fury
│   ├── classic.jsx         # Modo Clásico
│   ├── timechallenge.jsx   # Modo Tiempo
│   ├── shop.jsx            # Tienda
│   └── inventory.jsx       # Inventario / equipar
├── components/
│   ├── TapButton.jsx       # El botón principal
│   ├── Counter.jsx         # El contador
│   └── CoinDisplay.jsx     # Monedas actuales
├── store/
│   └── gameStore.js        # Estado global (Zustand)
├── data/
│   └── items.js            # Catálogo de items del shop
└── utils/
    └── storage.js          # Guardar/cargar datos locales
```

---

## Para arrancar (desde la compu de casa)
```bash
npx create-expo-app@latest TapFury --template blank
cd TapFury
npx expo start
```
Probar en el celular via app **Expo Go**.
