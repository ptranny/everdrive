# Demo
https://main.d3vrje1l0nc6s.amplifyapp.com/
# Overview

## Problem
My digital documents are spread across a variety of cloud platforms because no single system provides the functionality I need. It is often difficult to:
- find documents that are related to each other because they are not co-located
- find specific documents because they are not searchable
- get information about what a document relates to without opening it up

## Goal
Create a cloud-native document management system (DMS) that combines features of Evernote and Google Drive.

# Context
## Current state of the art
Platforms like Evernote favour textual data, which lends itself well to  search. Finding things quickly is easy. The interface is centered around 'notes'. You can attach files to a note but there is no view where you can, for example, list all the files associated with a particular note or vice versa. The files are secondary to the notes and do not have their own metadata.

On the other hand, platforms like Google Drive or Dropbox have an interface centered around 'files', which is the same model as the typical hierarchical file systems we are used to. Related files are logically grouped into folders rather than notes. Files have limited metadata hence search is limited.

# Design

## Definitions
A "document" is human-readable data of some kind - image/audio/video files, PDF, Powerpoint, spreadsheet, etc.

A "note" is a piece of text that can link to a document.

## Features
Core features. The user can:
- create notes
- upload documents
- link notes to documents
- see what documents are associated with a note and vice versa
- search notes 
- search notes and document metadata

## User Interface

Wireframes to come.

## Architecture

### Infrastructure

Using a cloud-native approach offers a lot of general benefits, like the ability to scale easily and removing the "undifferentiated heavy lifting" of provisioning infrastructure. I chose AWS because that is the cloud provider I am most familiar with.

Specifically for this application, AWS S3 offers a storage service that would work well as the storage layer. S3 uses object storage which means that:  
  1. When objects are modified the whole object is rewritten rather than incrementally modified
  2. Objects are stored in a flat namespace and accessed via keys instead of a hierarchical file path

Both of these features work well for the design of the app. I expect that most of the data will be write once, read many, and that the documents being modified will be relatively small. This means objects will be modified infrequently and even when they are, it will not be expensive. The ability to reference documents via individual keys means that they can be treated as first-class citizens with their own rich metadata. This opens up possibilities for indexing and searching.

Other AWS services that will likely be used, subject to further exploration:
- DynamoDB or similar NoSQL database. I think a NoSQL solution is the right fit because:
  1. flexible schema can evolve with the app
  2. only need to express simple relationships
  3. no complex queries required, therefore don't need the overhead of a relational database
- ElasticSearch for full-text search

### Front End

- React for a responsive, native-like UI experience
- Tailwind CSS. I have experimented with different approaches to styling including styled components, and I prefer utility classes for ease of development and maintainability

### Back End

AWS Amplify provides a high-level, opinionated framework for building web/mobile applications on a AWS back end. The other option would be to use the AWS SDK but Amplify abstracts away many of the rote tasks of provisioning the back end and would allow faster development.

### Toolchain

Vite for ease of development and bundling.