# Coffee Vocab Game (GitHub Pages Ready)

Juego 3D sencillo para aprender vocabulario de cafetería. Sin bundler. Listo para **GitHub Pages**.

## Cómo desplegar en GitHub Pages
1. Crea un repositorio en GitHub (p. ej.: `coffee-vocab-game`).
2. Sube todos los archivos de esta carpeta a la **raíz** del repo.
3. Asegúrate de que el archivo **`.nojekyll`** esté presente (evita transformaciones).
4. En GitHub: **Settings → Pages → Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main` / `/root`
5. Espera a que se publique. La URL será algo como:
   `https://<tu-usuario>.github.io/<nombre-repo>/`

## Ejecutar en local (opcional)
- Con Python 3:
  ```bash
  python -m http.server 8000
  ```
  y abre `http://localhost:8000`.

## Notas técnicas
- Usa Three.js desde CDN (sin empaquetador).
- Módulos ES (`.mjs`) servidos como estático.
- Sin `import.meta`, compatibilidad máxima con hosting estático.

¡Diviértete!
