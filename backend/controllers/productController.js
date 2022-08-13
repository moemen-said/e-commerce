require("../models/product");
const { promisify } = require("util");

const mongoose = require("mongoose");
const readdir = promisify(require("fs").readdir);
const stat = promisify(require("fs").stat);

let Products = mongoose.model("product");
const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const Category = require("../models/category");

module.exports.getAllProducts = (req, res, next) => {
  Products.find({})
    .then((data) => {
      res.status(200).json({ status: "success", data });
    })
    .catch((error) => next(error));
};

module.exports.addProduct = (req, res, next) => {
  let newProduct = new Products({
    name: req.body.name,
    description: req.body.description,
    brand: req.body.brand,
    price: req.body.price,
    countInStock: req.body.countInStock,
    businessId: req.body.businessId,
    category: req.body.category,
  });
  newProduct
    .save()
    .then((data) => {
      res
        .status(201)
        .json({ status: "success", message: "product added", data: data });
    })
    .catch((err) => next(err));
};

module.exports.updateProduct = (req, res, next) => {
  console.log(req.body);
  if (
    req.role === "admin" ||
    (req.role === "business" && req.id == req.body.id)
  ) {
    Products.findOne({ _id: req.body.id })
      .then((data) => {
        for (prop in req.body) {
          data[prop] = req.body[prop];
        }
        return data.save().then((data) => {
          res.status(200).json({
            success: true,
            status: "success",
            message: "product updated",
          });
        });
      })
      .catch((err) => next(err));
  }
};

module.exports.getOneProduct = async (req, res, next) => {
  try {
    const product = await Products.findOne({ _id: req.params.id }).populate(
      "businessId"
    );
    if (!product) throw new Error("Couldnt find a product with that id");
    directoryPath = path.join(
      __dirname,
      "..",
      "images",
      "products",
      req.params.id
    );
    fs.readdir(directoryPath, (err, files) => {
      if (err)
        return res.status(400).json({
          success: false,
          msg: "Unable to scan directory! " + err.message,
        });
      let images = [];
      files.forEach((file) => {
        let bitmap = fs.readFileSync(
          path.join(__dirname, "..", "images", "products", req.params.id, file)
        );
        images.push(
          "data:image/jpeg;base64," + new Buffer(bitmap).toString("base64")
        );
      });
      const fullData = { ...product._doc, images: images };
      res.json({ success: true, fullData });
    });
  } catch (error) {
    next(error);
  }
};

// module.exports.getOneProduct = async (req, res, next) => {
//   try {
//     const product = await Products.findOne({ _id: req.params.id }).populate(
//       "businessId"
//     );
//     if (!product) throw new Error("Couldnt find a product with that id");
//     directoryPath = path.join(
//       __dirname,
//       "..",
//       "images",
//       "products",
//       req.params.id
//     );
//     fs.readdir(directoryPath, (err, files) => {
//       if (err)
//         return res.status(400).json({
//           success: false,
//           msg: "Unable to scan directory! " + err.message,
//         });
//       const fullData = { ...product._doc, images: files };
//       res.json({ success: true, fullData });
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports.getOneProduct = async (req, res, next) => {
//   try {
//     const product = await Products.findOne({ _id: req.params.id });
//     if (!product) throw new Error("Couldnt find a product with that id");
//     directoryPath = path.join(
//       __dirname,
//       "..",
//       "images",
//       "products",
//       req.params.id
//     );
//     fs.readdir(directoryPath, (err, files) => {
//       if (err)
//         return res.status(400).json({
//           success: false,
//           msg: "Unable to scan directory! " + err.message,
//         });
//       let images = [];
//       files.forEach((file) => {
//         images.push(
//           path.join(__dirname, "..", "images", "products", req.params.id, file)
//         );
//       });
//       const fullData = { ...product._doc, images: images };
//       res.json({ success: true, fullData });
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.getProductImages = async (req, res, next) => {
//   try {
//     directoryPath = path.join(
//       __dirname,
//       "..",
//       "images",
//       "products",
//       req.params.id
//     );
//     fs.readdir(directoryPath, (err, files) => {
//       if (err)
//         return res.status(400).json({
//           success: false,
//           msg: "Unable to scan directory! " + err.message,
//         });
//       const imagesPaths = files.map((img) => `images/${req.params.id}/${img}`);
//       res.json({ success: true, imagesPath: imagesPaths[0] });
//     });
//   } catch (error) {
//     next(error);
//   }
// };

module.exports.deleteOneProduct = (req, res, next) => {
  if (
    req.role === "admin" ||
    (req.role === "business" && req.id == req.params.id)
  ) {
    Products.deleteOne({ _id: req.params.id })
      .then((data) => {
        res.status(200).json({ status: "success", message: "product deleted" });
      })
      .catch((err) => next(err));
  }
};

module.exports.checkForBusinessValidity = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const product = await Products.find({ _id: productId });
    if (product && product.businessId === req.id) next();
  } catch (err) {
    res.status(404).json({
      sucess: false,
      message: "something went wrong, please try again",
    });
  }
};

module.exports.deleteimage = (req, res, next) => {
  const productId = req.params.id;
  const imagePath = path.join(
    "images",
    "products",
    productId,
    req.body.imageName
  );
  fs.unlinkSync(imagePath, (err) => console.log("error : ", err));
};

module.exports.createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;

  const product = await Products.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.body.name,
      rating: Number(rating),
      comment,
      user: req.id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

exports.searchProduct = async (req, res, next) => {
  try {
    const searchQuery = req.query.q?.trim();
    if (!searchQuery) throw new Error("Search Query must not be empty.");

    const matchingProducts = await Products.find({
      name: { $regex: new RegExp(searchQuery, "i") },
    });

    if (!matchingProducts.length)
      throw new Error("Sorry! Couldnt find a product with that name");

    const maxPrice = findMaxPrice(matchingProducts);
    // res.json({ msg: "success", matchingProducts, maxPrice });

    ////
    getImages(matchingProducts).then((data) => {
      res.json({ msg: "success", matchingProducts: data, maxPrice });
    });
  } catch (error) {
    if (error.message.includes("empty")) error.status = 400;
    if (error.message.includes("Couldnt find")) error.status = 404;
    next(error);
  }
};

exports.filterProducts = async (req, res, next) => {
  try {
    const filterKey = Object.keys(req.query)[0]?.toLowerCase().trim();
    if (!filterKey)
      throw new Error("Filter criteria must be Category, Price or Rating");

    const filterValue = req.query[filterKey];
    if (!filterValue) throw new Error("Filter value must not be empty");

    let matchingProducts;
    switch (filterKey) {
      case "category":
        const matchingCategory = await Category.findOne(
          { name: req.query.category },
          { _id: 1 }
        );
        if (!matchingCategory)
          throw new Error("Couldnt find category with that name!");

        matchingProducts = await Products.find(
          {
            category: matchingCategory._id.toString(),
            name: { $regex: new RegExp(searchText, "i") },
          },
          { name: 1, price: 1, rating: 1 }
        );
        break;

      case "price":
        if (isNaN(req.query.price)) throw new Error("Price must be a number!");
        matchingProducts = await Products.find(
          {
            price: { $lte: req.query.price },
            name: { $regex: new RegExp(searchText, "i") },
          },
          { name: 1, price: 1, rating: 1 }
        );
        break;

      case "rating":
        if (isNaN(req.query.rating))
          throw new Error("Rating must be a number!");
        matchingProducts = await Products.find(
          {
            rating: req.query.rating,
            name: { $regex: new RegExp(searchText, "i") },
          },
          { name: 1, price: 1, rating: 1 }
        );
    }

    if (!matchingProducts.length)
      throw new Error("Couldnt find products with that filter value");

    const maxPrice = findMaxPrice(matchingProducts);
    res.json({ data: matchingProducts, maxPrice });
  } catch (error) {
    if (error.message.includes("Couldnt find")) error.status = 404;
    if (error.message.includes("must be")) error.status = 400;
    next(error);
  }
};

const findMaxPrice = (products) => {
  let maxPrice = Number.MIN_SAFE_INTEGER;
  products.forEach((product) => (maxPrice = Math.max(product.price, maxPrice)));
  return maxPrice;
};

module.exports.getTopProducts = asyncHandler(async (req, res) => {
  const products = await Products.find({}).sort({ rating: -1 }).limit(5);

  getImages(products).then((data) => {
    res.json({ msg: "success", data: data });
  });
});

exports.getLastAdded = async (req, res, next) => {
  try {
    const lastAdded = await Products.find(
      {},
      { _id: 1, name: 1, price: 1, category: 1, rating: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(5);

    getImages(lastAdded).then((data) => {
      res.json({ msg: "success", data: data });
    });
  } catch (error) {
    next(error);
  }
};

// exports.getRelatedProducts = async (req, res, next) => {
//   try {
//     const relatedProducts = await Products.find({
//       category: req.params.category,
//     })
//       .populate("businessId")
//       .limit(5);
//     if (!relatedProducts.length)
//       throw new Error("Couldnt find products in that category!");

//     res.json({ msg: "success", relatedProducts });
//   } catch (error) {
//     if (error.message.includes("Couldnt find")) error.status = 404;
//     next(error);
//   }

// 	try {
// 		let data = [];

// 		const lastAdded = await Products.find(
// 			{},
// 			{ _id: 1, name: 1, price: 1, category: 1, rating: 1, createdAt: 1 }
// 		)
// 			.sort({ createdAt: -1 })
// 			.limit(5);

// 		getImages(lastAdded).then((data) => {
// 			res.json({ msg: 'success', data: data });
// 		});
// 	} catch (error) {
// 		next(error);
// 	}
// };

exports.getRelatedProducts = async (req, res, next) => {
  try {
    const relatedProducts = await Products.find({
      category: req.params.category,
    })
      .populate("businessId")
      .limit(5);
    if (!relatedProducts.length)
      throw new Error("Couldnt find products in that category!");

    getImages(relatedProducts).then((data) => {
      res.json({ msg: "success", data: data });
    });
  } catch (error) {
    if (error.message.includes("Couldnt find")) error.status = 404;
    next(error);
  }
};

module.exports.getCategoryProducts = (req, res, next) => {
  Products.find({ category: req.params.id })
    .then((categoryProducts) => {
      // res.status(200).json({ msg: "success", data });

      ////
      getImages(categoryProducts).then((data) => {
        res.json({ msg: "success", data: data });
      });
    })
    .catch((error) => {
      error.status = 500;
      next(error);
    });
};

module.exports.getBusinessProducts = (req, res, next) => {
  Products.find({ businessId: req.params.id })
    .then((data) => {
      res.status(200).json({ msg: "success", data });
    })
    .catch((error) => {
      error.status = 500;
      next(error);
    });
};

async function getImages(data) {
  let newData = [];
  data.forEach(async (element) => {
    const filePath = path.join(
      __dirname,
      "..",
      "images",
      "products",
      element._id.toString()
    );
    let files = await readdir(filePath);
    let bitmap = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "images",
        "products",
        element._id.toString(),
        files[0]
      )
    );
    const image =
      "data:image/jpeg;base64," + Buffer.from(bitmap).toString("base64");
    newData.push({ ...element.toJSON(), image: image });
  });
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(newData);
    }, 1000);
  });
}
