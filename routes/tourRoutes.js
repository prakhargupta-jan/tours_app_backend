const {Router} = require('express')
const app = require("../app");
const { restrictTo, protect } = require("../controllers/authenticationController");
const {
	getAllTours,
	postTour,
	getTour,
	deleteTour,
	updateTour,
	top5bestCheapest,
	getTourStats,
	getMonthlyPlan
} = require("../controllers/tourController");
const tourRouter = Router();
tourRouter.use(protect);

tourRouter.route('/top-5-best-cheapest-tours').get(top5bestCheapest, getAllTours);
tourRouter.route('/monthly-plans').get(getMonthlyPlan);


tourRouter.route('/stats').get(restrictTo('guide', 'lead-guide', 'admin'), getTourStats)

tourRouter.route("/").get(getAllTours).post(restrictTo('guide', 'lead-guide'), postTour);

tourRouter.route("/:id").get(getTour).delete(restrictTo('lead-guide', 'admin'), deleteTour).put(restrictTo('lead-guide', 'admin'), updateTour);

module.exports = tourRouter