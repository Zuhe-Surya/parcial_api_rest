import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API REST Parcial',
    version: '1.0.0',
    description: 'Documentación de la API utilizando Swagger, JWT y MongoDB Atlas con ES Modules',
  },
  tags: [
    { name: 'Autenticación', description: 'Registro e inicio de sesión de usuarios' },
    { name: 'Categorías', description: 'Gestión de categorías de productos' },
    { name: 'Productos', description: 'Gestión de productos' },
  ],
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local de Desarrollo',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: [
          '## Autenticacion con Token JWT',
          '',
          'Para acceder a las rutas protegidas sigue estos pasos:',
          '',
          '1. Registra un usuario en POST /api/auth/register',
          '2. Inicia sesion en POST /api/auth/login',
          '3. Copia el valor del campo "token" de la respuesta',
          '4. Pega el token en el campo "Value" de abajo y presiona Authorize',
          '',
          'NOTA: El token expira en 1 hora. Si recibes un error 403, vuelve a hacer login.',
        ].join('\n'),
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);