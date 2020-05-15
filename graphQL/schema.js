import { query as BookQuery, mutation as BookMutation, type as BookType } from "./Book/schema";
import { query as SubjectQuery, mutation as SubjectMutation, type as SubjectType } from "./Subject/schema";

export default `

  scalar JSON

  type DeletionResultInfo {
    success: Boolean!,
    Meta: MutationResultInfo!
  }

  type MutationResultInfo {
    transaction: Boolean!,
    elapsedTime: Int!
  }

  type QueryResultsMetadata {
    count: Int!
  }

  type QueryRelationshipResultsMetadata {
    count: Int!
  }

  input StringArrayUpdate {
    index: Int!,
    value: String!
  }

  input IntArrayUpdate {
    index: Int!,
    value: Int!
  }

  input FloatArrayUpdate {
    index: Int!,
    value: Float!
  }


  ${BookType}

  ${SubjectType}

  type Query {
    ${BookQuery}

    ${SubjectQuery}
  }

  type Mutation {
    ${BookMutation}

    ${SubjectMutation}
  }

`;
