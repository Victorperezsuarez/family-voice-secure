# Vela MVP — Eventos familiares, permisos y notificaciones (diseño v1)

**Estado:** diseño para revisión, no implementado. **Destino de pruebas:** proyecto Supabase independiente `vela-staging`. No ejecutar en producción.

## Caso de aceptación
El administrador A registra un evento escolar para un perfil infantil de su familia. El administrador B puede consultarlo inmediatamente después del commit. Los destinatarios autorizados reciben una notificación en la aplicación; el envío push/email es una etapa posterior. Una consulta «próximos eventos escolares de [perfil]» devuelve todos los eventos visibles futuros ordenados por `starts_at ASC, id ASC`. Usuarios de otra familia no pueden acceder ni recibir notificaciones.

## Decisiones
1. `families` y `family_users` son el perímetro de autorización. No confiar en `family_id`, `created_by` o `role` suministrados por el cliente sin comprobar `auth.uid()`.
2. Para MVP, eventos cotidianos compartidos por defecto con administradores y miembros autorizados. No inferir permisos a partir de la relación familiar («esposa», «madre»). Los miembros autorizados son cuentas autenticadas de `family_users`.
3. `memories.visibility` actual admite `family|admins`; `sensitivity` admite `normal|private|sensitive`. No usar estos campos como si ya implementaran acceso privado: las políticas actuales de lectura solo comprueban membresía. Definir ACL explícita antes de admitir memorias privadas/sensibles.
4. Separar autorización de notificación. Un fallo de entrega no debe impedir la consulta del evento guardado. Las notificaciones deben omitir datos sensibles en la vista previa.
5. No exponer texto original ni versiones previas mediante `memory_sources`/`memory_history` si la memoria principal no es visible.
6. No almacenar eventos exclusivamente en texto libre o respuestas del LLM. Usar fecha/hora tipadas y zona horaria IANA. No asumir que una fecha sin hora equivale a medianoche.

## Modelo de datos propuesto (no migración ejecutable)
- `family_events`: `id uuid PK`, `family_id uuid NOT NULL`, `member_id uuid NULL`, `created_by uuid NOT NULL`, `title text NOT NULL`, `category text NOT NULL`, `starts_at timestamptz NOT NULL`, `ends_at timestamptz NULL`, `timezone text NOT NULL`, `visibility text NOT NULL`, `sensitivity text NOT NULL`, `status text NOT NULL`, `created_at`, `updated_at`. Evaluar si se deriva de `memories` o se referencia a `memories.id`; evitar dos fuentes de verdad. `member_id` debe pertenecer a la misma `family_id`.
- `event_access_grants` (si se requieren destinatarios individuales): `event_id`, `user_id`, `granted_by`, `revoked_at`, restricción única y validación de membresía de la misma familia. Solo usuarios autorizados pueden conceder/revocar.
- `user_notifications`: `id`, `family_id`, `recipient_user_id`, `event_id`, `kind`, `created_at`, `read_at`, `delivery_status`. Idempotencia por evento/destinatario/tipo/versión. La política SELECT debe exigir `recipient_user_id=auth.uid()`; nunca permitir elegir arbitrariamente destinatario desde el cliente.
- `notification_outbox`: trabajo interno de entrega creado transaccionalmente con el evento o mediante trigger, procesado por backend autorizado con reintentos. No exponer tokens push al cliente ni aceptar destinatarios sin comprobar permisos.
- Índice sugerido `(family_id, starts_at, id)` para eventos activos. Reglas para eventos recurrentes, modificaciones y cancelaciones quedan fuera del MVP inicial.

## Seguridad obligatoria antes de aplicar
- Resolver la política de `family_users` que permite autoinscripción y el bootstrap de administradores, en staging.
- RLS en todas las tablas nuevas; permisos por operación (SELECT/INSERT/UPDATE/DELETE) y verificación de pertenencia a familia.
- La visibilidad efectiva debe aplicarse al evento, notificación, historial, adjuntos y fuentes. Revocar acceso debe impedir futuras consultas incluso si existe una notificación previa.
- Evitar filtraciones en RPC `SECURITY DEFINER`, `search_path`, logs, URLs públicas y Realtime.
- Revisar consistencia entre `family_events` y `memories`: escoger una única fuente de verdad antes de implementar.

## Pruebas de aceptación para vela-staging
1. A crea evento escolar válido; B administrador de la misma familia lo lee inmediatamente.
2. C miembro autorizado lo lee; D no autorizado de la misma familia no lo lee si el evento está restringido.
3. X de otra familia no puede SELECT/INSERT/UPDATE/DELETE ni recibir notificaciones del evento.
4. Dos eventos futuros se devuelven ordenados por fecha y hora; eventos pasados/cancelados quedan fuera.
5. La inserción crea una notificación por destinatario autorizado, sin duplicados al reintentar.
6. La falta de push/email no impide guardar ni consultar el evento.
7. La revocación de permisos impide consultar evento, historial, fuentes y contenido sensible de notificaciones.
8. Cambiar `family_id`, `created_by`, `member_id` cruzado o destinatario arbitrario se rechaza.
9. Un usuario no autenticado no puede acceder; pruebas se ejecutan como usuarios reales con JWT, no solo como propietario SQL.
10. Cambios se aplican desde migraciones versionadas y pueden revertirse en staging.

## Secuencia de implementación
A. Auditar esquema, triggers y funciones de familia/invitaciones y corregir acceso de membresías en staging.
B. Elegir modelo único de eventos/memorias y reglas de visibilidad con propietario.
C. Crear migración y tests SQL/cliente en GitHub; ejecutar solo en staging.
D. Añadir API autenticada y notificaciones internas; verificar entrega idempotente.
E. Integrar UI y consulta por voz/texto sobre datos autorizados.
F. Revisar seguridad, rendimiento, accesibilidad y preparación de lanzamiento.

## Pendientes explícitos
- Semántica exacta de `private` y `sensitive`, y si administradores tienen acceso automático a esas categorías: **no decidido**. Por defecto no conceder acceso implícito.
- Preferencias de notificación, horarios silenciosos y canales.
- Verificación de zona horaria y de eventos de día completo.
