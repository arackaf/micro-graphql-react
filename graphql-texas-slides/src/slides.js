import React, { useContext } from "react";
import ReactDOM from "react-dom";

import { ThemeContext } from "styled-components";

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
      <Heading>A Few Things</Heading>

      <OrderedList>
        <ListItem>Every GraphQL client has tradeoffs</ListItem>
        <ListItem>This talk is about identifying tradeoffs, not picking a "better" client</ListItem>
      </OrderedList>
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

      <OrderedList>
        <ListItem>GraphQL clients usually add __typename to queries and mutations</ListItem>
        <ListItem>Keep track of queries run</ListItem>
        <ListItem>Keep track of mutations executed</ListItem>
        <ListItem>Keep track of mutations executed</ListItem>
        <ListItem>Sync everything</ListItem>
        <Appear elementNum={0}>
          <ListItem>There's a Catch</ListItem>
        </Appear>
      </OrderedList>
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
      <OrderedList>
        <Appear elementNum={0}>
          <ListItem>Each item from each result set stored by id and type</ListItem>
        </Appear>
        <Appear elementNum={1}>
          <ListItem>So each result set conceptually stores a list of id's for a given type</ListItem>
        </Appear>
        <Appear elementNum={2}>
          <ListItem>After mutating an item, it's updated in cache, and all query result sets are immediately updated! 🥳 🎉 🍾</ListItem>
        </Appear>
      </OrderedList>
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
      <Stepper values={[null, null, null]}>
        {(value, step) => (
          <Box position="relative">
            {step === 0 ? (
              <CodePane fontSize={18} language="js" autoFillHeight>
                {normalizedQueryExample1_prelimCached}
              </CodePane>
            ) : null}
            {step === 1 ? (
              <CodePane fontSize={18} language="js" autoFillHeight>
                {normalizedQueryExample1_nextCached}
              </CodePane>
            ) : null}
            {step === 2 ? (
              <CodePane fontSize={14} language="js" autoFillHeight>
                {normalizedQueryExample1_fixResultsObjectCache}
              </CodePane>
            ) : null}
          </Box>
        )}
      </Stepper>
    </Slide>
    <Slide>
      <FlexBox>
        <Text>These</Text>
        <Text>Text</Text>
        <Text color="secondary">Items</Text>
        <Text fontWeight="bold">Flex</Text>
      </FlexBox>
      <Grid gridTemplateColumns="1fr 2fr" gridColumnGap={15}>
        <Box backgroundColor="primary">
          <Text color="secondary">Single-size Grid Item</Text>
        </Box>
        <Box backgroundColor="secondary">
          <Text>Double-size Grid Item</Text>
        </Box>
      </Grid>
      <Grid gridTemplateColumns="1fr 1fr 1fr" gridTemplateRows="1fr 1fr 1fr" alignItems="center" justifyContent="center" gridRowGap={1}>
        {Array(9)
          .fill("")
          .map((_, index) => (
            <FlexBox paddingTop={0} key={`formidable-logo-${index}`} flex={1}>
              <Image src={formidableLogo} width={100} />
            </FlexBox>
          ))}
      </Grid>
    </Slide>
    <Slide>
      <Markdown>
        {`
          # Layout Tables in Markdown

          | Browser         | Supported | Versions |
          |-----------------|-----------|----------|
          | Chrome          | Yes       | Last 2   |
          | Firefox         | Yes       | Last 2   |
          | Opera           | Yes       | Last 2   |
          | Edge (EdgeHTML) | No        |          |
          | IE 11           | No        |          |
        `}
      </Markdown>
    </Slide>
    <Markdown containsSlides>
      {`
        ### Even write multiple slides in Markdown
        > Wonderfully formatted quotes

        1. Even create
        2. Lists in Markdown


        - Or Unordered Lists
        - Too!!
        Notes: These are notes
        ---
        ### This slide was also generated in Markdown!

        \`\`\`jsx
        const evenCooler = "is that you can do code in Markdown";
        // You can even specify the syntax type!
        \`\`\`

        ### A slide can have multiple code blocks too.

        \`\`\`c
        char[] someString = "Popular languages like C too!";
        \`\`\`

        Notes: These are more notes
      `}
    </Markdown>
  </Deck>
);

ReactDOM.render(<Presentation />, document.getElementById("root"));
