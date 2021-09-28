const express = require("express")
const app = express()

const { graphqlHTTP } = require("express-graphql")
const { GraphQLID } = require("graphql")
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
} = require("graphql")

/* dummy data */
const authors = [
    {
        id: 1,
        name: 'J.K. Rowling'
    },
    {
        id: 2,
        name: 'J.R.R Tolkien'
    },
    {
        id: 3,
        name: 'George Orwell'
    }
]

const books = [
    {
        id: 1,
        name: 'Harry Potter and the Chamber of Screts',
        authorId: 1
    },
    {
        id: 2,
        name: 'Harry Potter and the Prisoner of Azkaban',
        authorId: 1
    },
    {
        id: 3,
        name: 'The Fellowship of the Ring',
        authorId: 2
    },
    {
        id: 4,
        name: 'The Two Towers',
        authorId: 2
    },
    {
        id: 5,
        name: '1984',
        authorId: 3
    },
    {
        id: 6,
        name: 'Animal Farm',
        authorId: 3
    }
]

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Represents an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'Represents a book written by author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: { 
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        author: {
            type: AuthorType,
            description: 'single author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id) 
        },
        book: {
            type: BookType,
            description: 'single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        }
    })
})

/* graphql schema */
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use("/graphql", graphqlHTTP({
    schema: schema,
    graphiql: true,
}))

app.listen(3000, () => console.log("server is running"))