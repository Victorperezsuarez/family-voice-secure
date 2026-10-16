# VELA — Registro maestro del proyecto

**Actualizado:** 2026-10-13  
**Repositorio:** `Victorperezsuarez/family-voice-secure`  
**Rama de trabajo:** `audit/mvp-security-foundation`  
**Pull request:** [#1 — Audit/mvp security foundation](https://github.com/Victorperezsuarez/family-voice-secure/pull/1)  
**Estado:** MVP en construcción; no apto todavía para datos familiares reales.

> Este documento distingue **implementado**, **verificado** y **pendiente**. Una compilación exitosa no equivale a una auditoría de seguridad aprobada.

## 1. Visión del producto

Vela es una memoria familiar compartida, privada y orientada a la voz. Debe permitir a miembros autorizados guardar, consultar y corregir información familiar útil, asociada a personas, fechas, autores, fuentes y permisos.

La inteligencia artificial interpreta y recupera información; **la base de datos estructurada es la fuente de verdad**, no el historial de un chatbot.

**Hipótesis del MVP:** una familia obtiene valor real cuando puede guardar y recuperar información compartida de forma sencilla y fiable.

## 2. Alcance del MVP

- Crear una familia e invitar a otro adulto autorizado.
- Crear perfiles de personas de la familia, incluso sin cuenta de acceso.
- Guardar información estructurada por familia y persona.
- Consultar recuerdos y mostrar su fuente.
- Corregir información preservando trazabilidad.
- Incorporar entrada y consulta por voz después de validar el flujo básico de memoria.

**Fuera del MVP inicial:** activación permanente por palabra clave, clonación de voz, reconocimiento facial avanzado, búsqueda masiva de fotos, integraciones amplias de calendario/correo, módulos clínicos o empresariales y automatizaciones complejas.

## 3. Estado técnico confirmado

| Elemento | Estado | Evidencia / nota |
| --- | --- | --- |
| React + TypeScript + Vite + Supabase | Implementado | Base actual del repositorio |
| `AuthContext.tsx` | Implementado, pruebas funcionales pendientes | Inicio, registro, cierre y recuperación de contraseña mediante Supabase Auth |
| `AuthProvider` en `App.tsx` | Implementado | Revisado en código |
| `ProtectedRoute.tsx` | Implementado | Comprueba carga y sesión; no verifica roles |
| Rutas autenticadas agrupadas | Implementado | Dashboard, billing, profile, admin y otras rutas dentro de ProtectedRoute |
| GitHub Actions — Verify Vela Build #8 | **Verificado: éxito** | Captura de ejecución exitosa aportada en la conversación |
| `families` | Estructura examinada | Identificador de familia y creador |
| `family_users` | Estructura examinada | Relación familia/usuario; roles admin, contributor y view-only |
| `family_members` | Estructura examinada | Perfiles familiares con `family_id`; cuenta de usuario opcional |
| Políticas RLS de Supabase | **Pendiente de verificación final** | Se trabajaron previamente; no asumir estado correcto sin comprobar políticas efectivas |
| Autorización de administradores | Pendiente | Autenticación no implica permiso de administración |
| Aislamiento entre familias | Pendiente | Requiere RLS y pruebas con usuarios de familias distintas |
| Almacenamiento privado de audio | Pendiente | Revisar accesos y evitar URL públicas para contenido sensible |
| Memorias estructuradas y versiones | Pendiente | Diseñar esquema y migraciones |
| Pruebas de flujos reales | Pendiente | El build no valida comportamiento ni seguridad |

## 4. Decisiones técnicas

1. **Reutilizar** `families`, `family_users` y `family_members` antes de crear tablas duplicadas.
2. Separar **autenticación** (identidad), **autorización familiar** (membresía/rol) y **administración de plataforma**.
3. Usar `family_id` como frontera principal de acceso a información.
4. Mantener secretos y claves de servicio fuera del cliente Vite y del repositorio.
5. Conservar `main` sin cambios hasta revisar el PR y sus pruebas.
6. No habilitar ni modificar RLS masivamente sin revisar dependencias, políticas existentes y pruebas.
7. Priorizar memoria estructurada y correcciones auditables antes de añadir complejidad de voz e IA.

## 5. Riesgos y bloqueos

| Prioridad | Riesgo | Acción |
| --- | --- | --- |
| Crítica | Datos de distintas familias podrían quedar accesibles si RLS es insuficiente | Revisar políticas efectivas y probar aislamiento |
| Alta | Rutas `/admin` solo exigen sesión, no rol administrativo | Implementar autorización apropiada |
| Alta | Código de frontend no sustituye políticas de base de datos | Probar accesos directos a Supabase |
| Alta | Flujo de audio puede utilizar almacenamiento o enlaces públicos | Revisar bucket y políticas antes de datos reales |
| Media | Componentes de demostración pueden aparentar funcionalidades terminadas | Identificar y ocultar funciones no operativas |
| Media | Advertencia de Node.js 20 obsoleto en Actions | Actualizar workflow tras estabilizar seguridad |

## 6. Próximas tareas, en orden

- [ ] **P1 — Verificar estado efectivo de RLS** de `families`, `family_users` y `family_members`, sin repetir auditorías documentadas ni modificar políticas a ciegas.
- [ ] **P2 — Definir autorización de roles** familiares y de plataforma; proteger rutas administrativas.
- [ ] **P3 — Probar aislamiento** con dos usuarios de familias distintas, incluyendo lectura y escritura.
- [ ] **P4 — Diseñar y versionar migraciones** de memorias estructuradas, fuentes e historial.
- [ ] **P5 — Implementar flujo mínimo** guardar → consultar → corregir memoria.
- [ ] **P6 — Incorporar voz** después de validar el flujo y las políticas de seguridad.
- [ ] **P7 — Probar funcionalmente** la aplicación antes de integrar el PR.

## 7. Reglas de continuidad para futuras sesiones

1. Leer este archivo y revisar el estado real de GitHub **antes** de pedir nuevas capturas o repetir pasos.
2. Diferenciar siempre: **observado**, **implementado**, **probado** y **supuesto**.
3. Trabajar una tarea concreta a la vez; registrar resultado, evidencia y próximo paso.
4. Si una comprobación ya se hizo, reutilizar su resultado; repetirla solo si hay cambios o falta evidencia relevante.
5. No registrar secretos, tokens, contraseñas, datos médicos ni información privada de familias.
6. Actualizar este documento después de cada hito; no marcar como terminado lo que solo compiló.
7. No integrar a `main` hasta que seguridad y pruebas necesarias estén revisadas.

## 8. Punto exacto de reanudación

**Último hito confirmado:** GitHub Actions `Verify Vela Build #8` completó la compilación exitosamente después de agrupar rutas autenticadas en `ProtectedRoute`.

**Próxima acción:** revisar la configuración RLS efectiva y documentar sus resultados, enfocándose en aislamiento entre familias. **No repetir la inspección de columnas** de las tablas ya estudiadas.

**Importante:** este documento es un registro de coordinación; sus afirmaciones deben contrastarse con el repositorio y Supabase cuando se retome una tarea sensible.
