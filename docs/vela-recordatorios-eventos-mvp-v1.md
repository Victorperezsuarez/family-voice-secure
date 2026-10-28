# Vela MVP — Recordatorios asociados a eventos (requisito y diseño v1)

Estado: especificación, no implementación. Entorno de pruebas: vela-staging. No aplicar en producción.

## Historia de usuario
«Vela, Nina tiene un cumpleaños el sábado 12 a las 3 de la tarde, recuérdame dos días antes».
El asistente debe resolver fecha, año y zona horaria; si el mes/año no son inequívocos o sábado no coincide con el día 12, solicitar confirmación ANTES de guardar. Al confirmar, crea un evento y un recordatorio vinculado. «Dos días antes» significa restar dos días calendario a la hora local del evento, salvo que el usuario especifique otra hora.

## MVP obligatorio
- Eventos con fecha/hora y zona horaria IANA, vinculados a familia y perfil cuando corresponda.
- Recordatorios como registros persistentes asociados a un evento, con `recipient_user_id`, `scheduled_for timestamptz`, `status`, `created_by`, `created_at`, `sent_at`, `event_id`.
- Por defecto, recordar solo a quien lo pidió. Otros miembros autorizados se agregan como destinatarios solo por instrucción o preferencia explícita.
- La persona puede consultar, editar o cancelar el recordatorio. Cambiar fecha/hora del evento debe recalcular o solicitar confirmación sobre recordatorios dependientes.
- Un trabajador backend procesa recordatorios vencidos con idempotencia y reintentos; nunca confiar en un temporizador de navegador o en memoria del modelo.
- Separar recordatorios de notificaciones por alta/modificación de evento; el fallo de un canal de entrega no debe perder el evento.
- Notificaciones in-app en MVP; push/email sujetos a permisos, infraestructura y pruebas posteriores.
- No incluir información sensible en previsualizaciones de pantalla bloqueada; validar autorización del destinatario en el momento de la entrega.

## Pruebas de aceptación
1. Fecha ambigua => pide aclaración y no agenda silenciosamente.
2. Evento confirmado => recordatorio persistido para solicitante exactamente dos días calendario antes en hora local.
3. Consulta de eventos y recordatorios por usuarios autorizados; aislamiento entre familias.
4. Otro administrador puede ver evento compartido, pero no recibe automáticamente un recordatorio personal no solicitado.
5. Reintento del procesador no duplica notificaciones.
6. Cancelación y cambio de fecha se reflejan en recordatorios pendientes.
7. Destinatario revocado no recibe detalles protegidos.
8. La aplicación cerrada no impide el procesamiento programado.
9. Cambio de horario de verano se resuelve según zona horaria del evento.
10. Un fallo de notificación no borra el evento ni impide consultarlo.

## Orden de ejecución
1. Terminar seguridad de familias e invitaciones en staging.
2. Elegir fuente única de verdad para eventos y memorias.
3. Crear migraciones y pruebas de recordatorios + notificaciones en staging.
4. Implementar consulta/edición por texto; voz y canales push después.

No ejecutar SQL de este documento: es una especificación.
