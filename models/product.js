const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title : {
    type : String,
    required : true
  },
  price : {
    type : Number,
    required : true
  },
  description : {
    type : String,
    required : true
  },
  imageUrl : {
    type : String,
    required : true
  },
  userId : {
      type : Schema.Types.ObjectId,
      ref : 'User',
      required : true
  }
  
})

module.exports = mongoose.model('Product', ProductSchema)







// const mongodb = require('mongodb')
// const getDb = require('../util/database').getDb
// const ObjectID = mongodb.ObjectID

// class Product {
//   constructor(title, price, imageUrl, description, id, userId) {
//     this.title = title
//     this.price = price
//     this.imageUrl = imageUrl
//     this.description = description
//     this._id = new ObjectID(id)
//     this.userId =  userId
//   }


//   save() {
//     let db = getDb();
//     return db.collection('products').insertOne(this)
//     .then(res => console.log('yey'))
//     .catch(err => console.log(err))
//   }


//   updateProduct() {
//     let db = getDb();
//     let updateP;
//     if(this._id) {
//       updateP = db.collection('products').updateOne({_id : this._id}, {$set : this})
//     }
//     return updateP
//     .then(res => console.log('updated'))
//     .catch(err => console.log(err))
//   }


//   static fetchAll() {
//     const db = getDb()
//     return db.collection('products').find().toArray()
//     .then(products => {
//       return products
//     })
//     .catch(err => console.log(err))
//   }


//   static findById(prodId) {
//     const db = getDb()
//     return db.collection('products').find({_id : new mongodb.ObjectID(prodId)})
//       .next()
//       .then(product => {
//         console.log(product)
//         return product
//       })
//       .catch(err => console.log(err))
//   }


//   static deleteProduct(prodId) {
//     const db = getDb()
//     return db.collection('products').deleteOne({_id : new ObjectID(prodId)})
//     .then(res => console.log('deleted'))
//     .catch(err => console.log(err))
//   }
// }



// module.exports = Product