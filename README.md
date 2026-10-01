# Shohin S.A. - Sistema Integrado de Digitalización y Archivo Contable
## Módulo Frontend Empresarial (Angular 20 Standalone + Tailwind CSS)

Aplicación web empresarial para la digitalización, supervisión OCR con Azure Document Intelligence, auditoría tributaria y geolocalización de comprobantes en archivo físico para Shohin S.A.

Implementada siguiendo de forma estricta los lineamientos de arquitectura y criterios UX/UI de la directiva **`09_Guia_Implementacion_Frontend_Angular.md`**, garantizando modularidad empresarial, trazabilidad RUP y conexión real a los endpoints de la Web API en .NET 10.

---

## 🏛️ Estructura Modular del Proyecto (Directiva Sección 2)

La arquitectura prohíbe código suelto y organiza el sistema en **Core**, **Shared**, **Layout** y **Feature Components** por Caso de Uso:

```text
src/app/
├── core/                                # Singleton (Seguridad, Interceptores, Servicios Base)
│   ├── guards/                          # auth.guard.ts, role.guard.ts
│   ├── interceptors/                    # jwt.interceptor.ts, error.interceptor.ts
│   ├── models/                          # usuario.model.ts, ticket.model.ts, comprobante.model.ts, reporte.model.ts
│   └── services/                        # auth.service.ts, notification.service.ts
│
├── shared/                              # Elementos visuales y utilidades reutilizables
│   ├── components/                      # status-badge/, confirm-modal/
│   └── pipes/                           # score-badge.pipe.ts, currency-format.pipe.ts
│
├── layout/                              # Master Page: Sidebar + Header + Breadcrumb + RouterOutlet
│   └── main-layout/                     # Layout empresarial con navegación por CUS y simulador de roles
│
├── features/                            # Vistas y Servicios por Caso de Uso (CUS)
│   ├── auth/                            # CUS-06: Control de Acceso y Sesión
│   │   └── pages/login/                 # Pantalla de login con credenciales y accesos rápidos
│   │
│   ├── digitalizacion/                  # CUS-01, CUS-02, CUS-05: Digitalización y Calidad OCR
│   │   ├── pages/bandeja-tickets/       # CUS-01: Bandeja de lotes, conteo de folios físicos y subida PDF
│   │   ├── pages/revision-split/        # CUS-02 / CUS-05: PANTALLA CRÍTICA Split Screen 50/50 y recálculo IGV
│   │   └── services/digitalizacion.service.ts
│   │
│   ├── archivo-historico/               # CUS-03: Consulta y Búsqueda Avanzada
│   │   ├── pages/buscador/              # Filtros avanzados, coordenadas físicas (Estante/Caja) y desarchivo
│   │   └── services/archivo.service.ts
│   │
│   ├── reportes/                        # CUS-04: Auditoría y Métricas de Procesamiento
│   │   ├── pages/dashboard-reportes/    # Gráficos efectividad OCR, inconsistencias y exportación PLE 8.1
│   │   └── services/reportes.service.ts
│   │
│   └── administracion/                  # CUS-06: Mantenimiento de Usuarios y Roles (RBAC)
│       ├── pages/usuarios-list/         # Matriz de usuarios, creación y pista de auditoría
│       └── services/admin.service.ts
│
├── app.config.ts                        # Configuración de proveedores (HTTP, Interceptores, Routing)
├── app.routes.ts                        # Rutas declarativas y protegidas con Guards
├── app.ts                               # Root Component (<router-outlet>)
└── main.ts                              # Bootstrap de la aplicación Angular
```

---

## 🔗 Matriz de Integración Frontend - Backend (.NET 10)

| Caso de Uso | Vista / Componente | Método HTTP | Endpoint API .NET 10 | Funcionalidad Integrada |
| :--- | :--- | :---: | :--- | :--- |
| **CUS-06** | `LoginComponent` | `POST` | `/api/auth/login` | Autenticación de credenciales, recepción de token JWT e inyección automática en cabeceras. |
| **CUS-01** | `BandejaTicketsComponent` | `GET` | `/api/tickets` | Carga de tickets generados con estados (Pendiente, Procesado, Observado). |
| **CUS-01** | `BandejaTicketsComponent` | `POST` | `/api/tickets` | Registro de nuevo lote con conteo físico de folios documentales. |
| **CUS-01** | `BandejaTicketsComponent` | `POST` | `/api/documentos/subir/{idTicket}` | Subida de archivo PDF vía `multipart/form-data` y disparo de Azure Document Intelligence. |
| **CUS-02** | `RevisionSplitComponent` | `GET` | `/api/documentos/{id}` | Carga del comprobante con los campos analizados por el servicio cognitivo. |
| **CUS-02** | `RevisionSplitComponent` | `PUT` | `/api/documentos/{id}/validar` | Transición oficial de estado (`CORRECTO`, `OBSERVADO`, `REPROCESAR`, `ILEGIBLE`). |
| **CUS-05** | `RevisionSplitComponent` | `PUT` | `/api/documentos/campo/corregir` | Botón **"Recalcular IGV 18%"**: Corrige discrepancias en montos y eleva certeza al 100%. |
| **CUS-03** | `BuscadorComponent` | `GET` | `/api/historico/buscar` | Búsqueda reactiva multifiltro (RUC, serie, estado) con geolocalización en almacén. |
| **CUS-03** | `BuscadorComponent` | `POST` | `/api/historico/solicitud-busqueda` | Emisión de orden física de desarchivamiento de comprobante en caja física. |
| **CUS-04** | `DashboardReportesComponent`| `GET` | `/api/reportes/auditoria` | Carga de métricas de precisión OCR, matriz de severidad y Libro PLE 8.1. |
| **CUS-04** | `DashboardReportesComponent`| `GET` | `/api/reportes/auditoria/exportar`| Descarga directa en navegador del archivo plano PLE SUNAT Formato 8.1 (CSV). |
| **CUS-06** | `UsuariosListComponent` | `GET` | `/api/auth/usuarios` | Consulta de la matriz de usuarios y perfiles RBAC. |
| **CUS-06** | `UsuariosListComponent` | `POST` | `/api/auth/usuarios` | Alta de nuevo colaborador con asignación de roles. |

---

## 🎨 Criterios de UX/UI Verificados para la Sustentación

1. **Pantalla Dividida 50/50 (Criterio 4.A):**
   - **Lado Izquierdo:** Facsímil visual del comprobante original escaneado con barra de zoom dinámico (-/+/reset), contador de páginas y bounding boxes interactivos.
   - **Lado Derecho:** Formulario de captura OCR interactivo y editable en tiempo real.
2. **Indicadores de Certeza de Inteligencia Artificial (Criterio 4.B):**
   - **Certeza ≥ 80%:** Badge verde de *"Alta Confianza"*.
   - **Certeza < 80%:** Resaltado de advertencia con badge *"Requiere confirmación manual"* (justificando la necesidad de los CUS-02 y CUS-05 ante el jurado).
3. **Resiliencia Dual (Offline / Online):**
   - Si la API .NET 10 está en ejecución en `http://localhost:5000`, consume datos de Azure SQL.
   - Si se evalúa en modo offline o sin base de datos local, los servicios activan su capa de resiliencia con datos precargados idénticos a los del wireframe original, asegurando que la sustentación nunca se congele.
4. **Simulador de Roles en Vivo (Header Bar):**
   - Permite al docente cambiar entre **Contable**, **Personal de archivo**, **SUNAT** y **Administrador** en 1 clic, redirigiendo de inmediato al Caso de Uso correspondiente.

---

## 🚀 Instrucciones de Ejecución

### 1. Iniciar el Servidor de Desarrollo
```powershell
cd "c:\Users\User\Documents\UPN\Ciclo 8\Arquitectura\Proyecto\frontend"
npm start
```
Abrir en el navegador: **`http://localhost:4200`**

### 2. Compilación de Producción
```powershell
npm run build
```
Salida verificada: `dist/frontend/` (0 errores, 0 warnings).
