import { createMachine, assign } from 'xstate'

export default createMachine(
  {
    id: 'everdrive',
    type: 'parallel',
    predictableActionArguments: true,
    preserveActionOrder: true,
    states: {
      'auth state': {
        initial: 'signed out',
        states: {
          'signed out': {
            entry: assign({ signedIn: false }),
            on: {
              'sign in': {
                target: 'signing in',
              },
            },
          },
          'signing in': {
            invoke: {
              src: 'signIn',
              id: 'signIn',
              onDone: [
                {
                  target: 'signed in',
                },
              ],
            },
          },
          'signed in': {
            entry: assign({ signedIn: true }),
            on: {
              'sign out': {
                target: 'signing out',
              },
            },
          },
          'signing out': {
            invoke: {
              src: 'signOut',
              id: 'signOut',
              onDone: [
                {
                  target: 'signed out',
                },
              ],
            },
          },
        },
      },
      'app state': {
        initial: 'loading notes',
        states: {
          'loading notes': {
            invoke: {
              src: 'getNotes',
              id: 'getNotes',
              onDone: [
                {
                  target: 'viewing notes',
                  actions: assign({ notes: (context, event) => {} }),
                },
              ],
            },
          },
          'viewing notes': {
            on: {
              'select label': {
                internal: true,
              },
              'select note': {
                target: 'loading note',
              },
              add: {
                target: 'adding note',
                cond: 'signedIn',
              },
            },
          },
          'loading note': {
            invoke: {
              src: 'getNote',
              id: 'getNote',
              onDone: [
                {
                  target: 'viewing note',
                },
              ],
            },
          },
          'adding note': {
            on: {
              cancel: {
                target: 'viewing notes',
              },
              save: {
                target: 'saving new note',
              },
            },
          },
          'viewing note': {
            on: {
              edit: {
                target: 'editing note',
                cond: 'signedIn',
              },
              close: {
                target: 'viewing notes',
              },
            },
          },
          'saving new note': {
            invoke: {
              src: 'addNote',
              id: 'addNote',
              onDone: [
                {
                  target: 'viewing note',
                },
              ],
            },
          },
          'editing note': {
            on: {
              cancel: {
                target: 'viewing note',
              },
              save: {
                target: 'saving note',
              },
            },
          },
          'saving note': {
            invoke: {
              src: 'modifyNote',
              id: 'modifyNote',
              onDone: [
                {
                  target: 'viewing note',
                },
              ],
            },
          },
        },
      },
    },
  },
  {
    actions: {},
    services: {
      signIn: (context, event) => {},

      signOut: (context, event) => {},

      getNotes: (context, event) => {},

      modifyNote: (context, event) => {},

      getNote: (context, event) => {},

      addNote: (context, event) => {},
    },
    guards: { signedIn: (context, event) => false },
    delays: {},
  }
)
