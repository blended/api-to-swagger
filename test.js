const assert = require('assert')
const Type = require('joi')
const apiToSwagger = require('./')

let api = {
  'Foo': {
    'GET /foo': {
      summary: 'Returns Foo',
      description: 'A longer description of this operation',
      query: Type.object().keys({
        id: Type.number().positive()
      }).name('FooQuery'),
      responses: {
        200: Type.object().name('FooResponse')
      }
    }
  },
  'Bar': {
    'POST /bar': {
      summary: 'Creates a Bar',
      description: 'A longer description of this operation',
      body: Type.object().keys({
        zoo: Type.number().positive().required()
      }).name('BarBody'),
      responses: {
        201: Type.object().name('BarResponse')
      }
    }
  }
}

let actual = apiToSwagger(api)

let expected = {
  "paths": {
    "/foo": {
      "get": {
        "tags": [
          "Foo"
        ],
        "summary": "Returns Foo",
        "description": "A longer description of this operation",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "type": "number"
          }
        ],
        "responses": {
          "200": {
            "schema": {
              "$ref": "#/definitions/FooResponse"
            }
          }
        }
      }
    },
    "/bar": {
      "post": {
        "tags": [
          "Bar"
        ],
        "summary": "Creates a Bar",
        "description": "A longer description of this operation",
        "parameters": [
          {
            "name": "attributes",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/BarBody"
            }
          }
        ],
        "responses": {
          "201": {
            "schema": {
              "$ref": "#/definitions/BarResponse"
            }
          }
        }
      }
    }
  },
  "definitions": {
    "FooQuery": {
      "type": "object",
      "description": "",
      "properties": {
        "id": {
          "type": "number"
        }
      },
      "required": []
    },
    "FooResponse": {
      "type": "object",
      "description": "",
      "properties": {},
      "required": []
    },
    "BarBody": {
      "type": "object",
      "description": "",
      "properties": {
        "zoo": {
          "type": "number"
        }
      },
      "required": [
        "zoo"
      ]
    },
    "BarResponse": {
      "type": "object",
      "description": "",
      "properties": {},
      "required": []
    }
  }
}

assert.deepEqual(actual, expected, 'output is as expected')
