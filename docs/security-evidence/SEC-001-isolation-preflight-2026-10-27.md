# SEC-001 - Preparacion de aislamiento entre familias

Fecha: 2026-10-27. Entorno: vela-staging. Estado: pendiente de prueba cruzada.

Evidencia observada: dos familias anteriores comparten el mismo administrador, por lo que no permiten probar denegacion de acceso entre familias. Se creo una tercera familia independiente llamada VELA STAGING AISLAMIENTO B, con ID f578da2d-6980-4f7e-968b-498907e90fc0, mediante una cuenta de prueba distinta.

Decision MVP: probar autorizacion por familia, no solo por rol. No alterar las familias anteriores ni la produccion.

Siguiente comprobacion: consultar family_users para confirmar que la cuenta principal no es miembro de la familia B. Luego preparar invitacion pendiente y probar rechazo de revocacion desde otra familia. Registrar resultado y consulta de integridad.

Politica de evidencias: no registrar contrasenas, tokens ni claves; guardar pruebas por control en archivos pequenos, con commit verificado.
