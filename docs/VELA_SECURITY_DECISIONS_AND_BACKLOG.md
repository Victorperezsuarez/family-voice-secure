# Vela — Registro de decisiones y mejoras de seguridad
Fecha de evaluación: 2026-10-25
Estado: investigación comparativa y planificación; NO implementado por este documento.
Ámbito: vela-staging, familias, membresías, invitaciones y funciones SQL.

## Política de decisión
Antes de diseñar una capacidad crítica: (1) describir necesidad y amenaza; (2) cotejar al menos dos referencias independientes cuando existan, distinguiendo documentación oficial de incidentes demostrados; (3) comprobar el estado real del código/DB; (4) registrar alternativas, elección, coste y pruebas; (5) decidir MVP bloqueante, MVP recomendable o post-MVP; (6) implementar solo en rama y staging, validar casos positivos/negativos, y aprobar antes de producción.
Nunca presentar una ausencia de funcionalidad como incidente ocurrido en terceros ni confundir prácticas publicadas con pruebas de seguridad.

## Referencias verificadas
- GitHub: invitaciones caducan en 7 días; edición/cancelación antes de aceptación; límites de invitación de 50 por 24 h, ampliables según condiciones. https://docs.github.com/en/organizations/managing-membership-in-your-organization/inviting-users-to-join-your-organization
- Slack: administradores pueden gestionar invitaciones pendientes, reenviar/extender/eliminar; caducan en 30 días. https://slack.com/help/articles/360060363633-Manage-pending-invitations-and-invite-links-for-your-workspace
- Slack: puede exigir aprobación de administrador para invitaciones iniciadas por miembros. https://slack.com/help/articles/115004854783-Require-admin-approval-for-invitations-to-Slack
- Supabase: funciones SECURITY DEFINER requieren límites explícitos de EXECUTE, validaciones internas y search_path fijado; RLS y GRANT deben auditarse juntos. https://supabase.com/docs/guides/database/functions
- Supabase: los privilegios de tabla no desaparecen al añadir RLS; los objetos y funciones privilegiadas expuestas requieren evaluación. https://supabase.com/docs/guides/database/postgres/row-level-security

## Registro de decisiones
| ID | Mejora / amenaza | Evidencia comparativa | Estado actual Vela | Decisión / prioridad | Criterio de aceptación |
|---|---|---|---|---|---|
| SEC-001 | Cancelar invitaciones pendientes | GitHub y Slack permiten cancelar/revocar | No se aportó función de revocación | MVP bloqueante antes de usuarios reales | Admin revoca; token revocado no funciona; no afecta invitaciones ya aceptadas |
| SEC-002 | Control de roles elevados | GitHub distingue roles; Slack permite aprobación administrativa | Admin puede invitar admin; validación admin actual en RPC | MVP bloqueante: confirmación clara y auditoría para invitaciones admin; evaluar si exigir confirmación adicional | Member no emite invitaciones; no se eleva por edición de token/rol; pruebas con dos cuentas |
| SEC-003 | Límite y abuso de invitaciones | GitHub aplica límite diario; Slack gestiona solicitudes | No se observó rate limit en función compartida | MVP bloqueante: límite servidor por admin/familia y respuesta controlada; umbral se decide con pruebas | Exceso se bloquea sin exponer datos ni saturar email |
| SEC-004 | Token, identidad y replay | GitHub exige aceptación; Supabase recomienda validar autorización | Token aleatorio 32 bytes y SHA-256, correo verificado, vencimiento 7 días, FOR UPDATE, status pending | MVP: conservar; añadir pruebas de email equivocado, vencido, replay, concurrencia | Ninguna aceptación indebida, un único uso |
| SEC-005 | Privilegios directos y SECURITY DEFINER | Supabase: RLS + GRANT; función privilegiada debe validar actor | family_users UPDATE sin política; SELECT restringido; cinco funciones definer | MVP bloqueante: revisar grants de invitaciones, función helper, propiedad y exposición API | Ninguna escritura directa no autorizada, incluso si se cambia payload |
| SEC-006 | Reenvío y extensión de invitación | Slack admite reenvío/extensión; GitHub reintentos | No implementado en funciones aportadas | Post-MVP salvo que pruebas con familias lo exijan | Reenvío revoca token anterior; límite y auditoría |
| SEC-007 | Auditoría de invitaciones y cambios de rol | GitHub roles y administración; requerimiento propio de trazabilidad | status, invited_by, accepted_by y fechas presentes; sin auditoría completa confirmada | MVP bloqueante para elevación/revocación; UI avanzada post-MVP | Registro de actor, familia, acción, tiempo, resultado; nunca token plano |
| SEC-008 | Gobernanza de privacidad de memorias y adjuntos | Supabase RLS y grants | Staging probado solo para familias/membresías; no pruebas integrales de memorias | MVP bloqueante antes de almacenar recuerdos privados | Pruebas cruzadas por familia, visibilidad, fuentes, historial y storage |
| SEC-009 | UX administrativa de invitaciones | GitHub/Slack exponen estado y cancelación | HTML manual de pruebas, no interfaz de producto | MVP mínimo: ver pendientes/cancelar; gestión avanzada post-MVP | Admin ve pendientes sin tokens y puede cancelar |

## Evidencia de pruebas existente (capturas aportadas por usuario)
- Staging: creación de familia y membresía admin correctas.
- Usuario externo: SELECT de familias y membresías sin acceso visible; inserción directa sin invitación rechazada.
- Invitación dirigida a correo verificado: aceptada; miembro visible en family_users.
- Usuario member: UPDATE directo member→member produjo 0 filas y mantuvo rol.
- Inventario: cinco funciones SECURITY DEFINER ejecutables por authenticated; código de funciones revisado.
Estas observaciones NO equivalen a pentest ni validan rutas no probadas.

## Riesgos y cuestiones abiertas
- Revisar privilegios directos de vela_family_invitations y sus políticas RLS.
- Inspeccionar tabla, restricciones y funciones completas; verificar email normalization y ausencia de escrituras directas.
- Revisar si funciones de consulta que aceptan p_user_id exponen pertenencia de terceros; limitar EXECUTE/ubicación según necesidad.
- Determinar mecanismo de revocación y rate limit que no añada complejidad innecesaria.
- Confirmar pruebas negativas y controles de almacenamiento de archivos.
- No se han documentado incidentes concretos de seguridad de GitHub o Slack en estas fuentes: las referencias describen controles y patrones, no fallas históricas comprobadas.

## Procedimiento de mantenimiento
Actualizar este registro en cada auditoría, cambio de SQL o decisión de producto. No marcar «implementado» hasta tener commit, migración aplicada en staging y evidencia de prueba. Cada cambio debe anotar fecha, enlace a PR/commit, resultado, responsable y pendientes.

## Verificación 2026-10-25 — SEC-005, invitaciones (captura de SQL Editor)
Consulta de solo lectura en `vela-staging`, según resultado aportado por usuario:
- `public.vela_family_invitations`: RLS = true.
- `authenticated`: INSERT = false; UPDATE = false; DELETE = false.
- Número de políticas RLS de escritura (INSERT/UPDATE/DELETE/ALL) = 0.
**Resultado:** control de escritura directa de invitaciones aprobado para rol authenticated; no hay necesidad de cambiar estos grants actualmente. **SEC-005 permanece abierto** hasta auditar privilegios anon/otros roles, políticas SELECT, funciones SECURITY DEFINER y pruebas negativas de RPC. No extrapolar a producción.
**Próximo control:** revisar privilegios SELECT y funciones de invitación para anon/authenticated, sin modificar datos.

## Verificación 2026-10-25 — SEC-005, lectura de invitaciones (dos capturas SQL Editor)
- `information_schema.role_table_grants` para `public.vela_family_invitations` y roles `anon`/`authenticated`: **0 filas**; no se observaron concesiones directas listadas para esos roles.
- `pg_policies` para `public.vela_family_invitations`: **0 filas**; ninguna política RLS para la tabla.
- Combinado con RLS activado y ausencia de permisos de escritura ya verificados: acceso directo por roles cliente anon/authenticated bloqueado según consultas aportadas.
**Decisión:** conservar aislamiento de tabla y acceso mediante funciones autorizadas; no modificar SQL. **SEC-005 sigue parcialmente abierto** para comprobar privilegios EXECUTE anon, pruebas negativas de funciones, grants heredados/roles especiales y validaciones de acceso. Evidencia: capturas aportadas por usuario. No extrapolar a otras tablas ni producción.

## Verificación 2026-10-25 — permisos EXECUTE de funciones (captura SQL Editor)
Se comprobó `has_function_privilege` para cinco funciones: `vela_accept_family_invitation`, `vela_create_family`, `vela_is_family_admin`, `vela_is_family_member`, `vela_issue_family_invitation`. En todos los casos: `anon=false`, `authenticated=true`.
**Decisión:** conservar los permisos EXECUTE actuales; bloqueo de ejecución anónima confirmado. Las validaciones internas y los casos negativos de RPC siguen pendientes. **SEC-005 no cerrado globalmente**. Próximo control: ejecución de `vela_issue_family_invitation` por miembro normal (debe rechazarse), con verificación de que no se generó invitación; no compartir tokens ni claves.

## Verificación 2026-10-25 — SEC-002, emisión de invitación administrativa por miembro
Evidencia: captura de la página de pruebas manuales `vela-staging` aportada por el usuario. Cuenta de prueba con rol `member` intentó `vela_issue_family_invitation` para rol `admin`; la interfaz mostró `Error: Not authorized to invite`.
**Resultado:** prueba negativa de autorización RPC aprobada; no se observó token generado. La captura no constituye prueba independiente de ausencia de registro en DB, pero la excepción de función debería revertir la transacción.
**Decisión:** mantener la validación actual de `admin` en la función. SEC-002 sigue abierto para pruebas de token incorrecto, replay, vencimiento, revocación y reglas de invitación admin. No cambiar producción.

## Verificación 2026-10-25 — SEC-004, aceptación de tercera cuenta
Evidencia: captura aportada por usuario de página manual de staging. La tercera cuenta recibió `status: Invitación aceptada`, `family_id: 629831b0-0ccc-4502-9665-1f8a2583ca1e` y `user_id: 055349a2-c8e6-49b6-a9ef-aae91479cafd`. Invitación emitida previamente con id `06f565df-0bae-46e8-b6a8-a0aae764c1e4`, expiración 2026-11-01T23:23:27.958483+00:00.
**Resultado:** flujo positivo de aceptación confirmado. La UI borra el token tras éxito; no se conserva token para reintento. **No declarar replay probado**: falta comprobación directa de intento repetido con mismo token. Próxima acción: consulta de solo lectura de `status`, `accepted_at`, `accepted_by` de invitación (sin token_hash) y planificar prueba replay futura conservando token únicamente en memoria de la página de test. No modificar producción.

## Verificación 2026-10-25 — SEC-004, estado persistido de invitación
Resultado CSV proporcionado por usuario, consulta de solo lectura para id `06f565df-0bae-46e8-b6a8-a0aae764c1e4`:
- `status=accepted`; `role=member`; `accepted_by=055349a2-c8e6-49b6-a9ef-aae91479cafd`; `accepted_at=2026-10-25 23:25:18.939289+00`; `expires_at=2026-11-01 23:23:27.958483+00`.
**Resultado:** aceptación persistida en DB y asociada a tercera cuenta, conforme al flujo. La función revisada exige `status='pending'` y por ello está diseñada para rechazar replay, pero **el replay real no ha sido probado** porque el HTML borra el token tras aceptarlo. Decisión: no alterar token_hash ni membresía; añadir prueba controlada de replay en futuro flujo de test con token conservado solo en memoria, sin registrar el token ni compartirlo. SEC-004 continúa parcialmente abierto.

## Actualización 2026-10-25 — SEC-004, herramienta de prueba de replay
Se actualizó `tests/manual/vela-staging-family-smoke.html` en rama de auditoría, commit `88f0369`: nuevo botón 9 que, tras una aceptación exitosa con el HTML actualizado, conserva el token únicamente en memoria JS hasta una segunda llamada RPC con la misma sesión, reporta rechazo/alerta y borra referencia al token. No persiste ni muestra token en resultados. **No ejecutado todavía**: falta crear invitación nueva con página actualizada, aceptar y pulsar 9. La invitación anterior no puede probarse porque su token fue borrado. No se cambió Supabase ni producción. Esta modificación es exclusivamente de la herramienta de pruebas, no del MVP.

## Actualización 2026-10-25 — SEC-004, segunda familia para replay
Captura del usuario confirma `vela_create_family` con nueva familia staging `4d4f62d9-56a3-43ca-81e3-56bd01f42836`, creada por cuenta admin `2a98f820-55b7-41e6-a882-c4ebb7e7edfa`. Se detectó que el HTML de pruebas tenía `targetFamily` readonly y apuntaba a la familia original, por lo que la invitación no podía dirigirse a la nueva familia. Se corrigió `tests/manual/vela-staging-family-smoke.html` en commit `ff43ba3`: campo editable y asignación automática tras crear familia. **No se ejecutó todavía el replay**. Próxima acción: descargar HTML actualizado, introducir ID nueva familia, emitir invitación member a tercera cuenta, aceptar, pulsar 9, verificar resultado. Sin cambios en DB por esta corrección de HTML ni en producción.

## SEC-004: resultados de pruebas de invitaciones — 2026-10-25
- Reutilización: tras una aceptación exitosa, la segunda aceptación del mismo código fue rechazada. La página reportó `segunda_aceptacion_permitida=false` y borrado de su referencia temporal. Control aprobado para el escenario probado.
- Destinatario incorrecto: una cuenta distinta de la destinataria intentó aceptar una invitación válida; Supabase devolvió `Invitation invalid, expired, or not intended for this account`. Control aprobado para el escenario probado.
- Decisión MVP: conservar ambas validaciones. Pendiente confirmar que la invitación permanece `pending` y puede aceptarla el destinatario correcto; también probar vencimiento y revocación.
- Evidencia: capturas proporcionadas por usuario; no hubo cambios SQL.
