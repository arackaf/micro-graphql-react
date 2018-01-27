export default {
  table: "books",
  typeName: "Book",
  fields: {
    _id: "MongoId",
    ean: "String",
    isbn: "String",
    title: "String",
    smallImage: "String",
    mediumImage: "String",
    userId: "String",
    publisher: "String",
    publicationDate: "String",
    pages: "Int",
    authors: "StringArray",
    subjects: "StringArray",
    tags: "StringArray",
    isRead: "Boolean",
    dateAdded: "String"
  }
};