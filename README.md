# Analizador de Backtests MT4

Una aplicación web moderna para analizar y comparar el rendimiento de Expert Advisors (EAs) de MetaTrader 4. Permite subir reportes de backtest en formato HTML y generar rankings automáticos basados en múltiples métricas de rendimiento.

## Características

- 📊 **Análisis Automático**: Procesa reportes HTML de MT4 automáticamente
- 🏆 **Sistema de Ranking**: Calcula scores basados en múltiples métricas
- 📈 **Métricas Avanzadas**: Win rate, profit factor, drawdown, ratios de riesgo, etc.
- 🎨 **Interfaz Moderna**: Diseño limpio y responsive con shadcn/ui
- 🔍 **Filtros y Búsqueda**: Encuentra rápidamente las mejores EAs
- 📱 **Responsive**: Funciona en desktop y dispositivos móviles

## Tecnologías Utilizadas

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes de UI
- **Lucide React** - Iconos
- **React Context** - Estado global

## Instalación

1. **Clona el repositorio**

   ```bash
   git clone <url-del-repositorio>
   cd analizador-backtest
   ```

2. **Instala las dependencias**

   ```bash
   npm install
   ```

3. **Ejecuta el servidor de desarrollo**

   ```bash
   npm run dev
   ```

4. **Abre tu navegador**
   ```
   http://localhost:3000
   ```

## Uso

### 1. Agregar Símbolos

- Haz clic en "Nuevo" en la barra lateral
- Ingresa el nombre del símbolo (ej: EURUSD, GBPUSD)
- Opcionalmente agrega una descripción

### 2. Subir Backtests

- Selecciona un símbolo de la barra lateral
- Haz clic en "Subir Backtest" en el header
- Ingresa el nombre de la EA
- Arrastra o selecciona el archivo HTML del reporte de MT4
- Haz clic en "Subir Backtest"

### 3. Ver Rankings

- La tabla principal muestra automáticamente el ranking de EAs
- Usa los filtros de búsqueda para encontrar EAs específicas
- Ordena por diferentes métricas haciendo clic en los encabezados

## Sistema de Scoring

El sistema calcula un score de 0-1 basado en las siguientes métricas:

- **Win Rate (25%)**: Porcentaje de operaciones ganadoras
- **Profit Factor (25%)**: Ratio de ganancias vs pérdidas
- **Max Drawdown (15%)**: Máxima caída del capital (menor es mejor)
- **Consecutive Wins (10%)**: Racha de victorias consecutivas
- **Consecutive Losses (10%)**: Racha de pérdidas consecutivas (menor es mejor)
- **Sharpe Ratio (5%)**: Ratio de riesgo/retorno ajustado
- **Recovery Factor (5%)**: Capacidad de recuperación
- **Risk/Reward Ratio (5%)**: Ratio de riesgo/beneficio

### Clasificación de Scores

- **0.8-1.0**: Excelente (Verde)
- **0.6-0.79**: Bueno (Amarillo)
- **0.4-0.59**: Regular (Naranja)
- **0.0-0.39**: Pobre (Rojo)

## Estructura del Proyecto

```
src/
├── app/                 # Páginas de Next.js
├── components/          # Componentes React
│   ├── ui/             # Componentes de shadcn/ui
│   ├── AppLayout.tsx   # Layout principal
│   ├── Sidebar.tsx     # Barra lateral
│   ├── EARankingTable.tsx # Tabla de rankings
│   └── BacktestUpload.tsx # Subida de archivos
├── context/            # Contexto de React
│   └── AppContext.tsx  # Estado global
├── lib/                # Utilidades
│   ├── utils.ts        # Utilidades generales
│   └── scoring.ts      # Lógica de scoring
└── types/              # Tipos TypeScript
    └── index.ts        # Interfaces y tipos
```

## Formato de Archivos Soportados

La aplicación procesa reportes HTML de MetaTrader 4 que contengan las siguientes métricas:

- Total Trades
- Winning Trades / Losing Trades
- Win Rate
- Initial Balance / Final Balance
- Total Profit
- Profit Factor
- Expected Payoff
- Maximum Drawdown
- Consecutive Wins / Losses

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Verificar código

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

Desarrollado con ❤️ para la comunidad de trading
# AnalizadorBacktest
