const express = require("express");
const Action = require("../helpers/actionModel.js");
const Project = require("../helpers/projectModel");


const router = express.Router();



router.get("/", (req, res) => {
    Action.get()
        .then(actions => {
            if(actions.length) {
                res.status(200).json(actions);
            } else {
                res.status(404).json({ errorMessage: "Sorry there are no current actions"})
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: "Sorry there was an error retrieving current actions"})
        })
})


router.get("/:id", (req, res) => {
    const {id} = req.params;

    Action.get(id)
        .then(action => {
            if(action) {
                res.status(200).json(action);
            } else {
                res.status(404).json({ errorMessage: `Sorry, ID #${req.params.id} does not exist` })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: `Oops, we couldn't retrieve ID #${req.params.id}'s actions`});
        });
})

router.put('/:id', validateActionId, validateAction, (req, res) => {
    const {id} = req.params;
    const actUpdate = req.body;
   
    Action.update(id, actUpdate)
      .then(changes => {
          if(changes) {
            Action.get(id)
              .then(changes => {
                res.status(200).json(changes);
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({ errorMessage: `Could not access this action by ID#: ${req.params.id}` });
              })
          }
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: "Could not update this action" })
          })
      });



router.post("/:id/actions",  validateActionForPost, validateActionId, (req, res) => {
    const newAction = req.body;
        
    Project.insert(newAction)
        .then(action => {
            res.status(201).json(action)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: "Woops! There was an error while saving this action" });
        })
     })

  
router.delete('/:id', validateActionId, (req, res) => {
    Action.remove(req.params.id)
       .then(() => {
            return res.status(200).json({ message: `Bye Felicia - ID #${req.params.id} is out`})
        })
        .catch(err => {
           console.log(err);
           res.status(500).json({ errorMessage: `You are stuck with ID #${id}, deal with it` });
        })
     });     


// middleware to validate actions


function validateActionId(req, res, next) {
    const {id} = req.params;
  
    Action.get(id)
    .then(actions => {
      if (actions) {
        req.actions = actions;
        next();
      } else {
        res.status(400).json({ errorMessage: `Action ID ${req.params.id} does not exist` })
      }
    })
  }

function validateActionForPost(req, res, next) {
    const {id: project_id} = req.params;
    const {description, notes} = req.body;
   
    if (!req.body) {
       return res.status(400).json({errorMessage: "Text fields cannot be empty" });
    }
    if (description.length > 128) {
        return res.status(400).json({errorMessage: "Please limit characters to 128" });
    }
    if (!notes) {
        return res.status(400).json({errorMessage: "Notes field cannot be empty" });
    }
    req.body = {project_id, description, notes};
    next();
   }


  function validateAction(req, res, next) {
    const {id} = req.params;
    const {description, notes} = req.body;
   
    if (!req.body) {
       return res.status(400).json({errorMessage: "Text fields cannot be empty" });
    }
    if (description.length > 128) {
        return res.status(400).json({errorMessage: "Please limit characters to 128" });
    }
    if (!notes) {
        return res.status(400).json({errorMessage: "Notes field cannot be empty" });
    }
    req.body = {id, description, notes};
    next();
   }
module.exports = router;