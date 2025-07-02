/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_113564862")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_113564862",
    "hidden": false,
    "id": "relation720079437",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "subtasks",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_113564862")

  // remove field
  collection.fields.removeById("relation720079437")

  return app.save(collection)
})
