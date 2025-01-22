var express = require("express")
const cors = require('cors');
var { createHandler } = require("graphql-http/lib/use/express")
 
import {schema} from './schema'
import {resolvers} from './resolvers';

 
var app = express();

app.use(cors({
  methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  optionsSuccessStatus: 200,
  origin: 'http://localhost:5173'
}));

app.options('*', cors());

app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: resolvers,
  })
);

var { ruruHTML } = require("ruru/server")
 
// Serve the GraphiQL IDE.
app.get("/", (_req, res) => {
  res.type("html")
  res.end(ruruHTML({ endpoint: "/graphql" }))
});

app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");