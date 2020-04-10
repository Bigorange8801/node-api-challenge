const express = require("express");
const Project = require("../helpers/projectModel");
const Action = require("../helpers/actionModel.js"); 

const router = express.Router();


router.get("/", (req, res) => {
    Project.get()
        .then(projects => {
          if(projects.length) {
            res.status(200).json(projects);
          } else {
            res.status(404).json({ errorMessage: "Sorry there are no current projects"})
          }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: "Sorry there was an error retrieving current projects"})
        })
})

router.get("/:id", (req, res) => {
    const {id} = req.params;

    Project.get(id)
        .then(project => {
            if(project) {
                res.status(200).json(project);
            } else {
                res.status(404).json({ errorMessage: `Sorry, ID #${req.params.id} does not exist` })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: `Oops, we couldn't retrieve ID #${req.params.id}'s projects`});
        });
})


router.get('/:id/actions', validateProjectId, (req, res) => {
    const {id} = req.params;
  
    Project.getProjectActions(id)
      .then(projects => {
        if(projects.length === 0) {
        res.status(400).json({ errorMessage: `Sorry, Project ${req.params.id} has no actions yet`})
        } else {
        res.status(200).json(projects);
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ errorMessage: `Oops, we couldn't retrieve ID #${req.params.id}'s actions` });
      })
  });



router.put('/:id', validateProjectId, validateProject, (req, res) => {
  const {id} = req.params;
  const projUpdate = req.body;
 
  Project.update(id, projUpdate)
    .then(project => {
        if(project) {
          Project.get(id)
            .then(project => {
              res.status(200).json(project);
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({ errorMessage: `Could not access this project by ID#: ${req.params.id}` });
            })
        }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ errorMessage: "Could not update this project" })
        })
    });


router.post("/", validateProject, (req, res) => {
    const {name, description} = req.body;

   
    Project.insert({name, description})
        .then(project => {
            res.status(201).json(project)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: "Woops! There was an error while saving this project" });
        })
})


router.post('/:id/actions', validateProjectId, validateAction, (req, res) => {
    const newAction = req.body;
  
      Action.insert(newAction)
        .then(action => {
          res.status(201).json(action);
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ errorMessage: "No new actions for you" })
        })
      });


router.delete('/:id', validateProjectId, (req, res) => {
    Project.remove(req.params.id)
      .then(() => {
          return res.status(200).json({ message: `Bye Felicia - ID #${req.params.id} is out`})
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ errorMessage: `You are stuck with ID #${id}, deal with it` });
      })
  });
  


// middleware to validate project and project id
function validateProject(req, res, next) {
    const {name, description} = req.body;
  
    if (description === "" || name === "") {
      return res.status(400).json({ errorMessage: "Fields cannot be empty" });
    }
    req.body = {name, description};
    next();
  }

  function validateProjectId(req, res, next) {
    const {id} = req.params;
  
    Project.get(id)
    .then(project => {
      if (project) {
        req.project = project;
        next();
      } else {
        res.status(400).json({ errorMessage: `Project ID ${req.params.id} does not exist` })
      }
    })
  }


  function validateAction(req, res, next) {
    const {id: project_id} = req.params;
    const {description, notes} = req.body;
   
    if (!req.body || notes === "" && description === "") {
      return res.status(400).json({errorMessage: "Text fields cannot be empty" });
    }
    req.body = {project_id, description, notes};
    next();
   }

   
module.exports = router;