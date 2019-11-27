import uuidv4 from 'uuid/v4';
import cors from 'cors';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models from './models';


const app = express();

app.use(cors());


const server = new ApolloServer({
    typeDefs: schema, 
    resolvers,
    context:{
        models,
        me:  users[1],
    }
});


server.applyMiddleware({app, path: '/graphql'});

app.listen({port:8000}, () =>{
    console.log('Apollo Server on http://localhost:8000/graphql');
})



const schema = gql`
type Query {
    me: User
    user(id: ID!): User
    users: [User!]
    messages: [Message!]!
    message(id: ID!): Message!
}
type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
}
type User{
    id: ID!
    userName: String!
    lastName: String!
    messages: [Message!]
}
type Message{
    id: ID!
    text: String!
    user: User!
}
`;

const resolvers = {
    Query:{
        users: () =>{
            return Object.values(users)
        },
        me: (parent, args, {me}) =>{
            return me
        },
        user: (parent, {id }) =>{
            return users[id]
        },
        messages: () =>{
            return Object.values(messages);
        },
        message: (parent, {id}) =>{
            return messages[id];
        }
        },
    Mutation: {
        createMessage: (parent, { text }, { me }) =>{
            const id = uuidv4();

            const message = {
                id,
                text,
                userId: me.id
            }
            messages[id] = message;
            users[me.id].messageIds.push(id)
            return message;
        },
        deleteMessage: (parent, { id }) =>{
            const { [id]: message, ...otherMessages } = messages;

            if(!message){
                return false
            }
            messages = otherMessages;
            
            return true;
        },
    },
    Message: {
        user: message =>{
            return users[message.userId]
        }
    },
    User: {
        messages: user =>{
            return Object.values(messages).filter(
                message => message.userId === user.id,
            );
        },
    },
};

