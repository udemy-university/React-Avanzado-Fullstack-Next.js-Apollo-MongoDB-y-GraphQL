const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');

// Resolvers
const resolvers = {
	Query: {
		obtenerCurso: () => "Hola"
	},
	Mutation: {
		nuevoUsuario: async (_, { input } ) => {			
			const { email, password } = input;

			// Revisar si el usuario ya está registrado
			const existeUsuario = await Usuario.findOne({email});
			if(existeUsuario) {
				throw new Error('El usuario ya existe.');
			}

			// Hashear password
			const salt = bcryptjs.genSaltSync(10);
			input.password = bcryptjs.hashSync(password, salt);

			try {
				// Guardar en la BD
				const usuario = new Usuario(input);
				usuario.save(); // Guardarlo
				return usuario;
			} catch(error) {
				console.log(error);
			}
		}
	}
}



module.exports = resolvers;