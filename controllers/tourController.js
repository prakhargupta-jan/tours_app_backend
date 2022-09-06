const req = require("express/lib/request");
const Tour = require("../models/tourModel");
const APIfeatures = require("../utils/APIfeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllTours = catchAsync(async (req, res) => {
	const data = await new APIfeatures(Tour.find(), req.query)
		.filter()
		.sort()
		.fields()
		.paginate().findQuery;
	res.status(200).json({
		status: "success",
		totalTours: data.length,
		data,
	});
});
exports.top5bestCheapest = (req, res, next) => {
	req.query = {
		sort: "-ratingsAvg price",
		page: "1",
		limit: "5",
	};
	next();
};
exports.getTourStats = catchAsync(async (req, res) => {
	const stats = await Tour.aggregate([
		{
			$match: { ratingsAvg: { $gte: 4.5 } },
		},
		{
			$group: {
				_id: { $toUpper: "$difficulty" },
				numRatings: { $sum: "$ratingsQuantity" },
				avgRating: { $avg: "$ratingsAvg" },
				avgPrice: { $avg: "$price" },
				maxPrice: { $max: "$price" },
				minPrice: { $min: "$price" },
				totalTours: { $sum: 1 },
			},
		},
		{
			$sort: { avgPrice: 1 },
		},
	]);
	res.status(200).json({
		status: "success",
		data: stats,
	});
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
	const plans = await Tour.aggregate([
		{
			$unwind: "$startDates",
		},
		{
			$group: {
				_id: { $month: "$startDates" },
				numTours: { $sum: 1 },
				tours: { $push: "$name" },
				avgDuration: { $avg: "$duration" },
				avgRating: { $avg: "$ratingsAvg" },
				ratingsQuantity: { $avg: "$ratingsQuantity" },
			},
		},
		{
			$sort: { _id: 1 },
		},
		{
			$addFields: {
				month: "$_id",
			},
		},
		{
			$project: {
				_id: 0,
			},
		},
	]);

	res.status(200).json({
		status: "success",
		data: plans,
	});
});
exports.getTour = catchAsync(async (req, res, next) => {
	const data = await Tour.findById(req.params.id);
    if (!data)
    return next(new AppError('No Tour found with that ID', 404))
	res.status(200).json({
		status: "success",
		data,
	});
});
exports.postTour = catchAsync(async (req, res) => {
	const data = await Tour.create(req.body);
	res.status(200).json({
		status: "success",
		data,
	});
});

exports.deleteTour = catchAsync(async (req, res) => {
	await Tour.findByIdAndDelete(req.params.id);
	res.status(200).json({
		status: "success",
		data: null,
	});
});

exports.updateTour = catchAsync(async (req, res) => {
	const data = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});
    if (!data)
    return next(new AppError('No Tour found with that ID', 404))

	res.status(200).json({
		status: "success",
		data: data,
	});
});
