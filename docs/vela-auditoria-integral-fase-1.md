# VELA — AUDITORÍA INTEGRAL, FASE 1 (2026-10-21)

## Alcance y límites
Revisión estática de archivos de GitHub en `main` y antecedentes de capturas/consultas de Supabase aportadas por el propietario. No se ha ejecutado build, lint, pruebas de integración, ni consultas en `vela-staging`. Este informe no certifica cumplimiento.

## Hallazgos confirmados desde GitHub main

| ID | Prioridad | Evidencia | Hallazgo / acción |
|---|---|---|---|
| SEC-01 | CRÍTICA | `README.md` | Contiene un valor con prefijo `sb_secret_`. Tratar como secreto expuesto; confirmar revocación en Supabase, retirar de archivos y considerar historial Git. No reproducir valor en informes. |
| SEC-02 | CRÍTICA | `src/App.tsx` | Rutas `/admin`, `/admin/audit-logs`, `/admin/retention`, `/admin/compliance` no muestran guardas de autorización. Verificar protección dentro de páginas y RLS; agregar control de rutas y servidor. |
| BUILD-01 | ALTA | `src/components/AppLayout.tsx` y árbol Git `main` | Importa `FamilySwitcher`, `CreateFamilyModal`, `FamilyDashboard` y otros componentes no presentes en `src/components` del árbol. Alta probabilidad de build roto; ejecutar `npm ci && npm run build` en CI. |
| PRIV-01 | ALTA | `src/lib/supabase-client.ts` | `uploadAudio` usa `getPublicUrl` en bucket recordings. Revisar visibilidad de bucket, políticas y acceso familiar; usar bucket privado + URLs firmadas cuando corresponda. |
| MVP-01 | ALTA | `src/contexts/VelaContext.tsx` | `processVelaCommand` espera un segundo y devuelve `Processed: ...`; no es procesamiento real de comandos ni recuperación estructurada. |
| AUTH-01 | CONFIRMADO | `src/main.tsx` | `AuthProvider` sí envuelve `App`. Corregir auditorías anteriores que decían lo contrario. |
| DATA-01 | MEDIA | `src/lib/supabase-client.ts` | `getFamilyMembers` filtra por `user_id`; revisar compatibilidad con acceso multiusuario por `family_id`. |
| UX-01 | MEDIA | `src/pages/Dashboard.tsx` y `src/App.tsx` | Dashboard navega a rutas como `/recordings`, `/photos`, `/family` no declaradas en `App.tsx`. |
| QA-01 | ALTA | Árbol de GitHub `main`, `package.json` | Hay scripts build/lint y dependencias de test, pero no se encontraron pruebas de aplicación en el árbol de 59 archivos. El único workflow detectado es de iOS/DeviceFarm; CI de web por verificar. |

## Evidencia aportada sobre Supabase producción (capturas)
- `families`: trigger AFTER INSERT `on_family_created_create_roles` llama `create_default_roles_trigger()`.
- `create_default_roles_for_family(uuid)` crea Admin, Contributor y Viewer, luego actualiza `family_users.role_id` para miembros existentes.
- Dos familias de prueba tenían administradores con `role_id=NULL`. El propietario ejecutó un UPDATE con COMMIT y posteriormente verificó ambos como `CORRECTO`.
- `family_users` tenía una política INSERT `Users can join families` que permitía autoinscripción; **no hay evidencia de que se haya retirado en producción**.
- `custom_roles` tiene `UNIQUE(family_id,name)`; `family_users` tiene `UNIQUE(family_id,user_id)`.
- `vela-staging` existe según el propietario, pero no se ha inspeccionado ni configurado aquí.

## Orden recomendado de trabajo
1. Confirmar revocación del secreto expuesto y revisar historial Git; no pegar claves en chat.
2. Añadir CI de build/lint y resolver imports inexistentes.
3. Diseñar autorización real y modelo de familias; revisar todas las políticas RLS.
4. Construir migraciones versionadas de esquema, roles, invitaciones y memoria; probar solo en `vela-staging`.
5. Probar casos de dos familias, invitaciones, acceso cruzado, audio privado y recuperación de memoria.
6. Incorporar MVP de hechos estructurados, consulta, edición y fuente; voz después.
7. Establecer criterios de publicación, respaldo, recuperación y monitoreo.

## Solicitud mínima para fase 2 Supabase
Ejecutar **solo SQL SELECT** en `vela-staging` para inventario de tablas/políticas/triggers. No copiar datos familiares reales ni secretos. Confirmar proyecto visible en Dashboard antes de cada ejecución. No correr scripts de producción en staging sin inspeccionar dependencias.
