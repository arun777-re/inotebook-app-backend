const express = require("express");
const fetchuser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");
const router = express.Router();
// Route1:get all the notes using "api/auth/fetchallnotes"
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// Route:2 adding all the notes using "api/notes/addnotes"
router.post(
  "/addnotes",
  fetchuser,
  [
    body("title", "enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const { title, description, tag } = req.body;
    //  if there are any error in validation then send bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();
      res.json(saveNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// Route:3 update  the note using "api/notes/updatenote" :login required

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  //    Create a new note object
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }

  // Find the note to be updated and update it
  let note = await Notes.findById(req.params.id);
  if (!note) {
    res.status(400).send("file note found");
  }
  if (note.user.toString() !== req.user.id) {
    return res.status(400).send("not authorised to update");
  }

  note =await Notes.findByIdAndUpdate(
    req.params.id,
    { $set: newNote },
    { new: true }
  );
  res.json(note);
});

// Route:4 delete a note "api/notes/deletenote/:id" login required
router.delete('/deletenote/:id',fetchuser,async(req,res)=>{
     let note =await Notes.findById(req.params.id);
     if(!note){
        return res.status(401).send("note did not found ")
     }
     if(note.user.toString() !== req.user.id){
        return res.status(401).send("not authenticated")
     }

     note = await Notes.findByIdAndDelete(req.params.id

     );
     res.json("note is deleted");
})

module.exports = router;
