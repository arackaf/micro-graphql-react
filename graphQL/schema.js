import { query as BookQuery, mutation as BookMutation, type as BookType } from './Book/schema';
    
export default `

  type QueryResultsMetadata {
    count: Int
  }

  input StringArrayUpdate {
    index: Int,
    value: String
  }

  input IntArrayUpdate {
    index: Int,
    value: Int
  }

  input FloatArrayUpdate {
    index: Int,
    value: Float
  }

  ${BookType}

  type Query {
    ${BookQuery}
  }

  type Mutation {
    ${BookMutation}
  }

`