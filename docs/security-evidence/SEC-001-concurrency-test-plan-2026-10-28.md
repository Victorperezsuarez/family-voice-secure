# SEC-001 - Plan de pruebas de concurrencia

Fecha: 2026-10-28. Entorno exclusivo: vela-staging. Estado: pendiente de preflight y ejecucion.

Riesgo: dos aceptaciones simultaneas del mismo token o aceptacion simultanea con revocacion.

Criterios MVP:
1. Como maximo una aceptacion exitosa por token.
2. No duplicar membresias (UNIQUE family_id,user_id).
3. La aceptacion debe ser atomica: membresia e invitacion aceptada, o ninguna de las dos.
4. En carrera aceptar/revocar, solo uno de los resultados finales es valido: accepted con membresia coherente o revoked sin nueva membresia.
5. No usar tokens reales en registros, capturas o GitHub.

Evidencia anterior: revocacion cruzada rechazada, invitacion `8b5af84f-0c86-4652-b01d-b4c0d308454a` conservada en estado pending, sin revoked_by ni revoked_at.

Paso inmediato: consulta de solo lectura de restricciones, definicion de funciones de aceptacion/revocacion y privilegios; verificar bloqueo de fila y transaccionalidad antes de disenar simulacion. No lanzar solicitudes paralelas hasta revisar el resultado. No tocar produccion.
