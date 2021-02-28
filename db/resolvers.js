const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

crearToken = (usuario, secreta, expiresIn) => {
    const { id, email, nombre, apellido } = usuario;
    return jwt.sign({id, email, nombre, apellido}, secreta, {expiresIn});
}

// Resolvers
const resolvers = {
	Query: {
		obtenerUsuario: async(_, { token }) => {
            const usuarioId = await jwt.verify(token, process.env.SECRETA);

            return usuarioId;
        },
        obtenerProductos: async() => {
            try {
                const productos = await Producto.find({});

                return productos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerProducto: async (_, { id }) => {
            try {
                const producto = await Producto.findById(id);

                if(!producto) {
                    throw new Error('Producto no encontrado');
                }

                return producto;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerClientes: async () => {
            try {
                const clientes = await Cliente.find({});
                
                return clientes;
            } catch (error) {
                console.log(error);
            }
        }
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
		},
        autenticarUsuario: async(_, {input}) => {
            const { email, password } = input;

            // Revisar si el usuario existe
            const existeUsuario = await Usuario.findOne({email: email});
            if(!existeUsuario) {
                throw new Error('El usuario no existe');
            }

            // Revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
            if(!passwordCorrecto) {
                throw new Error('El password es incorrecto');
            }

            // Crear el token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, 60*60*5)
            }
        },
        nuevoProducto: async(_, { input }) => {
            try {
                const producto = new Producto(input);

                // almacenar en la bd
                const resultado = await producto.save();
                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        actualizarProducto: async(_, { id, input }) => {

            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('Producto no encontrado');
            }

            // guardar en la base de datos
            producto = await Producto.findOneAndUpdate({ _id: id}, input, { new: true });

            return producto;
        },
        eliminarProducto: async(_, {id}) => {
            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('Producto no encontrado');
            }

            // eliminar
            await Producto.findOneAndDelete({ _id: id});

            return "Producto eliminado!";
        },
        nuevoCliente: async(_, {input}, ctx) => {
            // Verificar si el cliente ya está registrado
            const { email } = input;

            const cliente = await Cliente.findOne({ email });

            if(cliente) {
                throw new Error("Ese cliente ya está registrado");
            }

            const nuevoCliente = new Cliente(input);

            // asignar al vendedor
            nuevoCliente.vendedor = ctx.usuario.id;

            // guardarlo en la BD
            try {
                const resultado = await nuevoCliente.save();
                
                return resultado;
            } catch (error) {
                console.log(error);
            }
        }
	}
}



module.exports = resolvers;