var { buildSchema } = require("graphql")

export const schema = buildSchema(`
    type User {
        id: ID!
        username: String!
        password: String!
        level_on: Int!
    }
    
    type Coin {
        x: Float!
        y: Float!
        bad: Boolean!
    }

    type Level {
        id: ID!
        gridSize: Int!
        fuel: Float!
        animationSpeed: Float!
        coinCount: Int!
        coins: [Coin]!
    }

    type Query {
        getLevel(jwt: String!, level: Int!): Level!
        getUser(jwt: String!): User!
    }

    type Mutation {
        register(username: String!, password: String!): User!
        login(username: String!, password: String!): String!
        submitSolution(jwt: String!, level: Int!, expression: String!): Boolean!
    }
`);