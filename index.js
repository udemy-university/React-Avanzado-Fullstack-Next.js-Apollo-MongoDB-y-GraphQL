const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

const conectarDB = require('./config/db');

conectarDB();

// server
const server = new ApolloServer({
	typeDefs,
	resolvers,
    context: ({ req }) => {
        // El context se pasa en todos los resolvers
        const token = req.headers['authorization'] || '';
        try {
            const usuario = jwt.verify(token, process.env.SECRETA);

            return {
                usuario
            }
        } catch (error) {
            console.log('Hubo un error:');
            console.log(error);
        }
    }
});

// arrancar el servidor
server.listen().then( ({url}) => {
	console.log(`Servidor listo en la URL ${url}`);
})