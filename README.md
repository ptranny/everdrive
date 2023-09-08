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
Platforms like Evernote favour textual data, which lends itself well to  search. Finding things quickly is easy. The interface is centered around 'notes'. You can attach files to a note but there is no view where you can, for example, list all the files associated with a particular note or vice versa. Files are not first-class citizens with their own metadata.

On the other hand, platforms like Google Drive or Dropbox have an interface centered around 'files', which is the same model as the typical hierarchical file systems we are used to. Related files are logically grouped into folders rather than notes. Files have limited metadata hence search is limited.

# Design

## Definitions
A "document" is human-readable unstructured data of some kind - image/audio/video files, PDF, Powerpoint, spreadsheet, etc.

A "note" is a piece of text that can link to a document.

## Features
Core features. The user can:
- view all notes and files
- view notes and files categorized by a specific label
- create notes
- upload documents
- link notes to documents
- see what documents are associated with a note and vice versa
- add labels to notes and documents
- search note text
- search note and document metadata
## Architecture
### Overview
One of the main goals of this project is to completely decouple the domain logic from both the UI and the data source. I was initially interested in building different versions of the application that could be run on different platforms - for example, a completely offline version that could be run on a local web server with an embedded database like SQLite, or even compiled using something like Tauri or Electron. Decoupling from the data source could be done using a repository pattern where the implementation details specific to a data source are abstracted into  libraries that expose a clean API for data access.

Decoupling from the UI required more careful thought. A common pattern when using front end frameworks that leverage components is to handle the domain logic within the components themselves. The component is responsible for knowing what data to fetch, when to fetch it, and how to handle events. The logic that powers the application is scattered in multiple places, making it hard to understand as a whole. It becomes almost impossible to extract just the domain logic for testing and one ends up testing the framework and the entire UI at the same time.

Modeling the application as a finite state machine provides an elegant solution that centralizes the domain logic and keeps the UI layer 'dumb'. Now its sole responsibility is to forward events to the state machine, and the state machine decides how to transition to the next state. The UI can query the state machine for its current state to make UI-related decisions about what to display. This complete separation of concerns means better testability, code that is easier to maintain, and freedom when it comes to the choice of UI - it could be any front end framework or even a CLI that runs in a back end environment.

Classical state machines are not sufficient to model a complex application but fortunately there is a formalized extension called a state chart that provides for advanced features like parallel and nested machines. State charts are declarative descriptions of a state machine that can, with an appropriate library, also be executed. The declarative nature of a state chart and the idempotency of state machines in general (a given input will always produce the same output) makes it easy to reason about an application's behaviour.

### State Chart
The main state chart can be visualized here:  
[EverDrive state chart](https://stately.ai/registry/editor/410bfe7d-0f11-47a9-b62b-038b4d07416b?machineId=84a57d0f-a61c-4da9-a239-babaeed1b1b1)

The state chart will be updated as more features are planned and implemented, and additionally some features may have their own state chart.
### Front End

I will be using a Javascript library called XState for interpreting and executing state charts. The choice of UI framework is not of great significance, as we have already discussed. I have chosen React with Tailwind for CSS.

One of the design decisions was whether to use MVVM (model-view-view model) to facilitate testing, because the view model provides an abstraction of the view that is more easily tested than the view itself. However, I decided that adding a view model would overcomplicate the architecture since that would also require a way to bind the view and view model together.
### Back End

Using a cloud-native approach offers the possibility of deploying a serverless back end. This is attractive for a few reasons - firstly, the promise of faster development without the need to provision and maintain server instances, and secondly, the ability to scale to zero when demand drops. This works well for an application like this one where the workloads are expected to be inconsistent and infrequent.

I chose AWS because that is the cloud provider I am most familiar with. AWS provides a serverless compute resource (Lambda) as well as serverless databases (Aurora, DynamoDB).

Other services will be required to piece together the entire back end infrastructure:
- Cognito for user authentication and authorization
- S3 for file storage
- IAM to enable client access to AWS services
- API Gateway to handle API requests
- OpenSearch for full text search
- CloudFormation to provision resources in a declarative, repeatable way

AWS Amplify provides a high-level, opinionated framework for building web/mobile applications on a AWS back end. The other option would be to use the AWS SDK but Amplify abstracts away many of the rote tasks of provisioning.

### Data Model

Originally I had planned to use DynamoDB but it proved difficult to design the data model in a way that would faciliate the most common access patterns. For example, a simple access pattern involved retrieving a list of all notes sorted in order of their timestamps. Because DynamoDB partitions data (using a hash of the primary key), the only way to globally sort on a collection of items is to put all of the items inside the same partition. This would have worked but would have defeated the recommended design pattern which is optimized for performance.

Further, the entity relationship diagram shows there are multiple many-to-many relationships between notes, documents, and labels. Modeling this in DynamoDB involved a significant amount of denormalization and duplication. Denormalization is actually a recognized design pattern for NoSQL databases that helps to speed up reads by having related data in one place, but the complexity of trying to model multiple many-to-many relationships lead me to the conclusion that DynamoDB was not the right tool in this case.

![Everdrive entity relationship diagram](design/everdrive.erd.svg)

Aurora is a relational database and therefore the many-to-many relationships can easily be captured using junction tables. In modeling relationships this way, we trade simplicity and speed at write time for more complexity at read time, since the data has to be joined from the entity tables. NoSQL databases make the opposite compromise, where capturing a many-to-many relationship involves writing data in multiple places but reading is ideally fast since the relationship is embedded inside the entity. Thus another consideration in abandoning DynamoDB as a design choice was cost: writing to DynamoDB is an order of magnitude more expensive than reading (in real dollar terms) and tracking all of these relationships was going to involve many write operations.