/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_113564862")

  // update collection data
  unmarshal({
    "name": "tasks"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_113564862")

  // update collection data
  unmarshal({
    "name": "todos"
  }, collection)

  return app.save(collection)
})
