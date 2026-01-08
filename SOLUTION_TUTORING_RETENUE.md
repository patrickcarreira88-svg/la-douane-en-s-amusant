# 🏗️ ARCHITECTURE TECHNIQUE - SOLUTION RETENUE

## 📐 Vue d'Ensemble Système

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           index.html (App Main)                      │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  TutoringModule                                │  │   │
│  │  │  - init()                                      │  │   │
│  │  │  - checkViewed()                              │  │   │
│  │  │  - showModal()                                │  │   │
│  │  │  - validateEmail()                            │  │   │
│  │  │  - sendWebhook()                              │  │   │
│  │  │  - closeModal()                               │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                        ↓                               │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  DOM + CSS                                     │  │   │
│  │  │  #tutoring-modal                              │  │   │
│  │  │  - Display: none/flex                         │  │   │
│  │  │  - Animation: slide-in                        │  │   │
│  │  │  - Responsive: mobile/desktop                 │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                        ↓                               │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  localStorage                                  │  │   │
│  │  │  Key: "tutoring"                              │  │   │
│  │  │  - viewed: boolean                            │  │   │
│  │  │  - email: string                              │  │   │
│  │  │  - emailSent: boolean                         │  │   │
│  │  │  - viewedAt: timestamp                        │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                        ↓ POST                                │
│            (Sync + Error Handling)                          │
│                        ↓                                     │
└─────────────────────────────────────────────────────────────┘
                        ↓ HTTPS
          ┌─────────────────────────────┐
          │   BACKEND (API Server)      │
          ├─────────────────────────────┤
          │                             │
          │  POST /api/tutoring-email   │
          │  ├─ Validate email          │
          │  ├─ Check duplicates        │
          │  ├─ Store DB / Log          │
          │  └─ Return 200 OK           │
          │                             │
          └─────────────────────────────┘
```

---

## 🎯 SPÉCIFICATIONS FONCTIONNELLES

### Module Tutoring (Client-Side)

#### 1. Initialisation

```javascript
TutoringModule.init(options)

/**
 * Options:
 * - webhookUrl (string): endpoint POST
 * - storageKey (string): localStorage key
 * - modalId (string): HTML element id
 * - debug (boolean): logs verbose
 */
```

**Flux:**
1. Vérifie localStorage
2. Si `viewed === true` → Modale cachée
3. Si `viewed !== true` → Affiche modale
4. Setup event listeners

#### 2. Modale Affichage

**Structure:**
```
┌────────────────────────────┐
│ × (Close button)           │
├────────────────────────────┤
│                            │
│ 🎓 Bienvenue              │
│                            │
│ Texte intro               │
│                            │
│ [Email input]             │
│ (optionnel)               │
│                            │
│ ☐ J'accepte conditions    │
│                            │
│ [Commencer] [Fermer]      │
│                            │
└────────────────────────────┘
```

**Comportement:**
- Affichée au-dessus de l'app (z-index: 10000)
- Responsive (mobile/desktop)
- Animation: slide in (300ms)
- Overlay semi-transparent (backdrop)
- Draggable sur desktop (optionnel)

#### 3. Validation Email

**Règles:**
```javascript
// Vide = OK (optionnel)
if (email === '') return true

// Format valide
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
return emailRegex.test(email)

// Pas d'erreurs réseau
// Pas de caractères dangereux (XSS)
```

**Erreurs:**
```
❌ "invalid" → "Format email invalide"
❌ "test@" → "Format email invalide"
✅ "" → Accepté
✅ "user@domain.com" → Accepté
```

#### 4. Envoi Webhook

```javascript
async sendWebhook(email) {
  const payload = {
    email: email,
    source: "lms-brevet-tutoring",
    timestamp: new Date().toISOString(),
    userData: {
      nickname: App.user?.nickname,
      totalPoints: App.user?.totalPoints
    }
  }
  
  try {
    const response = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000) // Timeout 3s
    })
    
    if (response.ok) {
      localStorage.setItem('tutoring', JSON.stringify({
        viewed: true,
        email: email,
        emailSent: true,
        viewedAt: new Date().toISOString()
      }))
      return true
    } else {
      console.error(`Webhook failed: ${response.status}`)
      // Continue anyway (fallback)
      return false
    }
  } catch (error) {
    console.error('Webhook error:', error)
    // Continue anyway (fallback)
    return false
  }
}
```

**Comportement:**
- Sync (await)
- Timeout 3s max
- Retry 1x si timeout
- Continue même si échoue (graceful degradation)
- Log tous les erreurs

#### 5. Persistence localStorage

```javascript
localStorage["tutoring"] = {
  "viewed": true,              // boolean
  "email": "user@test.com",    // string ou null
  "emailSent": true,           // boolean
  "viewedAt": "2026-01-07T..."  // ISO timestamp
}
```

**Durée:**
- Persiste jusqu'à localStorage clear
- ~5-10 ans de durée de vie
- Peut être supprimé manuellement

---

## 🎨 HTML/CSS STRUCTURE

### HTML

```html
<!-- MODALE TUTORING -->
<div id="tutoring-modal" class="tutoring-modal" style="display: none;">
  <div class="tutoring-overlay"></div>
  
  <div class="tutoring-content">
    <button class="tutoring-close">×</button>
    
    <div class="tutoring-body">
      <h2 class="tutoring-title">🎓 Bienvenue</h2>
      <p class="tutoring-description">
        Découvrez la nouvelle plateforme de formation douane.
      </p>
      
      <div class="tutoring-form">
        <input
          type="email"
          id="tutoring-email"
          class="tutoring-input"
          placeholder="Email (optionnel)"
        />
        
        <div class="tutoring-error" style="display: none;">
          Format email invalide
        </div>
        
        <label class="tutoring-checkbox">
          <input type="checkbox" id="tutoring-agree">
          <span>J'ai lu les conditions</span>
        </label>
      </div>
      
      <div class="tutoring-actions">
        <button class="tutoring-btn tutoring-btn--primary">
          Commencer
        </button>
        <button class="tutoring-btn tutoring-btn--secondary">
          Fermer pour l'instant
        </button>
      </div>
    </div>
  </div>
</div>
```

### CSS (Synthétisé)

```css
.tutoring-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 300ms ease-out;
}

.tutoring-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.tutoring-content {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 300ms ease-out;
}

.tutoring-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.tutoring-input:focus {
  outline: none;
  border-color: #667EEA;
}

.tutoring-input:invalid {
  border-color: #FF6B6B;
}

.tutoring-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tutoring-btn--primary {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  color: white;
}

.tutoring-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.tutoring-btn--secondary {
  background: #F5F5F5;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .tutoring-content {
    width: 95%;
    padding: 24px;
  }
  
  .tutoring-btn {
    width: 100%;
    margin-bottom: 10px;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 🔌 API Webhook

### Request

```http
POST /api/tutoring-email HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 247

{
  "email": "utilisateur@example.com",
  "source": "lms-brevet-tutoring",
  "timestamp": "2026-01-07T15:30:45.123Z",
  "userData": {
    "nickname": "Apprenti Douanier",
    "totalPoints": 1250
  }
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Email reçu avec succès",
  "subscriptionId": "sub_12345",
  "timestamp": "2026-01-07T15:30:45.456Z"
}
```

### Error Responses

```json
// 400 Bad Request
{
  "success": false,
  "message": "Email invalide",
  "code": "INVALID_EMAIL"
}

// 409 Conflict
{
  "success": false,
  "message": "Email déjà enregistré",
  "code": "DUPLICATE_EMAIL"
}

// 500 Server Error
{
  "success": false,
  "message": "Erreur serveur",
  "code": "SERVER_ERROR"
}
```

---

## 📊 État Local

```javascript
const TutoringModule = {
  config: {
    webhookUrl: String,
    storageKey: String,
    modalId: String,
    debug: Boolean
  },
  
  state: {
    viewed: Boolean,
    email: String | null,
    emailSent: Boolean,
    viewedAt: String | null,
    error: String | null
  },
  
  methods: {
    init(options),
    checkTutoringViewed(),
    showModal(),
    closeModal(),
    validateEmail(email),
    submitEmail(email),
    sendEmail(email),
    handleError(error),
    log(message)
  }
}
```

---

## 🚦 State Machine

```
┌─────────────┐
│   IDLE      │
└──────┬──────┘
       │ init()
       ▼
┌─────────────────┐
│ CHECKING_VIEWED │
└──────┬──────────┘
       │
   ┌───┴────┐
   │         │
   ▼         ▼
SHOWED    HIDDEN
MODAL     (already
(first    viewed)
visit)
   │
   │ user input
   ▼
┌──────────────┐
│ VALIDATING   │
│ EMAIL        │
└──┬───────┬───┘
   │       │
   ▼       ▼
SENDING  ERROR
EMAIL    (invalid)
   │      │
   │      └─────┐
   ▼            ▼
┌─────────┐  ┌──────┐
│ CLOSING │  │ INPUT│
│ MODAL   │  │ AGAIN│
└─────────┘  └──────┘
   │
   ▼
DONE
```

---

## 🔒 Sécurité

### Input Validation

```javascript
// Email regex (RFC 5322 simplified)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// XSS Protection
const sanitizeInput = (str) => {
  const div = document.createElement('div')
  div.textContent = str  // textContent prevents XSS
  return div.innerHTML
}

// CSRF Token (simple webhook)
// No additional protection needed for POST webhooks
```

### Network Security

```
HTTPS Mandatory
├─ TLS 1.2+ only
├─ Certificate pinning (optional)
└─ HSTS header required

CORS Configuration
├─ Origin: https://app.example.com
├─ Methods: POST
└─ Headers: Content-Type

Rate Limiting
├─ 10 requests / IP / minute
└─ 1000 requests / day
```

---

## 📦 Intégration Checklist

- [ ] Copier `tutoring-module.js` → `/js/`
- [ ] Copier `tutoring-modal.html` → `/components/` ou inline
- [ ] Ajouter `<link>` CSS dans `<head>`
- [ ] Ajouter `<script>` JS avant `</body>`
- [ ] Configurer `CONFIG.webhookUrl`
- [ ] Tester localStorage
- [ ] Tester modale affichage
- [ ] Tester webhook
- [ ] Configurer CORS backend
- [ ] Mettre en place monitoring

---

**Spécification révisée:** 7 Janvier 2026  
**Statut:** Ready for Implementation ✅
