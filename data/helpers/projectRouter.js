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
            res.status(404).json({ errorMessage: "No projects"})
          }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: "Error getting projects"})
        })
})

router.get("/:id", (req, res) => {
    const {id} = req.params;

    Project.get(id)
        .then(project => {
            if(project) {
                res.status(200).json(project);
            } else {
                res.status(404).json({ errorMessage: `Client ${req.params.id} does not exist` })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ errorMessage: `No projects for ${req.params.id}`});
        });
})


router.get('/:id/actions', validateProjectId, (req, res) => {
    const {id} = req.params;
  
    Project.getProjectActions(id)
      .then(projects => {
        if(projects.length === 0) {
        res.status(400).json({ errorMessage: `Project ${req.params.id} has no action`})
        } else {
        res.status(200).json(projects);
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ errorMessage: `Can not get ${req.params.id}'s actions` });
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
              res.status(500).json({ errorMessage: `Could not access this project for ${req.params.id}` });
            })
        }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ errorMessage: "Can not update" })
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
            res.status(500).json({ errorMessage: "Saving error" });
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
          res.status(500).json({ errorMessage: "No action complete" })
        })
      });


router.delete('/:id', validateProjectId, (req, res) => {
    Project.remove(req.params.id)
      .then(() => {
          return res.status(200).json({ message: `Client ${req.params.id} is no more`})
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ errorMessage: `Client ${id}` });
      })
  });
  


// middleware to validate project and project id
function validateProject(req, res, next) {
    const {name, description} = req.body;
  
    if (description === "" || name === "") {
      return res.status(400).json({ errorMessage: "Must have text" });
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
        res.status(400).json({ errorMessage: `Client ${req.params.id} does not exist` })
      }
    })
  }


  function validateAction(req, res, next) {
    const {id: project_id} = req.params;
    const {description, notes} = req.body;
   
    if (!req.body || notes === "" && description === "") {
      return res.status(400).json({errorMessage: "Must have text" });
    }
    req.body = {project_id, description, notes};
    next();
   }

   
module.exports = router;