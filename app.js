import express from "express"
import bodyParser from "body-parser";
import mongoose from "mongoose";
import connectDB from "./db.js";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//config
connectDB()

const itemsSchema = new mongoose.Schema({
  name:
  {
    type: String,
    required: true
  }
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema)

const item1 = new Item({
  name: "Buy milk"
});

const item2 = new Item({
  name: "Brush your teeth"
});

const item3 = new Item({
  name: "Open your laptop"
});

const defaultItem = [item1, item2, item3];

app.get("/", function(req, res) {

  
Item.find().then((foundItems) => {
  if (foundItems.length === 0) {
    Item.insertMany(defaultItem).then((success) => {
      console.log("Data has been successfully saved")
    }).catch((err) => {
      console.log(err)
    })  
    res.redirect("/")
  }
  else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  } 
}).catch((err) => {
  console.log(err)
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const userItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    userItem.save();
    res.redirect("/")
  }else {
    List.findOne({name: listName}).then(function(foundList) {
      foundList.items.push(userItem);
      foundList.save();
      res.redirect("/" + listName)
    }).catch((err) =>{
      console.log(err)
    })
  }

  
 
});

app.post("/delete", (req, res) =>{
  const deleteItem_id = req.body.deleteItem;

  Item.findByIdAndRemove(deleteItem_id).then((success) => {
    console.log("Successfully deleted the selected item")
  }).catch((err) => {
    console.log(err)
  })

  res.redirect("/")
})

app.get("/:customListName", function(req,res){
  let customListName = req.params.customListName;
 
  List.findOne({name:customListName}).then(function (foundList) {
    
    if(!foundList) {
      // Create a new list
      
      const list = new List ({
        name: customListName,
        items: defaultItem

      })
    list.save()
    res.redirect("/" + customListName)
    }else{
      // Show the existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
    
  }).catch(function (err) {
      console.log(err)
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
