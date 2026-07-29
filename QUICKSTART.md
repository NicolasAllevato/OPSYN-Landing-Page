# QUICKSTART - Inicio Rápido

Guía rápida para empezar a trabajar con la landing page de OPSYN.

## 🚀 Setup Inicial (2 min)

### 1. Descargar/Clonar
```bash
git clone <repository>
cd OPSYN-Pagina-web
```

### 2. Abrir Localmente
**Opción A: Python (Recomendado)**
```bash
python -m http.server 8000
# Abrir http://localhost:8000 en navegador
```

**Opción B: Node.js**
```bash
npm install -g http-server
http-server
```

**Opción C: Live Server (VS Code)**
- Instalar extensión "Live Server"
- Click derecho en `index.html` → "Open with Live Server"

### 3. Verificar
Abrir en navegador → Debería verse landing completa bilingüe

---

## 📝 Tareas Comunes (1-5 min)

### Cambiar Textos

**Editar en `index.html`:**
```html
<!-- Encontrar y cambiar el texto en la sección -->
<h1 data-i18n="heroTitle">
  ← Cambiar este texto
</h1>
```

**O cambiar traducciones en `js/main.js`:**
```javascript
const TRANSLATIONS = {
  es: {
    heroTitle: 'Tu nuevo título aquí',  // ← Cambiar
  }
};
```

### Cambiar Colores

**En `css/styles.css`:**
```css
:root {
  --primary-accent: #9434D4;    /* ← Color morado, cambiar aquí */
  --cyan: #79FFFF;              /* ← Color cyan, cambiar aquí */
}
```

### Cambiar Logos

**Opción A: Reemplazar archivos**
1. Ir a carpeta `uploads/`
2. Reemplazar con tus logos (mantener nombres)

**Opción B: Cambiar rutas en `index.html`**
```html
<img src="./ruta/tu-logo.png" alt="OPSYN">
```

### Cambiar Imágenes

**Ir a carpetas:**
- `uploads/` - Logos
- `assets/` - Blog y portfolio

Y reemplazar las imágenes PNG manteniendo nombres.

### Agregar Contacto Real

**En `index.html`, footer:**
```html
<a href="mailto:tu-email@domain.com">tu-email@domain.com</a>
<a href="https://instagram.com/tu-usuario">Instagram</a>
```

---

## 🌐 Idiomas

### Cambiar idioma predeterminado

En `js/main.js`, línea ~241:
```javascript
let currentLang = localStorage.getItem('opsyn-lang') || 'es';
// Cambiar 'es' a 'en' para inglés como default
```

### Agregar nueva traducción

1. En `js/main.js`, agregar key:
```javascript
const TRANSLATIONS = {
  es: {
    nuevoTexto: 'Mi nuevo texto en español',
  },
  en: {
    nuevoTexto: 'My new text in English',
  }
};
```

2. En `index.html`, usar:
```html
<p data-i18n="nuevoTexto">Fallback text</p>
```

---

## 🎨 Personalización Rápida

### Tema Corporativo (Kit de Colores)

Crear tu propio tema en `css/styles.css`:

```css
/* Tema Rosa */
:root {
  --primary-accent: #E71E63;
  --secondary-accent: #C2185B;
  --cyan: #FF1493;
  --teal: #F06292;
}

/* Tema Azul */
:root {
  --primary-accent: #1976D2;
  --secondary-accent: #1565C0;
  --cyan: #64B5F6;
  --teal: #42A5F5;
}

/* Tema Verde */
:root {
  --primary-accent: #4CAF50;
  --secondary-accent: #388E3C;
  --cyan: #81C784;
  --teal: #66BB6A;
}
```

### Cambiar Fuentes

En `index.html` `<head>`:
```html
<!-- Cambiar Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Luego en `css/styles.css`:
```css
:root {
  --font-primary: 'Poppins', sans-serif;
  --font-secondary: 'Poppins', sans-serif;
}
```

---

## 📱 Testing Rápido

### En Navegador (DevTools)

1. Abrir Chrome/Firefox → F12
2. Click en icono responsivo (☎️)
3. Testear en:
   - iPhone 12 (390x844)
   - iPad (1024x1366)
   - Desktop (1920x1080)

### Checklist Rápido
- [ ] Logo visible
- [ ] Textos legibles
- [ ] Botones clickeables
- [ ] Formulario funciona
- [ ] Idioma cambia (click ES/EN)
- [ ] Scroll suave
- [ ] Sin errores en console (F12)

---

## 🚢 Deploy (Opciones)

### Vercel (5 min)
```bash
npm install -g vercel
vercel
# Seguir prompts
```

### Netlify (5 min)
1. Ir a https://netlify.com
2. Conectar GitHub
3. Seleccionar rama
4. Deploy automático

### GitHub Pages (5 min)
1. Push a `main` branch
2. Settings → Pages
3. Seleccionar `main` como source
4. Habilitar HTTPS

### Servidor Propio (15 min)
1. Subir archivos vía FTP
2. Configurar HTTPS (Let's Encrypt)
3. Configurar gzip en servidor

---

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Imágenes no cargan | Verificar rutas en HTML (F12 → Network) |
| Textos no traducen | Verificar `data-i18n` atributo |
| Animaciones lentas | Abrir DevTools → Performance |
| Formulario no funciona | Verificar console (F12) para errores |
| Estilos no aplican | Hard refresh (Ctrl+Shift+R) |

---

## 📚 Documentación

- **README.md** - Overview general
- **GUÍA_USO.md** - Personalización detallada
- **ESTRUCTURA.md** - Documentación técnica
- **CHANGELOG.md** - Historial de versiones

---

## 💡 Tips Pro

✨ Usar **VS Code Extensions:**
- Live Server
- Prettier (formatear código)
- Thunder Client (testear APIs)

✨ **Keyboard Shortcuts:**
- F12 - DevTools
- Ctrl+Shift+R - Hard refresh
- Ctrl+F - Search en página

✨ **Performance Tips:**
- Usar DevTools → Performance para grabar sesiones
- Usar Lighthouse (DevTools) para auditorías
- Checklist: Imágenes < 100KB, CSS minificado

✨ **Git Workflow:**
```bash
git status                    # Ver cambios
git add .                     # Stage cambios
git commit -m "msg"           # Commit
git push origin main          # Push
```

---

## 📞 Soporte

- 📧 Email: hola@opsyn.com
- 🐛 Issues: GitHub
- 💬 Preguntas: GitHub Discussions

---

## Siguientes Pasos

1. ✅ Setup local completado
2. 📝 Personaliza contenido (textos, colores, logos)
3. 📱 Test en mobile/desktop
4. 🚀 Deploy a producción
5. 📊 Agregar Analytics
6. 📧 Integrar formulario

---

**Versión:** 1.0.0  
**Última actualización:** 28 de julio de 2026
