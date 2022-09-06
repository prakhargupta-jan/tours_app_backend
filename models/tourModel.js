const { default: mongoose } = require("mongoose");
const { default: slugify } = require("slugify");
const validator = require('validator')
const tourSchema = mongoose.Schema({
    name : {
        type: String,
        required: [true, 'A tour must have a name'],
        unique : true,
        trim : true,
        // validate: [validator.isAlpha, 'A tour name must only contain alphabets']
    },
    slug : String,
    duration: {
        type: Number, 
        required : [true, 'A tour must have a duration.']
    },
    maxGroupSize: {
        type :Number,
        required: [true, 'A tour must have a maximum group size']
    },
    difficulty: {
        type : String,
        required : [true, 'A tour must have some difficulty description.'],
        enum : {
            values: ['easy', 'medium', 'difficult'],
            message: 'A difficulty can only either be easy, medium or hard'
        }
    },
    ratingsAvg: {
        type : Number,
        default: 4.5,
        min: [1, 'Rating must be above 1'],
        max: [5, 'Rating must be less than 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price && val > 0;
            },
            // message: 'Discount should be less'
        }
    },
    summary: {
        type: String,
        required: [true, 'A tour must have some summary'],
        trim: true
    },
    description: {
        type: String,
        trim : true
    },
    imageCover: {
        type : String,
    },
    images: {
        type : [String],
    },
    createdAt: {
        type : Date,
        default: Date.now(),
        select: false
    },
    startDates: {
        type: [Date]
    },
    secretTour: {
        type: Boolean,
        default: false,
        select: false
    }
}, {
    toJSON : {virtuals: true},
    toObject: {virtuals: true}
})

tourSchema.virtual('durationWeeks').get(function () {
    return Math.round(this.duration/7);
})
tourSchema.pre(/save|insert/, function (next) {
    this.slug = slugify(this.name, {lower: true});
    next();
})
tourSchema.pre(/find/, function (next) {
    this.find({secretTour: {$ne: true}})
    next();
})
tourSchema.pre('aggregate', function(next) {
    this._pipeline.unshift({$match: {secretTour: {$ne: true}}})
    next();
})
const Tour = mongoose.model('Tours', tourSchema);
module.exports = Tour;