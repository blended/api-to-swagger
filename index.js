const j2s = require('@blended/joi-to-swagger')
const Type = require('joi')

let t = Type.object().__proto__

t.name = function(s) {
  let obj = this.clone()
  obj._name = s
  return obj
}

t.summary = function(s) {
  let obj = this.clone()
  obj._summary = s
  return obj
}

let _ = (schema) => ({ schema: j2s.getSchemaObject(schema) })

let transform = module.exports = (api) => {
  let paths = {}
  let definitions = {}
  let definitionsMap = []

  for (let tag in api) {
    for (let endpoint in api[tag]) {
      let [method, path] = endpoint.split(' ')
      let endpointDef = api[tag][endpoint]
      method = method.toLowerCase()
      let parameters = []

      if ('body' in endpointDef) {
        let index = definitionsMap.map(d => d.def).indexOf(endpointDef.body)
        let ref
        if (index >= 0) {
          ref = definitionsMap[index].name
        } else {
          let schema = _(endpointDef.body).schema
          ref = endpointDef.body._name
          definitionsMap.push({
            name: ref,
            def: endpointDef.body,
            schema
          })
          definitions[ref] = schema
        }
        parameters.push({
          name: 'attributes',
          in: 'body',
          required: true,
          schema: {
            $ref: '#/definitions/' + ref
          }
        })
      }

      if ('query' in endpointDef) {
        let index = definitionsMap.map(d => d.def).indexOf(endpointDef.query)
        let ref
        let schema
        if (index >= 0) {
          ref = definitionsMap[index].name
          schema = definitions[ref]
        } else {
          schema = _(endpointDef.query).schema
          ref = endpointDef.query._name
          definitionsMap.push({
            name: ref,
            def: endpointDef.query,
            schema
          })
          definitions[ref] = schema
        }

        if (endpointDef.query._inner.children) {
          endpointDef.query._inner.children.forEach(c => {
            switch (c.schema._type) {
              case 'array':
                parameters.push({
                  name: c.key,
                  in: 'query',
                  required: false,
                  type: c.schema._type,
                  items: {
                    type: c.schema._inner.items[0]._type
                  }
                })
                break

              default:
                parameters.push({
                  name: c.key,
                  in: 'query',
                  required: false,
                  type: c.schema._type
                })
                break
            }
          })
        }
      }

      if ('params' in endpointDef) {
        let index = definitionsMap.map(d => d.def).indexOf(endpointDef.params)
        let ref
        let schema
        if (index >= 0) {
          ref = definitionsMap[index].name
          schema = definitions[ref]
        } else {
          schema = _(endpointDef.params).schema
          ref = endpointDef.params._name
          definitionsMap.push({
            name: ref,
            def: endpointDef.params,
            schema
          })
          definitions[ref] = schema
        }

        endpointDef.params._inner.children.forEach(c => {
          parameters.push({
            name: c.key,
            in: 'path',
            required: c.schema._flags.presence === 'required',
            type: c.schema._type
          })
        })
      }

      paths[path] = paths[path] || {}
      paths[path][method] = {
        tags: [tag],
        summary: endpointDef.summary,
        description: endpointDef.description,
        parameters,
        responses: Object.keys(endpointDef.responses).reduce((p, n) => {
          let index = definitionsMap.map(d => d.def).indexOf(endpointDef.responses[n])
          let ref
          if (index >= 0) {
            ref = definitionsMap[index].name
          } else {
            let schema = _(endpointDef.responses[n]).schema
            ref = endpointDef.responses[n]._name
            definitionsMap.push({
              name: ref,
              def: endpointDef.responses[n],
              schema
            })
            definitions[ref] = schema
          }

          p[n] = { schema: { $ref: '#/definitions/' + ref } }

          return p
        }, {})
      }
    }
  }

  return { paths, definitions }
}
