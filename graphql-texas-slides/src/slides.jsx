import React, { useContext } from "react";
import ReactDOM from "react-dom";

import {
  Appear,
  Box,
  CodePane,
  CodeSpan,
  Deck,
  FlexBox,
  FullScreen,
  Grid,
  Heading,
  Image,
  ListItem,
  Markdown,
  Notes,
  OrderedList,
  Progress,
  Slide,
  SpectacleLogo,
  Stepper,
  Text,
  UnorderedList,
  indentNormalizer
} from "spectacle";

// SPECTACLE_CLI_THEME_START
const theme = {
  fonts: {
    header: '"Open Sans Condensed", Helvetica, Arial, sans-serif',
    text: '"Open Sans Condensed", Helvetica, Arial, sans-serif'
  },
  size: {
    maxCodePaneHeight: 500
  }
};
// SPECTACLE_CLI_THEME_END

// SPECTACLE_CLI_TEMPLATE_START
const template = () => (
  <FlexBox justifyContent="space-between" position="absolute" bottom={0} width={1}>
    <Box padding="0 1em">
      <FullScreen />
    </Box>
    <Box padding="1em">
      <Progress />
    </Box>
  </FlexBox>
);
// SPECTACLE_CLI_TEMPLATE_END

const formidableLogo = "https://avatars2.githubusercontent.com/u/5078602?s=280&v=4";

const cppCodeBlock = indentNormalizer(`
#include <iostream>
#include <cstdlib>
#include <sstream>
#include <pthread.h>

struct thread_data_t
{
   int  thread_id;
   std::string message;
};

void *print_thread_message(void *thread_arg)
{
   struct thread_data_t *thread_data;
   thread_data = (struct thread_data_t *) thread_arg;

   cout << "Thread ID: " << thread_data->thread_id;
   cout << "Message: " << thread_data->message << endl;

   pthread_exit(NULL);
}

int main()
{
  pthread_t threads[NUM_THREADS];
  struct thread_data_t thread_data[NUM_THREADS];

  for (int i = 0; i < NUM_THREADS; i++)
  {
    auto curried_add = [](int x) -> function<int(int)> { return [=](int y) { return x + y; }; };
    auto answer = curried_add(i)(5);

    std::stringstream message;
    message << "The math result is " << answer << "!";
    thread_data.thread_id = i;
    thread_data.message = message.str();
    int err = pthread_create(&threads, NULL, print_thread_message, (void *)&thread_data[i]);

    if (err)
    {
      exit(-1)
    }
  }

  return 0;
}`);

const GraphQLTypeNames1 = indentNormalizer(`
{
  allBooks(PAGE: 1, PAGE_SIZE: 3, SORT: {title: 1}) {
    Books {
      title
      authors
    }
  }
}
`);

const GraphQLTypeNames1Results = indentNormalizer(`
{
  "data": {
    "allBooks": {
      "Books": [
        {
          "title": "1066: The Year of the Conquest",
          "authors": ["David Howarth"]
        },
        {
          "title": "1491: New Revelations of the Americas Before Columbus",
          "authors": ["Charles C. Mann"]
        },
        {
          "title": "1776",
          "authors": ["David McCullough"]
        }
      ]
    }
  }
}
`);

const GraphQLTypeNames1Types = indentNormalizer(`
{
  allBooks(PAGE: 1, PAGE_SIZE: 3, SORT: {title: 1}) {
    __typename
    Books {
      __typename
      title
      authors
    }
  }
}
`);

const GraphQLTypeNames1TypesResults = indentNormalizer(`
{
  "data": {
    "allBooks": {
      "__typename": "BookQueryResults",
      "Books": [
        {
          "__typename": "Book",
          "title": "1066: The Year of the Conquest",
          "authors": [
            "David Howarth"
          ]
        },
        {
          "__typename": "Book",
          "title": "1491: New Revelations of the Americas Before Columbus",
          "authors": [
            "Charles C. Mann"
          ]
        },
        {
          "__typename": "Book",
          "title": "1776",
          "authors": [
            "David McCullough"
          ]
        }
      ]
    }
  }
}
`);

//------------------------------------------------------------------------------------------------------------------------

const normalizedQueryExample1_prelimQuery = indentNormalizer(`
{
  allBooks(PAGE: 1, PAGE_SIZE: 3, SORT: {title: 1}, title_contains: "Civil War") {
    Books {
      _id
      title
      authors
    }
  }
}
`);

const normalizedQueryExample1_prelimResults = indentNormalizer(`
{
  "data": {
    "allBooks": {
      "Books": [
        {
          "_id": 1,
          "title": "A Nation Without Borders: The United States and Its World in an Age of Civil Wars, 1830-1910",
          "authors": ["Steven Hahn"]
        },
        {
          "_id": 2,          
          "title": "Atlanta 1864: Last Chnace for the Confederacy (Great Campaigns of the Civil War)",
          "authors": ["Richard M. McMurry"]
        },
        {
          "_id": 3,          
          "title": "Charles Sumner and the Coming of the Civil War",
          "authors": ["David Donald"]
        }
      ]
    }
  }
}
`);

const normalizedQueryExample1_prelimCached = indentNormalizer(`
const queryCache = {
  ["x?variables:{page:1, /* ... */, title_contains: 'Civil War'}"]: [
    {type: "Book", _id: 1},
    {type: "Book", _id: 2},
    {type: "Book", _id: 3}
  ]
}
`);

const normalizedQueryExample1_prelimCacheObject = indentNormalizer(`
const objectCache = {
  Book: {
    1: {
      "_id": 1,
      "title": "A Nation Without Borders: The United States and Its World in an Age of Civil Wars, 1830-1910",
      "authors": ["Steven Hahn"]
    },
    2: {
      "_id": 2,          
      "title": "Atlanta 1864: Last Chnace for the Confederacy (Great Campaigns of the Civil War)",
      "authors": ["Richard M. McMurry"]
    },
    3: {
      "_id": 3,          
      "title": "Charles Sumner and the Coming of the Civil War",
      "authors": ["David Donald"]
    }
  }
}
`);

//------------------------------------------------------------------------------------------------------------------------

const normalizedQueryExample1_nextQuery = indentNormalizer(`
{
  allBooks(PAGE: 1, PAGE_SIZE: 3, SORT: {title: 1}, title_contains: "Last") {
    Books {
      title
      authors
    }
  }
}
`);

const normalizedQueryExample1_nextResults = indentNormalizer(`
{
  "data": {
    "allBooks": {
      "Books": [
        {
          "_id": 2,          
          "title": "Atlanta 1864: Last Chnace for the Confederacy (Great Campaigns of the Civil War)",
          "authors": ["Richard M. McMurry"]
        },
        {
          "_id": 4,
          "title": "Fermat's Last Theorem",
          "authors": ["Simon Singh"]
        },
        {
          "_id": 5,
          "title": "Gettysburg: The Last Invasion",
          "authors": ["Allen C. Guelzo"]
        }
      ]
    }
  }
}
`);

const normalizedQueryExample1_nextCached = indentNormalizer(`
const queryCache = {
  ["x?variables:{page:1, /* ... */, title_contains: 'Civil War'}"]: [
    {type: "Book", _id: 1},
    {type: "Book", _id: 2},
    {type: "Book", _id: 3}
  ],
  ["x?variables:{page:1, /* ... */, title_contains: 'Last'}"]: [
    {type: "Book", _id: 2},
    {type: "Book", _id: 4},
    {type: "Book", _id: 5}
  ]
}
`);

const normalizedQueryExample1_nextCacheObject = indentNormalizer(`
const objectCache = {
  Book: {
    1: {
      "_id": 1,
      "title": "A Nation Without Borders: The United States and Its World in an Age of Civil Wars, 1830-1910",
      "authors": ["Steven Hahn"]
    },
    2: {
      "_id": 2,          
      "title": "Atlanta 1864: Last Chnace for the Confederacy (Great Campaigns of the Civil War)",
      "authors": ["Richard M. McMurry"]
    },
    3: {
      "_id": 3,          
      "title": "Charles Sumner and the Coming of the Civil War",
      "authors": ["David Donald"]
    },
    4: {
      "_id": 4,
      "title": "Fermat's Last Theorem",
      "authors": ["Simon Singh"]
    },
    5: {
      "_id": 5,
      "title": "Gettysburg: The Last Invasion",
      "authors": ["Allen C. Guelzo"]
    }
  }
}
`);

//------------------------------------------------------------------------------------------------------------------------

const normalizedQueryExample1_fix = indentNormalizer(`
mutation {
  updateBook(_id: 2, Updates: {title: "Atlanta 1864: Last Chance for the ..."}) {
    Book {
      _id
      title
    }
  }
}
`);

const normalizedQueryExample1_fixResults = indentNormalizer(`
{
  "data": {
    "updateBook": {
      "Book": {
        "_id": 2,
        "title": "Atlanta 1864: Last Chance for the Confederacy (Great Campaigns of the Civil War)",
        "__typename": "Book"
      }
    }
  }
}
`);

const normalizedQueryExample1_fixResultsObjectCache = indentNormalizer(`
const objectCache = {
  Book: {
    1: {
      "_id": 1,
      "title": "A Nation Without Borders: The United States and Its World in an Age of Civil Wars, 1830-1910",
      "authors": ["Steven Hahn"]
    },
    2: {
      "_id": 2,          
      "title": "Atlanta 1864: Last Chance for the Confederacy (Great Campaigns of the Civil War)",
      "authors": ["Richard M. McMurry"]
    },
    3: {
      "_id": 3,          
      "title": "Charles Sumner and the Coming of the Civil War",
      "authors": ["David Donald"]
    },
    4: {
      "_id": 4,
      "title": "Fermat's Last Theorem",
      "authors": ["Simon Singh"]
    },
    5: {
      "_id": 5,
      "title": "Gettysburg: The Last Invasion",
      "authors": ["Allen C. Guelzo"]
    }
  }
}
`);

//------------------------------------------------------------------------------------------------------------------------

const normalizedQueryProblem1_query = indentNormalizer(`
tasks(assignedTo: "Adam") {
  Tasks {
    id, description, assignedTo
  }
}
`);

const normalizedQueryProblem1_initialResults = indentNormalizer(`
{
  "data": {
    "tasks": {
      "Tasks": [
        { id: 1, description: "Adam's Task 1", assignedTo: "Adam" },
        { id: 2, description: "Adam's Task 2", assignedTo: "Adam" }
      ];
    }
  }
}
`);

const normalizedQueryProblem1_mutation = indentNormalizer(`
mutation {
  updateTask(id: 2, assignedTo: "Bob", description: "Bob's Task")
}
`);

const normalizedQueryProblem1_objectCache = indentNormalizer(`
const objectCache = {
  Task: {
    1: { id: 1, description: "Adam's Task 1", assignedTo: "Adam" },
    2: { id: 2, description: "Bob's Task", assignedTo: "Bob" }
  }
}
`);

const normalizedQueryProblem1_queryCache = indentNormalizer(`
const queryCache = {
  ["x?variables:{assignedTo: 'Adam'}"]: [
    {type: "Task", _id: 1},
    {type: "Task", _id: 2}
  ]
}
`);

//------------------------------------------------------------------------------------------------------------------------

const normalizedQueryUrql_query = indentNormalizer(`
tasks(assignedTo: "Adam") {
  Tasks {
    id, description, assignedTo
  }
}
`);

const normalizedQueryUrql_initialResults = indentNormalizer(`
{
  "data": {
    "tasks": {
      "Tasks": [
        { id: 1, description: "Adam's Task 1", assignedTo: "Adam" },
        { id: 2, description: "Adam's Task 2", assignedTo: "Adam" }
      ];
    }
  }
}
`);

const normalizedQueryUrql_queryCache1 = indentNormalizer(`
const tasksQueryCache = {
  ["x?variables:{assignedTo: 'Adam'}"]: [
    { id: 1, description: "Adam's Task 1", assignedTo: "Adam" },
    { id: 2, description: "Adam's Task 2", assignedTo: "Adam" }
  ]
}
`);

const normalizedQueryUrql_mutation = indentNormalizer(`
mutation {
  updateTask(id: 1, assignedTo: "Bob", description: "Bob's Task")
}
`);

const normalizedQueryUrql_queryCache2 = indentNormalizer(`
const tasksQueryCache = {
  // And it's gone
}
`);

//------------------------------------------------------------------------------------------------------------------------

const urqlEmpty_Query = indentNormalizer(`
tasks(assignedTo: "Adam") {
  Tasks {
    id, description, assignedTo
  }
}
`);

const urqlEmpty_Results = indentNormalizer(`
{
  "data": {
    "tasks": {
      "__typename": "TaskQueryResults",
      "Tasks": []
    }
  }
}
`);

//------------------------------------------------------------------------------------------------------------------------

const microQuery1 = indentNormalizer(`
const Books = props => {
  const { data, loading } = useQuery(
    BOOKS_QUERY,
    { /* search values */ },
    { 
      onMutation: { 
        when: /(update|create|delete)Books?/, 
        run: ({ hardReset, softReset, currentResults, refresh }) => { /* do whatever you want */ } 
      } 
    }
  );

  const books = data?.allBooks?.Books ?? [];
  return (
    <div>
      {books.map(book => <div key={book._id}>{book.title}</div>)}
      {loading ? <span>Loading ...</span> : null}
    </div>
  );
};
`);

const microQueryHard1 = indentNormalizer(`
const Books = props => {
  const { data, loading } = useQuery(
    BOOKS_QUERY,
    { /* search values */ },
    { 
      onMutation: { 
        when: /(update|create|delete)Books?/, 
        run: ({ hardReset }) => hardReset()
      } 
    }
  );

  return null; //elide component code for brevity
};
`);

const microQueryHard2 = indentNormalizer(`
const Subjects = props => {
  const { data, loading } = useQuery(
    SUBJECTS_QUERY,
    { /* search values */ },
    {
      onMutation: { 
        when: /(update|create|delete)Subjects?/, 
        run: ({ hardReset }) => hardReset() 
      }
    }
  );

  return null; //elide component code for brevity
};
`);

const microQueryHard3 = indentNormalizer(`
const Subjects = props => {
  const { data, loading } = useQuery(
    SUBJECTS_QUERY,
    { /* search values */ },
    {
      onMutation: { 
        when: /(update|create|delete){type}s?/, 
        // --------------------------^^^^^^
        run: ({ hardReset }) => hardReset() }
    } 
  );

  return null; //elide component code for brevity
};
`);

const microQueryHard4 = indentNormalizer(`
const useHardResetQuery = (type, query, variables, options = {}) =>
  useQuery(query, variables, {
    ...options,
    onMutation: {
      when: new RegExp(\`(update|create|delete)\${type}s?\`),
      run: ({ hardReset }) => hardReset()
    }
  });

const Books = props => {
  const { data, loading } = useHardResetQuery("Book", BOOKS_QUERY, { /* search vals */ });

  return null; //elide component code for brevity
}
`);

const microQueryHard4a = indentNormalizer(`
const useHardResetQuery = (type, query, variables, options = {}) =>
  useQuery(query, variables, {
    ...options,
    onMutation: {
      when: new RegExp(\`(update|create|delete)\${type}s?\`),
      run: ({ hardReset }) => hardReset()
    }
  });

const Books = props => {
  const { data, loading } = useHardResetQuery("Book", BOOKS_QUERY, { /* search vals */ });
  // -----------------------------------------^^^^^^

  return null; //elide component code for brevity
}
`);

const microQueryHard5 = indentNormalizer(`
// queryHooks.js
export const useBookHardResetQuery = (...args) => useHardResetQuery("Book", ...args);
export const useSubjectHardResetQuery = (...args) => useHardResetQuery("Subject", ...args);

//Books.js
const Books = props => {
  const { data, loading } = useBookHardResetQuery(BOOKS_QUERY, { /* search vals */ });

  return null;
}
`);

const microQuerySoft1 = indentNormalizer(`
export const useSoftResetQuery = (type, query, variables, options = {}) =>
  useQuery(query, variables, {
    ...options,
    onMutation: {
      when: new RegExp(\`update\${type}s?\`),
      run: ({ softReset, currentResults }, resp) => {
        const updatedItems = resp[\`update\${type}s\`]?.[\`\${type}s\`] ?? [resp[\`update\${type}\`][type]];
        updatedItems.forEach(updatedItem => {
          let CachedItem = currentResults[\`all\${type}s\`][\`\${type}s\`].find(item => item._id == updatedItem._id);
          CachedItem && Object.assign(CachedItem, updatedItem);
        });
        softReset(currentResults);
      }
    },
  });
`);

const Presentation = () => (
  <Deck theme={theme} template={template} transitionEffect="fade">
    <Slide>
      <FlexBox height="100%" flexDirection="column">
        <Heading margin="0px" fontSize="150px">
          GraphQL Caching
        </Heading>
        <Heading margin="0px" fontSize="h2">
          A Different Approach
        </Heading>
        <Heading margin="0px 32px" color="primary" fontSize="h3">
          Doing more with less, with an assist from React Hooks
        </Heading>
      </FlexBox>
    </Slide>
    <Slide transitionEffect="slide">
      <Heading>About me</Heading>

      <UnorderedList>
        <ListItem>Software Engineer at Riot</ListItem>
        <ListItem>
          <FlexBox justifyContent="start">
            <svg width="45" height="45" viewBox="0 0 24 24">
              <g>
                <path
                  style={{ fill: "rgba(29,161,242,1.00)" }}
                  d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"
                ></path>
              </g>
            </svg>
            <span>&nbsp;@adamrackis</span>
          </FlexBox>
        </ListItem>
        <ListItem>
          <FlexBox justifyContent="start">
            <svg class="octicon octicon-mark-github v-align-middle" height="45" viewBox="0 0 16 16" version="1.1" width="45" aria-hidden="true">
              <path
                style={{ fill: "white" }}
                fill-rule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              ></path>
            </svg>
            <span>&nbsp;arackaf</span>
          </FlexBox>
        </ListItem>
      </UnorderedList>
    </Slide>
    <Slide transitionEffect="slide">
      <Heading>These slides</Heading>

      <UnorderedList>
        <ListItem>Are in the micro-graphql-react repo</ListItem>
        <ListItem>There's a link to the actual slideshow in the readme</ListItem>
      </UnorderedList>
    </Slide>
    <Slide transitionEffect="slide">
      <Heading>A Few Things</Heading>

      <UnorderedList>
        <ListItem>Every GraphQL client has tradeoffs</ListItem>
        <ListItem>This talk is about identifying tradeoffs, not picking a "better" client</ListItem>
      </UnorderedList>
    </Slide>

    <Slide transitionEffect="slide">
      <Heading>Identifying GraphQL Types</Heading>

      <Stepper defaultValue={[]} values={[null, null, null, [3, 3], [5, 5], null, [4, 4], [7, 7], [14, 14], [21, 21]]}>
        {(value, step) => (
          <Box position="relative">
            {step === 0 ? (
              <CodePane fontSize={18} language="graphql" autoFillHeight>
                {GraphQLTypeNames1}
              </CodePane>
            ) : null}
            {step === 1 ? (
              <CodePane fontSize={18} language="json" autoFillHeight>
                {GraphQLTypeNames1Results}
              </CodePane>
            ) : null}
            {step >= 2 && step <= 4 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={18}
                language="graphql"
                autoFillHeight
              >
                {GraphQLTypeNames1Types}
              </CodePane>
            ) : null}
            {step > 4 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={14}
                language="json"
                autoFillHeight
              >
                {GraphQLTypeNames1TypesResults}
              </CodePane>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>

    <Slide transitionEffect="slide">
      <Heading>From __typename to caching</Heading>

      <UnorderedList>
        <ListItem>GraphQL clients usually add __typename to queries and mutations</ListItem>
        <ListItem>Keep track of queries run</ListItem>
        <ListItem>Keep track of mutations executed</ListItem>
        <ListItem>Keep track of mutations executed</ListItem>
        <ListItem>Sync everything</ListItem>
        <Appear elementNum={0}>
          <ListItem>There's a Catch</ListItem>
        </Appear>
      </UnorderedList>
    </Slide>

    <Slide transitionEffect="slide">
      <Heading>Caching is Hard</Heading>

      <Box position="relative">
        <FlexBox alignItems="center">
          <Image src="https://github.com/arackaf/micro-graphql-react/blob/master/graphql-texas-slides/src/img/duh.jpg?raw=true" />
        </FlexBox>
      </Box>
    </Slide>
    <Slide>
      <Heading>Approach #1: Normalized Cache</Heading>
      <UnorderedList>
        <Appear elementNum={0}>
          <ListItem>Each item from each result set stored by id and type</ListItem>
        </Appear>
        <Appear elementNum={1}>
          <ListItem>So each result set conceptually stores a list of id's for a given type</ListItem>
        </Appear>
        <Appear elementNum={2}>
          <ListItem>After mutating an item, it's updated in cache, and all query result sets are immediately updated! 🥳 🎉 🍾</ListItem>
        </Appear>
      </UnorderedList>
    </Slide>
    <Slide>
      <Heading>Example</Heading>
      <Stepper defaultValue={[]} values={[null, null, null, null]}>
        {(value, step) => (
          <Box position="relative">
            {step === 0 ? (
              <CodePane fontSize={18} language="graphql" autoFillHeight>
                {normalizedQueryExample1_prelimQuery}
              </CodePane>
            ) : null}
            {step === 1 ? (
              <CodePane fontSize={16} language="json" autoFillHeight>
                {normalizedQueryExample1_prelimResults}
              </CodePane>
            ) : null}
            {step === 2 ? (
              <CodePane fontSize={18} language="js" autoFillHeight>
                {normalizedQueryExample1_prelimCached}
              </CodePane>
            ) : null}
            {step === 3 ? (
              <CodePane fontSize={18} language="js" autoFillHeight>
                {normalizedQueryExample1_prelimCacheObject}
              </CodePane>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>
    <Slide>
      <Heading>Example cont.</Heading>
      <Stepper defaultValue={[]} values={[null, null, null, null]}>
        {(value, step) => (
          <Box position="relative">
            {step === 0 ? (
              <CodePane fontSize={18} language="graphql" autoFillHeight>
                {normalizedQueryExample1_nextQuery}
              </CodePane>
            ) : null}
            {step === 1 ? (
              <CodePane fontSize={16} language="json" autoFillHeight>
                {normalizedQueryExample1_nextResults}
              </CodePane>
            ) : null}
            {step === 2 ? (
              <CodePane fontSize={18} language="js" autoFillHeight>
                {normalizedQueryExample1_nextCached}
              </CodePane>
            ) : null}
            {step === 3 ? (
              <CodePane fontSize={14} language="js" autoFillHeight>
                {normalizedQueryExample1_nextCacheObject}
              </CodePane>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>
    <Slide>
      <Heading>Example cont.</Heading>
      <Stepper values={[null, null, null, null]}>
        {(value, step) => (
          <Box position="relative">
            {step === 0 ? (
              <CodePane fontSize={18} language="graphql" autoFillHeight>
                {normalizedQueryExample1_fix}
              </CodePane>
            ) : null}
            {step === 1 ? (
              <CodePane fontSize={18} language="json" autoFillHeight>
                {normalizedQueryExample1_fixResults}
              </CodePane>
            ) : null}
            {step === 2 ? (
              <CodePane highlightStart={10} highlightEnd={10} fontSize={14} language="js" autoFillHeight>
                {normalizedQueryExample1_fixResultsObjectCache}
              </CodePane>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>
    <Slide>
      <Heading>Example cont.</Heading>
      <Stepper values={[null, null]}>
        {(value, step) => (
          <Box position="relative">
            {step === 0 ? (
              <CodePane fontSize={18} language="js" autoFillHeight>
                {normalizedQueryExample1_nextCached}
              </CodePane>
            ) : null}
            {step === 1 ? (
              <CodePane fontSize={14} language="js" autoFillHeight>
                {normalizedQueryExample1_fixResultsObjectCache}
              </CodePane>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>

    <Slide transitionEffect="slide">
      <Heading>It Just Works</Heading>

      <UnorderedList>
        <ListItem>Book #2 is updated in cache</ListItem>
        <ListItem>All queries with Book #2 in its results automatically see updated values</ListItem>
      </UnorderedList>
    </Slide>

    <Slide>
      <Heading>Hooray!</Heading>
      <Box position="relative">
        <FlexBox alignItems="center">
          <Image src="https://github.com/arackaf/micro-graphql-react/blob/master/graphql-texas-slides/src/img/magic.gif?raw=true" />
        </FlexBox>
      </Box>
    </Slide>

    <Slide>
      <Heading>What could go wrong?</Heading>
      <Stepper values={[null, null, null, null, null, [4, 4]]}>
        {(value, step) => (
          <Box position="relative">
            {step === 0 ? (
              <CodePane fontSize={18} language="graphql" autoFillHeight>
                {normalizedQueryProblem1_query}
              </CodePane>
            ) : null}
            {step === 1 ? (
              <CodePane fontSize={18} language="json" autoFillHeight>
                {normalizedQueryProblem1_initialResults}
              </CodePane>
            ) : null}
            {step === 2 ? (
              <CodePane fontSize={18} language="graphql" autoFillHeight>
                {normalizedQueryProblem1_mutation}
              </CodePane>
            ) : null}
            {step === 3 ? (
              <CodePane fontSize={18} language="js" autoFillHeight>
                {normalizedQueryProblem1_objectCache}
              </CodePane>
            ) : null}
            {step >= 4 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={18}
                language="js"
                autoFillHeight
              >
                {normalizedQueryProblem1_queryCache}
              </CodePane>
            ) : null}
            {step === 5 ? (
              <Box position="absolute" bottom="-4rem" left="0rem" right="0rem" bg="black">
                <Text fontSize="1.5rem" margin="0rem">
                  Task #2 was re-assigned to Bob. It should no longer be in the results for this query.
                </Text>
              </Box>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>

    <Slide transitionEffect="slide">
      <Heading>What Should Have Happened</Heading>

      <UnorderedList>
        <ListItem>
          Task #2 should have been <b>ejected</b> from that result set
        </ListItem>
        <ListItem>GraphQL clients that use normalized caching of course have escape hatches for this</ListItem>
        <ListItem>
          They <b>tend</b> to be tricky to get right
        </ListItem>
        <ListItem>Please don't take my word for it - evaluate any tool you're considering using.</ListItem>
        <ListItem>This talk is about identifying tradeoffs - not judging which client is better.</ListItem>
      </UnorderedList>
    </Slide>

    <Slide transitionEffect="slide">
      <Heading>Does this mean normalized caching is bad?</Heading>

      <UnorderedList>
        <Appear elementNum={0}>
          <ListItem>Of course not</ListItem>
        </Appear>
        <Appear elementNum={1}>
          <ListItem>Clients provide escape hatches to modify your cache for situations like this</ListItem>
        </Appear>
        <Appear elementNum={2}>
          <ListItem>Just know what they are before you decide on a solution, and confirm they fit with your application's needs</ListItem>
        </Appear>
      </UnorderedList>
    </Slide>

    <Slide>
      <Heading style={{ marginBottom: 0 }}>URQL</Heading>
      <UnorderedList style={{ marginTop: 0 }}>
        <Appear elementNum={0}>
          <FlexBox alignItems="center">
            <Image
              height="500"
              src="https://github.com/arackaf/micro-graphql-react/blob/master/graphql-texas-slides/src/img/ken_wheeler.jpeg?raw=true"
            />
          </FlexBox>
        </Appear>
      </UnorderedList>
    </Slide>
    <Slide>
      <Heading>Approach #2: Urql</Heading>
      <UnorderedList>
        <Appear elementNum={0}>
          <ListItem>
            Keep track of which <span style={{ fontWeight: "bold" }}>types</span> each query returns
          </ListItem>
        </Appear>
        <Appear elementNum={1}>
          <ListItem>
            When any mutation modifies data of that type, invalidate the <span style={{ fontWeight: "bold" }}>entire result set</span>
          </ListItem>
        </Appear>
      </UnorderedList>
    </Slide>
    <Slide>
      <Heading>Urql in practice</Heading>
      <Stepper values={[null, null, null, null, null, null, null]}>
        {(value, step) => (
          <Box position="relative">
            {step === 0 ? (
              <CodePane fontSize={18} language="graphql" autoFillHeight>
                {normalizedQueryUrql_query}
              </CodePane>
            ) : null}
            {step === 1 ? (
              <CodePane fontSize={18} language="json" autoFillHeight>
                {normalizedQueryUrql_initialResults}
              </CodePane>
            ) : null}
            {step === 2 ? (
              <CodePane fontSize={18} language="js" autoFillHeight>
                {normalizedQueryUrql_queryCache1}
              </CodePane>
            ) : null}
            {step === 3 ? (
              <CodePane fontSize={18} language="js" autoFillHeight>
                {normalizedQueryUrql_mutation}
              </CodePane>
            ) : null}
            {step >= 4 ? (
              <CodePane fontSize={18} language="js" autoFillHeight>
                {normalizedQueryUrql_queryCache2}
              </CodePane>
            ) : null}
            {step >= 5 ? (
              <Box position="absolute" bottom="-4rem" left="0rem" right="0rem" bg="black">
                <Text fontSize="1.5rem" margin="0rem">
                  Query cache is now empty
                </Text>
              </Box>
            ) : null}
            {step == 6 ? (
              <Box position="absolute" bottom="-10rem" left="0rem" right="0rem" bg="black">
                <Text fontSize="1.5rem" margin="0rem">
                  Existing results stay on screen, and are refreshed from the server in the background
                </Text>
              </Box>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>
    <Slide>
      <Heading>This is perfect right?</Heading>
      <UnorderedList>
        <Appear elementNum={0}>
          <ListItem>
            We're keeping track of which <span style={{ fontWeight: "bold" }}>types</span> each query returns
          </ListItem>
        </Appear>
        <Appear elementNum={1}>
          <ListItem>That can fail</ListItem>
        </Appear>
      </UnorderedList>
    </Slide>

    <Slide>
      <Heading>Urql in practice</Heading>
      <Stepper values={[null, null, [5, 5], [5, 5]]}>
        {(value, step) => (
          <Box position="relative">
            {step === 0 ? (
              <CodePane fontSize={18} language="graphql" autoFillHeight>
                {urqlEmpty_Query}
              </CodePane>
            ) : null}
            {step >= 1 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={18}
                language="json"
                autoFillHeight
              >
                {urqlEmpty_Results}
              </CodePane>
            ) : null}
            {step >= 2 ? (
              <Box position="absolute" bottom="-4rem" left="0rem" right="0rem" bg="black">
                <Text fontSize="1.5rem" margin="0rem">
                  We don't know what type this is; there's nothing to attach <CodeSpan fontSize="1.3rem">__typename</CodeSpan> to
                </Text>
              </Box>
            ) : null}
            {step >= 3 ? (
              <Box position="absolute" bottom="-10rem" left="0rem" right="0rem" bg="black">
                <Text fontSize="1.5rem" margin="0rem">
                  Unsurprisingly Urql allows you to just tell it which types a query deals with for this very reason
                </Text>
              </Box>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>

    <Slide>
      <Heading>Urql in practice</Heading>
      <UnorderedList>
        <ListItem>Urql is correct by default</ListItem>
        <ListItem>It's a step beyond normalized caching (imo ymmv)</ListItem>
        <ListItem>Some more flexible cache update mechanisms would be nice...</ListItem>
      </UnorderedList>
    </Slide>

    <Slide>
      <Heading>micro-graphql-react</Heading>
      <UnorderedList>
        <ListItem>Results are cached by query (like urql)</ListItem>
        <ListItem>Cache updates are completely flexible</ListItem>
        <Appear elementNum={0}>
          <ListItem>...meaning you do everything yourself</ListItem>
        </Appear>
        <Appear elementNum={1}>
          <ListItem>...it's not as bad as it seems</ListItem>
        </Appear>
      </UnorderedList>
    </Slide>

    <Slide>
      <Heading>micro-graphql-react terminology</Heading>
      <UnorderedList>
        <ListItem>Hard Reset: Clear cache and reload the query</ListItem>
        <ListItem>Soft Reset: Clear cache, but update, and leave current results on screen</ListItem>
        <ListItem>Also allows you to just update the raw cache</ListItem>
      </UnorderedList>
    </Slide>

    <Slide>
      <Heading>Example</Heading>

      <Stepper values={[null, [6, 9]]}>
        {(value, step) => (
          <Box position="relative">
            <CodePane highlightStart={value ? value[0] : void 0} highlightEnd={value ? value[1] : void 0} fontSize={18} language="js" autoFillHeight>
              {microQuery1}
            </CodePane>

            {step == 1 ? (
              <Box position="absolute" bottom="-4rem" left="0rem" right="0rem" bg="black">
                <Text fontSize="1.5rem" margin="0rem">
                  This is how we specify the cache updates we want
                </Text>
              </Box>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>

    <Slide>
      <Heading>Managing that bloat with hooks</Heading>
      <Stepper values={[null, null, [7, 8], null, [1, 1], [2, 8], [5, 5], [11, 12], null, [0, 3], [7, 7]]}>
        {(value, step) => (
          <Box position="relative">
            {step === 0 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={18}
                language="js"
                autoFillHeight
              >
                {microQueryHard1}
              </CodePane>
            ) : null}
            {step === 1 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={18}
                language="js"
                autoFillHeight
              >
                {microQueryHard2}
              </CodePane>
            ) : null}
            {step === 2 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={18}
                language="js"
                autoFillHeight
              >
                {microQueryHard3}
              </CodePane>
            ) : null}
            {step === 3 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={18}
                language="js"
                autoFillHeight
              >
                {microQueryHard4}
              </CodePane>
            ) : null}
            {step >= 4 && step <= 7 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={18}
                language="js"
                autoFillHeight
              >
                {microQueryHard4a}
              </CodePane>
            ) : null}
            {step >= 8 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={18}
                language="js"
                autoFillHeight
              >
                {microQueryHard5}
              </CodePane>
            ) : null}

            {step >= 8 ? (
              <Box position="absolute" bottom="-4rem" left="0rem" right="0rem" bg="black">
                <Text fontSize="1.5rem" margin="0rem">
                  MOAR HOOKS
                </Text>
              </Box>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>

    <Slide>
      <Heading>Perspective</Heading>
      <UnorderedList>
        <ListItem>We haven't done much yet</ListItem>
        <ListItem>Just hard resetting isn't complicated</ListItem>
        <ListItem>Urql does this out of the box for free</ListItem>
        <ListItem>Other use cases are more complicated</ListItem>
      </UnorderedList>
    </Slide>

    <Slide>
      <Heading>Soft reset (real quick)</Heading>

      <Stepper values={[null, [1, 1], [5, 5], [7, 7], [8, 11], [12, 12]]}>
        {(value, step) => (
          <Box position="relative">
            {step >= 0 ? (
              <CodePane
                highlightStart={value ? value[0] : void 0}
                highlightEnd={value ? value[1] : void 0}
                fontSize={18}
                language="js"
                autoFillHeight
              >
                {microQuerySoft1}
              </CodePane>
            ) : null}
            {step >= 1 ? (
              <Box position="absolute" bottom="-4rem" left="0rem" right="0rem" bg="black">
                <Text fontSize="1.5rem" margin="0rem">
                  {step == 1 ? "Take in the type" : null}
                  {step == 2 ? "Use type to subscribe to the right mutations—could be a single update mutation, or multi update mutation" : null}
                  {step == 3 ? "Get the updated record(s)—again, could be a single update mutation, or multi update mutation" : null}
                  {step == 4 ? "Update the cached records" : null}
                  {step == 5
                    ? "Keep updated results on screen, completely clear cache. All *future* queries (including this one) will read from network"
                    : null}
                </Text>
              </Box>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>

    <Slide>
      <Heading>Perspective</Heading>
      <UnorderedList>
        <ListItem>It's more work</ListItem>
        <ListItem>Those are just updates</ListItem>
        <ListItem>Should account for inserts and deletes (soft reset without changing current results?)</ListItem>
        <ListItem>But it's doable, and you have the option. That's why I made this</ListItem>
        <ListItem>That SoftReset hook? You only have to write it once (assuming your Schema is consistent)</ListItem>
      </UnorderedList>
    </Slide>

    <Slide>
      <Heading>Picking the right GraphQL client</Heading>
      <UnorderedList>
        <ListItem>Ask the right questions</ListItem>
        <ListItem>The requirements for *your* app are all that matter</ListItem>
        <ListItem>Do the problems with normalized caching even apply?</ListItem>
        <ListItem>Is Urql's behavior good enough for your app? Use it if so.</ListItem>
      </UnorderedList>
    </Slide>

    <Slide>
      <Heading>Questions?</Heading>
    </Slide>
  </Deck>
);

ReactDOM.render(<Presentation />, document.getElementById("root"));
