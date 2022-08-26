// Server response codes
const LIST_DATABASE_RESPONSE = [0, 1, 0, 2]
const LIST_COLLECTION_RESPONSE = [0, 2, 0, 2]
const LIST_URL_RESPONSE = [0, 3, 0, 6]
const CREATE_DATABASE_RESPONSE = [0, 1, 0, 4]
const CREATE_COLLECTION_RESPONSE = [0, 2, 0, 4]
const CREATE_DYNAMIC_COLLECTION_RESPONSE = [0, 2, 0, 24]
const CREATE_VIRTUAL_COLLECTION_RESPONSE = [0, 2, 0, 14]
const ADD_URL_RESPONSE = [0, 3, 0, 2]
const GET_COLLECTION_RESPONSE = [0, 2, 0, 8]
const DELETE_DATABASE_RESPONSE = [0, 1, 0, 6]
const DELETE_COLLECTION_RESPONSE = [0, 2, 0, 6]
const REMOVE_URL_RESPONSE = [0, 3, 0, 4]
const GET_COLLECTION_COUNT_RESPONSE = [0, 2, 0, 12]
const PING_RESPONSE = [0, 0, 0, 2]
const SAVE_COLLECTION_RESPONSE = [0, 2, 0, 10]
const SET_FREQUENCY_RESPONSE = [0, 4, 0, 2]

// WebSocket commands
const WS_LIST_DATABASE = 'LIST_DATABASE'
const WS_LIST_COLLECTION = 'LIST_COLLECTIONS'
const WS_LIST_URL = 'LIST_URL'
const WS_GET_COLLECTION_COUNT = 'GET_COLLECTION_COUNT'
const WS_CREATE_DATABASE = 'CREATE_DATABASE'
const WS_CREATE_COLLECTION = 'CREATE_COLLECTION'
const WS_CREATE_DYNAMIC_COLLECTION = 'CREATE_DYNAMIC_COLLECTION'
const WS_CREATE_VIRTUAL_COLLECTION = 'CREATE_VIRTUAL_COLLECTION'
const WS_ADD_URL = 'ADD_URL'
const WS_GET_COLLECTION = 'GET_COLLECTION'
const WS_SAVE_COLLECTION = 'SAVE_COLLECTION'
const WS_SET_FREQUENCY = 'SET_FREQUENCY'
const WS_DELETE_DATABASE = 'DELETE_DATABASE'
const WS_DELETE_COLLECTION = 'DELETE_COLLECTION'
const WS_REMOVE_URL = 'REMOVE_URL'
const WS_PING = 'PING'
