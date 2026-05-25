/* eslint-env node */

const fs = require('fs')
const mime = require('mime')
const multer = require('multer')

const path = require('path')

// const aws = require('aws-sdk')
// const S3_BUCKET = process.env.S3_BUCKET
// aws.config.region = process.env.AWS_REGION

// const s3 = new aws.S3()

// Set up Multer for local storage of project images
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const dir = './www/uploads/projects'
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true })
		}
		cb(null, dir)
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, uniqueSuffix + path.extname(file.originalname))
	}
})

const upload = multer({ storage: storage })

var Project = require('../models/project')

// Display list of all Projects.
exports.project_list = function (req, res) {
	Project.find({}).exec(function (err, list_projects) {
		if (err) {
			throw err
		}
		//Successful, so render
		res.render('gallery', {
			projects: list_projects
		})
		//res.send(list_projects);
	})
	//res.send('NOT IMPLEMENTED: Project list');
}

exports.project_edit = function (req, res) {
	// Project.find({})
	//     .exec(function (err, list_projects) {
	//         if (err) {
	//             throw err;
	//         }
	//Successful, so render
	res.render('edit-projects' /* , {
                projects: list_projects
            } */)
	//res.send(list_projects);
	// });
}

exports.project_list_api = function (req, res) {
	Project.find({}).exec(function (err, list_projects) {
		if (err) {
			throw err
		}
		res.send(list_projects)
	})
}

// Display detail page for a specific Project.
exports.project_detail = function (req, res) {
	Project.findById(req.params.id).exec(function (err, project) {
		if (err) {
			throw err
		}
		//Successful, so render
		//console.log(product)
		res.send(project)
		//res.send(list_products);
	})
}

// Handle Project create on POST.
exports.project_create_post = function (req, res) {
	// Create a new Project with provided data
	var project = new Project(req.body)

	// Use multer to handle optional image upload
	upload.single('image')(req, res, function (err) {
		if (err) {
			return res.status(500).send(err)
		}

		if (req.file) {
			const filePath = '/uploads/projects/' + req.file.filename
			project.images = [filePath]
		}

		project.save(function (err) {
			if (err) {
				return res.status(500).send(err)
			}
			// respond with created project (including image path)
			res.send(project)
		})
	})
}

// Handle Project delete on POST.
exports.project_delete_post = function (req, res) {
	Project.findById(req.params.id, function (err, data) {
		if (err) return res.status(500).send(err)
		if (!data) return res.status(404).send('Project not found')

		data.images.forEach(image => {
			const filename = image.split('/').slice(-1)[0]
			const filepath = './www/uploads/projects/' + filename
			if (fs.existsSync(filepath)) {
				try {
					fs.unlinkSync(filepath)
				} catch (e) {
					console.error('Error deleting file', filepath, e)
				}
			}
		})

		Project.findByIdAndRemove(req.params.id, function (err) {
			if (err) return res.status(500).send(err)
			return res.send(true)
		})
	})
}

// Handle Project update on POST.
exports.project_update_post = function (req, res) {
	// Update existing project with new data
	var updatedData = req.body

	upload.single('image')(req, res, function (err) {
		if (err) {
			return res.status(500).send(err)
		}

		if (req.file) {
			const filePath = '/uploads/projects/' + req.file.filename
			// Append or replace first image in array
			updatedData.$push = { images: filePath }
		}

		Project.findByIdAndUpdate(req.params.id, updatedData, { new: true }, function (err, proj) {
			if (err) {
				return res.status(500).send(err)
			}
			res.send(proj)
		})
	})
}

// Display detail image for a specific Enquiry.
exports.project_image_get = function (req, res) {
	Project.findById(req.params.id).exec(function (err, project) {
		if (err) {
			return res.status(500).send(err)
		}

		if (project && project.images && project.images.length > 0) {
			// Serve the first image file from local filesystem
			const imagePath = path.join(__dirname, '..', project.images[0])
			res.sendFile(imagePath, function (err) {
				if (err) {
					res.status(404).send('Image not found')
				}
			})
		} else {
			// fallback placeholder image
			res.sendFile(path.join(__dirname, '../www/images/background1.jpg'))
		}
	})
}

exports.project_sign_s3_put_get = (req, res) => {
	res.send(JSON.stringify({ signedRequest: '', url: '' }))
}

exports.project_s3_delete_get = (req, res) => {
	const filenameToRemove = req.query.fileName
	const filepath = './www/uploads/projects/' + filenameToRemove

	if (fs.existsSync(filepath)) {
		fs.unlink(filepath, (err) => {
			if (err) {
				console.error(err)
				return res.status(500).send(err)
			}
			res.send(true)
		})
	} else {
		res.send(true)
	}
}

// Local image upload endpoint
exports.project_image_upload_post = [
	upload.single('image'),
	function (req, res) {
		if (!req.file) {
			return res.status(400).send('No file uploaded')
		}
		// Store relative path in project.images array (single image for now)
		const filePath = '/uploads/projects/' + req.file.filename
		// Assume project ID is sent in body as projectId for association
		if (req.body.projectId) {
			Project.findByIdAndUpdate(req.body.projectId, { $push: { images: filePath } }, { new: true }, function (err, proj) {
				if (err) { return res.status(500).send(err) }
				res.send({ url: filePath, project: proj })
			})
		} else {
			res.send({ url: filePath })
		}
	}
]
