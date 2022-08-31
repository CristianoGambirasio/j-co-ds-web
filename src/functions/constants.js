// Server response codes
exports.LIST_DATABASE_RESPONSE = [0, 1, 0, 2]
exports.LIST_COLLECTION_RESPONSE = [0, 2, 0, 2]
exports.LIST_URL_RESPONSE = [0, 3, 0, 6]
exports.CREATE_DATABASE_RESPONSE = [0, 1, 0, 4]
exports.CREATE_COLLECTION_RESPONSE = [0, 2, 0, 4]
exports.CREATE_DYNAMIC_COLLECTION_RESPONSE = [0, 2, 0, 24]
exports.CREATE_VIRTUAL_COLLECTION_RESPONSE = [0, 2, 0, 14]
exports.ADD_URL_RESPONSE = [0, 3, 0, 2]
exports.GET_COLLECTION_RESPONSE = [0, 2, 0, 8]
exports.DELETE_DATABASE_RESPONSE = [0, 1, 0, 6]
exports.DELETE_COLLECTION_RESPONSE = [0, 2, 0, 6]
exports.REMOVE_URL_RESPONSE = [0, 3, 0, 4]
exports.GET_COLLECTION_COUNT_RESPONSE = [0, 2, 0, 12]
exports.PING_RESPONSE = [0, 0, 0, 2]
exports.SAVE_COLLECTION_RESPONSE = [0, 2, 0, 10]
exports.SET_FREQUENCY_RESPONSE = [0, 4, 0, 2]
exports.SET_UPDATE_TYPE_RESPONSE = [0, 4, 0, 4]
exports.STOP_UPDATE_RESPONSE = [0, 4, 0, 6]

// WebSocket commands
exports.WS_LIST_DATABASE = 'LIST_DATABASE'
exports.WS_LIST_COLLECTION = 'LIST_COLLECTIONS'
exports.WS_LIST_URL = 'LIST_URL'
exports.WS_GET_COLLECTION_COUNT = 'GET_COLLECTION_COUNT'
exports.WS_CREATE_DATABASE = 'CREATE_DATABASE'
exports.WS_CREATE_COLLECTION = 'CREATE_COLLECTION'
exports.WS_CREATE_DYNAMIC_COLLECTION = 'CREATE_DYNAMIC_COLLECTION'
exports.WS_CREATE_VIRTUAL_COLLECTION = 'CREATE_VIRTUAL_COLLECTION'
exports.WS_ADD_URL = 'ADD_URL'
exports.WS_GET_COLLECTION = 'GET_COLLECTION'
exports.WS_SAVE_COLLECTION = 'SAVE_COLLECTION'
exports.WS_SET_FREQUENCY = 'SET_FREQUENCY'
exports.WS_SET_UPDATE_TYPE = 'SET_UPDATE_TYPE'
exports.WS_STOP_UPDATE = 'STOP_UPDATE'
exports.WS_DELETE_DATABASE = 'DELETE_DATABASE'
exports.WS_DELETE_COLLECTION = 'DELETE_COLLECTION'
exports.WS_REMOVE_URL = 'REMOVE_URL'
exports.WS_PING = 'PING'
exports.WS_PING_ERROR_RESPONSE = [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1]

// Server request codes
exports.LIST_DATABASE = '00010001'
exports.LIST_COLLECTION = '00020001'
exports.LIST_URL = '00030005'
exports.CREATE_DATABASE = '00010003'
exports.CREATE_COLLECTION = '00020003'
exports.CREATE_DYNAMIC_COLLECTION = '00020023'
exports.CREATE_VIRTUAL_COLLECTION = '00020013'
exports.ADD_URL = '00030001'
exports.GET_COLLECTION_COUNT = '0002000b'
exports.GET_COLLECTION = '00020007'
exports.DELETE_DATABASE = '00010005'
exports.DELETE_COLLECTION = '00020005'
exports.REMOVE_URL = '00030003'
exports.SAVE_COLLECTION = '00020009'
exports.SET_FREQUENCY = '00040001'
exports.SET_UPDATE_TYPE = '00040003'
exports.STOP_UPDATE = '00040005'
exports.PING = '00000001'
