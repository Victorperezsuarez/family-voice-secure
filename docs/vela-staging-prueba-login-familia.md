# Vela — prueba aislada de autenticación y creación de familias (staging)

Este archivo es un instrumento de prueba local. No se integra con la aplicación ni se despliega en producción. Utiliza únicamente la URL y clave **publicable** del proyecto vela-staging. No introduzcas claves secretas/service_role.

## Uso
1. Guarda este archivo como HTML local y ábrelo en un navegador moderno. El módulo Supabase se importa desde esm.sh, por lo que requiere acceso a internet.
2. Introduce la URL y la clave publicable del proyecto **vela-staging**. La clave publicable puede usarse en un cliente web; no la publiques en repositorios junto con credenciales personales. Estos campos no se guardan en almacenamiento local.
3. Introduce el correo y la contraseña de tu cuenta de prueba (nunca compartas la contraseña por chat).
4. Pulsa Iniciar sesión. Verifica que aparece tu UID.
5. Pulsa Crear familia de prueba. La función RPC `vela_create_family` debe devolver un UUID.
6. Pulsa Verificar membresía. Debe mostrar una fila con `role: admin` y el ID de familia recién creado.
7. Cierra sesión.

## Importante
- La contraseña se usa en el navegador para iniciar sesión en Supabase, no se registra en este documento ni se envía al asistente.
- Este archivo **no sustituye** pruebas automatizadas de RLS con dos usuarios distintos.
- Si aparece un error de CORS, autenticación o política, detente y comunica únicamente el mensaje de error, sin credenciales.
- No uses la URL ni la clave del proyecto original.
